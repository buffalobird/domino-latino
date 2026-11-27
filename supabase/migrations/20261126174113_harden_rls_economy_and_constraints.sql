-- 1. OWASP API3/API6: Revoke direct client writes to economy & ledger tables
-- Clients can READ their own rows via RLS, but ALL mutations go through authoritative Edge Functions.
revoke insert, update, delete on public.user_progress from public, anon, authenticated;
revoke insert, update, delete on public.chip_ledger from public, anon, authenticated;

-- 2. OWASP API4 / CIS: Size & format constraints preventing payload abuse
alter table public.analytics_events
  add constraint analytics_event_name_len check (char_length(event_name) between 1 and 64),
  add constraint analytics_props_size check (pg_column_size(props) <= 2048);

alter table public.match_history
  add constraint match_client_id_len check (char_length(client_match_id) between 1 and 120);

alter table public.profiles
  add constraint profile_name_len check (char_length(display_name) between 1 and 40);

-- 3. Track turn start timestamp for server-enforced online turn timeouts
alter table public.game_rooms
  add column if not exists turn_started_at timestamptz not null default now();

-- 4. Server-only rate limiting table (zero client access)
create table if not exists public.api_rate_limits (
  user_id uuid not null,
  bucket text not null,
  window_start timestamptz not null,
  hit_count integer not null default 1,
  primary key (user_id, bucket)
);

revoke all on public.api_rate_limits from public, anon, authenticated;
alter table public.api_rate_limits enable row level security;

-- 5. Atomic server-only RPC helpers (SECURITY INVOKER + service_role ONLY -> zero Security Advisor warnings)
create or replace function public.srv_check_rate_limit(
  p_user_id uuid,
  p_bucket text,
  p_max_hits integer,
  p_window_seconds integer
)
returns boolean
language plpgsql
set search_path = ''
as $$
declare
  v_now timestamptz := now();
  v_row public.api_rate_limits%rowtype;
begin
  select * into v_row
  from public.api_rate_limits
  where user_id = p_user_id and bucket = p_bucket
  for update;

  if not found then
    insert into public.api_rate_limits (user_id, bucket, window_start, hit_count)
    values (p_user_id, p_bucket, v_now, 1);
    return true;
  end if;

  if v_now - v_row.window_start > make_interval(secs => p_window_seconds) then
    update public.api_rate_limits
    set window_start = v_now, hit_count = 1
    where user_id = p_user_id and bucket = p_bucket;
    return true;
  end if;

  if v_row.hit_count >= p_max_hits then
    return false;
  end if;

  update public.api_rate_limits
  set hit_count = v_row.hit_count + 1
  where user_id = p_user_id and bucket = p_bucket;
  return true;
end;
$$;

revoke all on function public.srv_check_rate_limit(uuid, text, integer, integer) from public, anon, authenticated;
grant execute on function public.srv_check_rate_limit(uuid, text, integer, integer) to service_role;

-- Atomic row-locked chip adjustment (prevents double-spend race conditions on simultaneous requests)
create or replace function public.srv_adjust_club_chips(
  p_user_id uuid,
  p_delta integer,
  p_reason text,
  p_ref text default null
)
returns integer
language plpgsql
set search_path = ''
as $$
declare
  v_cur integer;
  v_next integer;
begin
  insert into public.user_progress (user_id)
  values (p_user_id)
  on conflict (user_id) do nothing;

  select club_chips into v_cur
  from public.user_progress
  where user_id = p_user_id
  for update;

  v_next := v_cur + p_delta;
  if v_next < 0 then
    raise exception 'INSUFFICIENT_CHIPS';
  end if;

  update public.user_progress
  set club_chips = v_next
  where user_id = p_user_id;

  if p_delta <> 0 then
    insert into public.chip_ledger (user_id, delta, reason, reference_id)
    values (p_user_id, p_delta, p_reason, p_ref);
  end if;

  return v_next;
end;
$$;

revoke all on function public.srv_adjust_club_chips(uuid, integer, text, text) from public, anon, authenticated;
grant execute on function public.srv_adjust_club_chips(uuid, integer, text, text) to service_role;

-- Atomic 7-day escalating daily reward claim (server-authoritative date & schedule)
create or replace function public.srv_claim_daily_reward(
  p_user_id uuid,
  p_today text
)
returns jsonb
language plpgsql
set search_path = ''
as $$
declare
  v_schedule integer[] := array[100, 150, 200, 300, 400, 500, 1000];
  v_row public.user_progress%rowtype;
  v_day_idx integer;
  v_awarded integer;
  v_next_streak integer;
begin
  insert into public.user_progress (user_id)
  values (p_user_id)
  on conflict (user_id) do nothing;

  select * into v_row
  from public.user_progress
  where user_id = p_user_id
  for update;

  if v_row.last_daily_claim_date = p_today then
    return jsonb_build_object('awarded', 0, 'club_chips', v_row.club_chips, 'daily_claim_streak', v_row.daily_claim_streak);
  end if;

  v_day_idx := (v_row.daily_claim_streak % 7) + 1; -- 1-based Postgres array
  v_awarded := v_schedule[v_day_idx];
  v_next_streak := case when v_day_idx >= 7 then 0 else v_day_idx end;

  update public.user_progress
  set club_chips = v_row.club_chips + v_awarded,
      daily_claim_streak = v_next_streak,
      last_daily_claim_date = p_today
  where user_id = p_user_id;

  insert into public.chip_ledger (user_id, delta, reason, reference_id)
  values (p_user_id, v_awarded, 'daily_reward_7d', p_today);

  return jsonb_build_object(
    'awarded', v_awarded,
    'club_chips', v_row.club_chips + v_awarded,
    'daily_claim_streak', v_next_streak,
    'last_daily_claim_date', p_today
  );
end;
$$;

revoke all on function public.srv_claim_daily_reward(uuid, text) from public, anon, authenticated;
grant execute on function public.srv_claim_daily_reward(uuid, text) to service_role;

-- Atomic free refill (only when balance < 200)
create or replace function public.srv_free_refill(p_user_id uuid)
returns jsonb
language plpgsql
set search_path = ''
as $$
declare
  v_cur integer;
begin
  insert into public.user_progress (user_id)
  values (p_user_id)
  on conflict (user_id) do nothing;

  select club_chips into v_cur
  from public.user_progress
  where user_id = p_user_id
  for update;

  if v_cur >= 200 then
    return jsonb_build_object('awarded', 0, 'club_chips', v_cur);
  end if;

  update public.user_progress
  set club_chips = v_cur + 300
  where user_id = p_user_id;

  insert into public.chip_ledger (user_id, delta, reason)
  values (p_user_id, 300, 'free_club_refill');

  return jsonb_build_object('awarded', 300, 'club_chips', v_cur + 300);
end;
$$;

revoke all on function public.srv_free_refill(uuid) from public, anon, authenticated;
grant execute on function public.srv_free_refill(uuid) to service_role;

-- Atomic cosmetic theme unlock/equip (server enforces prices)
create or replace function public.srv_unlock_or_equip_theme(
  p_user_id uuid,
  p_theme text
)
returns jsonb
language plpgsql
set search_path = ''
as $$
declare
  v_cost integer;
  v_row public.user_progress%rowtype;
  v_new_themes text[];
begin
  if p_theme = 'caribe' then v_cost := 0;
  elsif p_theme = 'caoba' then v_cost := 600;
  elsif p_theme = 'esmeralda' then v_cost := 1200;
  else raise exception 'INVALID_THEME';
  end if;

  insert into public.user_progress (user_id)
  values (p_user_id)
  on conflict (user_id) do nothing;

  select * into v_row
  from public.user_progress
  where user_id = p_user_id
  for update;

  if p_theme = any(v_row.unlocked_themes) then
    update public.user_progress
    set equipped_theme = p_theme
    where user_id = p_user_id;

    return jsonb_build_object(
      'club_chips', v_row.club_chips,
      'equipped_theme', p_theme,
      'unlocked_themes', v_row.unlocked_themes
    );
  end if;

  if v_row.club_chips < v_cost then
    raise exception 'INSUFFICIENT_CHIPS';
  end if;

  v_new_themes := array_append(v_row.unlocked_themes, p_theme);

  update public.user_progress
  set club_chips = v_row.club_chips - v_cost,
      equipped_theme = p_theme,
      unlocked_themes = v_new_themes
  where user_id = p_user_id;

  if v_cost > 0 then
    insert into public.chip_ledger (user_id, delta, reason, reference_id)
    values (p_user_id, -v_cost, 'cosmetic_theme_unlock', p_theme);
  end if;

  return jsonb_build_object(
    'club_chips', v_row.club_chips - v_cost,
    'equipped_theme', p_theme,
    'unlocked_themes', v_new_themes
  );
end;
$$;

revoke all on function public.srv_unlock_or_equip_theme(uuid, text) from public, anon, authenticated;
grant execute on function public.srv_unlock_or_equip_theme(uuid, text) to service_role;

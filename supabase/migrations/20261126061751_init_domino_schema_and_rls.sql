create schema if not exists private;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default 'Jugador',
  avatar_url text,
  preferred_mode text not null default '1v1'
    check (preferred_mode in ('1v1', '2v2', '4ffa')),
  preferred_target_score integer not null default 100
    check (preferred_target_score in (50, 100, 150, 200, 250, 300)),
  preferred_bot_speed text not null default 'normal'
    check (preferred_bot_speed in ('fast', 'normal', 'relaxed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.user_progress (
  user_id uuid primary key references auth.users(id) on delete cascade,
  daily_date text not null default to_char(now() at time zone 'UTC', 'YYYY-MM-DD'),
  daily_stars integer not null default 0 check (daily_stars between 0 and 3),
  win_streak integer not null default 0 check (win_streak >= 0),
  best_streak integer not null default 0 check (best_streak >= 0),
  total_wins integer not null default 0 check (total_wins >= 0),
  total_matches integer not null default 0 check (total_matches >= 0),
  updated_at timestamptz not null default now()
);

create table if not exists public.match_history (
  id uuid primary key default gen_random_uuid(),
  client_match_id text not null,
  user_id uuid not null references auth.users(id) on delete cascade,
  mode text not null check (mode in ('1v1', '2v2', '4ffa')),
  target_score integer not null check (target_score in (50, 100, 150, 200, 250, 300)),
  human_won boolean not null,
  hands_played integer not null check (hands_played > 0),
  final_scores jsonb not null,
  played_at timestamptz not null default now(),
  constraint match_history_user_client_unique unique (user_id, client_match_id)
);

create index if not exists match_history_user_played_idx
  on public.match_history (user_id, played_at desc);

revoke all on public.profiles from anon;
revoke all on public.user_progress from anon;
revoke all on public.match_history from anon;

grant select, insert, update on public.profiles to authenticated;
grant select, insert, update on public.user_progress to authenticated;
grant select, insert on public.match_history to authenticated;

alter table public.profiles enable row level security;
alter table public.user_progress enable row level security;
alter table public.match_history enable row level security;

create policy "Users can view own profile"
  on public.profiles for select
  to authenticated
  using ((select auth.uid()) = id);

create policy "Users can insert own profile"
  on public.profiles for insert
  to authenticated
  with check ((select auth.uid()) = id);

create policy "Users can update own profile"
  on public.profiles for update
  to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

create policy "Users can view own progress"
  on public.user_progress for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "Users can insert own progress"
  on public.user_progress for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Users can update own progress"
  on public.user_progress for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Users can view own match history"
  on public.match_history for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "Users can insert own match history"
  on public.match_history for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create or replace function private.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_name text;
  v_avatar text;
begin
  v_name := coalesce(
    nullif(trim(new.raw_user_meta_data->>'full_name'), ''),
    nullif(trim(new.raw_user_meta_data->>'name'), ''),
    'Jugador'
  );
  v_avatar := nullif(trim(new.raw_user_meta_data->>'avatar_url'), '');

  insert into public.profiles (id, display_name, avatar_url)
  values (new.id, v_name, v_avatar)
  on conflict (id) do nothing;

  insert into public.user_progress (user_id)
  values (new.id)
  on conflict (user_id) do nothing;

  return new;
end;
$$;

revoke execute on function private.handle_new_user() from public, anon, authenticated;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function private.handle_new_user();

create or replace function private.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

revoke execute on function private.set_updated_at() from public, anon, authenticated;

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function private.set_updated_at();

create trigger user_progress_set_updated_at
  before update on public.user_progress
  for each row execute function private.set_updated_at();

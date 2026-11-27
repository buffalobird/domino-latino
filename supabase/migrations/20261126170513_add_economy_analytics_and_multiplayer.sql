-- 1. Extend user_progress with Soft Currency (Fichas de Club), XP/Level, 7-day Daily Reward & Cosmetics
alter table public.user_progress
  add column if not exists club_chips integer not null default 1000 check (club_chips >= 0),
  add column if not exists xp integer not null default 0 check (xp >= 0),
  add column if not exists level integer not null default 1 check (level >= 1),
  add column if not exists daily_claim_streak integer not null default 0 check (daily_claim_streak between 0 and 7),
  add column if not exists last_daily_claim_date text,
  add column if not exists equipped_theme text not null default 'caribe'
    check (equipped_theme in ('caribe', 'caoba', 'esmeralda')),
  add column if not exists unlocked_themes text[] not null default array['caribe'];

-- 2. Immutable soft-currency ledger (audit trail for chips earned/spent/wagered in soft-currency salons)
create table if not exists public.chip_ledger (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  delta integer not null,
  reason text not null,
  reference_id text,
  created_at timestamptz not null default now()
);

create index if not exists chip_ledger_user_created_idx
  on public.chip_ledger (user_id, created_at desc);

revoke all on public.chip_ledger from anon;
grant select, insert on public.chip_ledger to authenticated;
alter table public.chip_ledger enable row level security;

create policy "Users can view own chip ledger"
  on public.chip_ledger for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "Users can insert own chip ledger"
  on public.chip_ledger for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

-- 3. Minimal Analytics Events (Comparative Report O1 / DL-01)
create table if not exists public.analytics_events (
  id bigint generated always as identity primary key,
  user_id uuid references auth.users(id) on delete set null,
  session_id text not null,
  event_name text not null,
  props jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists analytics_events_created_idx
  on public.analytics_events (created_at desc);

revoke all on public.analytics_events from anon;
grant insert on public.analytics_events to authenticated;
alter table public.analytics_events enable row level security;

create policy "Authenticated users can insert own analytics events"
  on public.analytics_events for insert
  to authenticated
  with check ((select auth.uid()) = user_id or user_id is null);

-- 4. Online Multiplayer Rooms (Public Lobby + Private Code Rooms)
create table if not exists public.game_rooms (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  host_user_id uuid not null references auth.users(id) on delete cascade,
  mode text not null check (mode in ('1v1', '2v2', '4ffa')),
  target_score integer not null check (target_score in (50, 100, 150, 200, 250, 300)),
  is_private boolean not null default false,
  -- Soft-currency buy-in: ALWAYS 0 on private rooms (anti-chip-dumping compliance rule)
  buy_in integer not null default 0 check (buy_in in (0, 100, 500, 1000)),
  status text not null default 'waiting' check (status in ('waiting', 'playing', 'finished')),
  max_players integer not null check (max_players in (2, 4)),
  player_count integer not null default 1 check (player_count between 0 and 4),
  -- Sanitized public game state (never contains opponents' hidden hands or boneyard tile IDs)
  public_state jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint private_rooms_zero_buy_in check (not is_private or buy_in = 0)
);

create index if not exists game_rooms_lobby_idx
  on public.game_rooms (status, is_private, created_at desc);

-- 5. Seated Players inside a Room (publicly readable by authenticated users in lobby)
create table if not exists public.room_players (
  room_id uuid not null references public.game_rooms(id) on delete cascade,
  seat integer not null check (seat between 0 and 3),
  user_id uuid references auth.users(id) on delete set null,
  display_name text not null,
  is_bot boolean not null default false,
  joined_at timestamptz not null default now(),
  primary key (room_id, seat)
);

create index if not exists room_players_user_idx
  on public.room_players (user_id);

-- 6. Private Per-Player Secret Hand (STRICT RLS: each user can ONLY read their own tiles!)
create table if not exists public.room_player_hands (
  room_id uuid not null references public.game_rooms(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  seat integer not null check (seat between 0 and 3),
  hand jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now(),
  primary key (room_id, user_id)
);

-- 7. Authoritative Full Room State (private schema: ZERO client access; Edge Function service role only)
create table if not exists private.room_states (
  room_id uuid primary key references public.game_rooms(id) on delete cascade,
  full_state jsonb not null,
  updated_at timestamptz not null default now()
);

revoke all on public.game_rooms from anon;
revoke all on public.room_players from anon;
revoke all on public.room_player_hands from anon;

grant select on public.game_rooms to authenticated;
grant select on public.room_players to authenticated;
grant select on public.room_player_hands to authenticated;

alter table public.game_rooms enable row level security;
alter table public.room_players enable row level security;
alter table public.room_player_hands enable row level security;

-- Authenticated players can browse open public rooms, or view any room they are seated in (or host)
create policy "Authenticated users can view public waiting rooms or own rooms"
  on public.game_rooms for select
  to authenticated
  using (
    (not is_private and status = 'waiting')
    or host_user_id = (select auth.uid())
    or exists (
      select 1 from public.room_players rp
      where rp.room_id = id and rp.user_id = (select auth.uid())
    )
  );

-- Authenticated users can view seats of visible rooms
create policy "Authenticated users can view seats of visible rooms"
  on public.room_players for select
  to authenticated
  using (
    exists (
      select 1 from public.game_rooms r
      where r.id = room_id
        and (
          (not r.is_private and r.status = 'waiting')
          or r.host_user_id = (select auth.uid())
          or exists (
            select 1 from public.room_players rp2
            where rp2.room_id = r.id and rp2.user_id = (select auth.uid())
          )
        )
    )
  );

-- STRICT: Players can ONLY read their own secret domino tiles!
create policy "Players can only read own secret hand"
  on public.room_player_hands for select
  to authenticated
  using ((select auth.uid()) = user_id);

-- Triggers for updated_at
create trigger game_rooms_set_updated_at
  before update on public.game_rooms
  for each row execute function private.set_updated_at();

create trigger room_player_hands_set_updated_at
  before update on public.room_player_hands
  for each row execute function private.set_updated_at();

-- Enable Supabase Realtime on multiplayer tables
alter publication supabase_realtime add table public.game_rooms;
alter publication supabase_realtime add table public.room_players;
alter publication supabase_realtime add table public.room_player_hands;

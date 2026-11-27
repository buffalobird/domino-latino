-- Server-only authoritative room state accessible exclusively via service_role in Edge Functions
create table if not exists public.room_states (
  room_id uuid primary key references public.game_rooms(id) on delete cascade,
  full_state jsonb not null,
  updated_at timestamptz not null default now()
);

revoke all on public.room_states from public, anon, authenticated;
alter table public.room_states enable row level security;

create trigger room_states_set_updated_at
  before update on public.room_states
  for each row execute function private.set_updated_at();

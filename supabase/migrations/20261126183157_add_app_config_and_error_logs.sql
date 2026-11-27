create table if not exists public.app_config (
  id text primary key default 'global' check (id = 'global'),
  min_supported_version text not null default '1.0.0' check (char_length(min_supported_version) <= 24),
  online_enabled boolean not null default true,
  maintenance_banner text check (maintenance_banner is null or char_length(maintenance_banner) <= 240),
  force_update_message text not null default 'Hay una nueva versión disponible de Dominó Latino. Actualiza la app para continuar.' check (char_length(force_update_message) <= 240),
  updated_at timestamptz not null default now()
);

insert into public.app_config (id)
values ('global')
on conflict (id) do nothing;

revoke insert, update, delete on public.app_config from public, anon, authenticated;

alter table public.app_config enable row level security;

create policy app_config_select_public
  on public.app_config
  for select
  to anon, authenticated
  using (id = 'global');

create table if not exists public.app_error_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  error_name text not null check (char_length(error_name) <= 120),
  error_message text not null check (char_length(error_message) <= 600),
  component_stack text check (component_stack is null or char_length(component_stack) <= 2000),
  platform text not null check (char_length(platform) <= 24),
  app_version text not null default '1.0.0' check (char_length(app_version) <= 24),
  created_at timestamptz not null default now()
);

create index if not exists app_error_logs_created_idx
  on public.app_error_logs (created_at desc);

create index if not exists app_error_logs_user_idx
  on public.app_error_logs (user_id);

alter table public.app_error_logs enable row level security;

create policy app_error_logs_insert_authenticated
  on public.app_error_logs
  for insert
  to authenticated
  with check (user_id = (select auth.uid()));

create policy app_error_logs_insert_anon
  on public.app_error_logs
  for insert
  to anon
  with check (user_id is null);

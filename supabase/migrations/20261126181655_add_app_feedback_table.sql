create table if not exists public.app_feedback (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  category text not null check (category in ('bug', 'ux', 'idea')),
  message text not null check (char_length(btrim(message)) between 5 and 500),
  platform text not null check (char_length(platform) <= 24),
  app_version text not null default '1.0.0' check (char_length(app_version) <= 24),
  created_at timestamptz not null default now()
);

create index if not exists app_feedback_created_idx
  on public.app_feedback (created_at desc);

create index if not exists app_feedback_user_idx
  on public.app_feedback (user_id);

alter table public.app_feedback enable row level security;

create policy app_feedback_insert_authenticated
  on public.app_feedback
  for insert
  to authenticated
  with check (user_id = (select auth.uid()));

create policy app_feedback_insert_anon
  on public.app_feedback
  for insert
  to anon
  with check (user_id is null);

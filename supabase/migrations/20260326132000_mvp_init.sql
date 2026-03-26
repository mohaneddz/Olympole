create extension if not exists "pgcrypto";

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'app_role') THEN
    CREATE TYPE app_role AS ENUM ('admin', 'participant', 'viewer');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'registration_status') THEN
    CREATE TYPE registration_status AS ENUM ('pending', 'approved', 'rejected');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'event_type') THEN
    CREATE TYPE event_type AS ENUM ('sport', 'culture', 'ceremony', 'mini_game');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'event_status') THEN
    CREATE TYPE event_status AS ENUM ('draft', 'scheduled', 'live', 'completed', 'cancelled');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'match_status') THEN
    CREATE TYPE match_status AS ENUM ('scheduled', 'live', 'completed');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'submission_status') THEN
    CREATE TYPE submission_status AS ENUM ('draft', 'published', 'rejected');
  END IF;
END $$;

create table if not exists public.admin_emails (
  email text primary key,
  created_at timestamptz not null default now()
);

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  email text not null unique,
  role app_role not null default 'participant',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  type event_type not null,
  category text not null,
  venue text not null,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  status event_status not null default 'draft',
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.matches (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  sport text not null,
  team_a text not null,
  team_b text not null,
  score_a integer not null default 0,
  score_b integer not null default 0,
  status match_status not null default 'scheduled',
  round text not null,
  venue text not null,
  starts_at timestamptz not null,
  updated_at timestamptz not null default now()
);

create table if not exists public.results (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  participant_or_team_name text not null,
  placement integer not null check (placement > 0),
  medal text,
  score_summary text,
  published_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.registrations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  full_name text not null,
  email text not null,
  phone text not null,
  department_or_school text not null,
  category_type text not null,
  event_id uuid not null references public.events(id) on delete cascade,
  team_name text,
  additional_notes text,
  status registration_status not null default 'pending',
  created_at timestamptz not null default now(),
  unique(email, event_id)
);

create table if not exists public.predictions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  match_id uuid not null references public.matches(id) on delete cascade,
  predicted_winner text not null,
  points_awarded integer,
  created_at timestamptz not null default now(),
  unique(user_id, match_id)
);

create table if not exists public.writing_submissions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  content text not null,
  category text not null,
  status submission_status not null default 'draft',
  is_featured boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.submission_votes (
  id uuid primary key default gen_random_uuid(),
  submission_id uuid not null references public.writing_submissions(id) on delete cascade,
  voter_user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique(submission_id, voter_user_id)
);

create table if not exists public.app_settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);

create table if not exists public.admin_activity_logs (
  id uuid primary key default gen_random_uuid(),
  admin_user_id uuid not null references auth.users(id) on delete cascade,
  action text not null,
  entity_type text not null,
  entity_id text,
  payload jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_events_status_starts_at on public.events(status, starts_at);
create index if not exists idx_matches_status_starts_at on public.matches(status, starts_at);
create index if not exists idx_registrations_created_at on public.registrations(created_at desc);
create index if not exists idx_results_published_at on public.results(published_at);
create index if not exists idx_writing_status_created_at on public.writing_submissions(status, created_at desc);
create index if not exists idx_predictions_match_id on public.predictions(match_id);

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

DROP TRIGGER IF EXISTS trg_profiles_touch_updated_at ON public.profiles;
create trigger trg_profiles_touch_updated_at
before update on public.profiles
for each row execute procedure public.touch_updated_at();

DROP TRIGGER IF EXISTS trg_events_touch_updated_at ON public.events;
create trigger trg_events_touch_updated_at
before update on public.events
for each row execute procedure public.touch_updated_at();

DROP TRIGGER IF EXISTS trg_matches_touch_updated_at ON public.matches;
create trigger trg_matches_touch_updated_at
before update on public.matches
for each row execute procedure public.touch_updated_at();

DROP TRIGGER IF EXISTS trg_writing_touch_updated_at ON public.writing_submissions;
create trigger trg_writing_touch_updated_at
before update on public.writing_submissions
for each row execute procedure public.touch_updated_at();

create or replace function public.is_admin(uid uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles where id = uid and role = 'admin'
  );
$$;

create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  role_value app_role := 'participant';
begin
  if exists (select 1 from public.admin_emails where email = lower(new.email)) then
    role_value := 'admin';
  end if;

  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    lower(coalesce(new.email, new.id::text || '@unknown.local')),
    coalesce(new.raw_user_meta_data->>'full_name', null),
    role_value
  )
  on conflict (id) do update set
    email = excluded.email,
    full_name = coalesce(excluded.full_name, public.profiles.full_name),
    role = excluded.role,
    updated_at = now();

  return new;
end;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_auth_user();

alter table public.admin_emails enable row level security;
alter table public.profiles enable row level security;
alter table public.events enable row level security;
alter table public.matches enable row level security;
alter table public.results enable row level security;
alter table public.registrations enable row level security;
alter table public.predictions enable row level security;
alter table public.writing_submissions enable row level security;
alter table public.submission_votes enable row level security;
alter table public.app_settings enable row level security;
alter table public.admin_activity_logs enable row level security;

-- Profiles
DROP POLICY IF EXISTS profiles_read_own ON public.profiles;
create policy profiles_read_own on public.profiles
for select to authenticated
using (id = auth.uid() or public.is_admin(auth.uid()));

DROP POLICY IF EXISTS profiles_update_own ON public.profiles;
create policy profiles_update_own on public.profiles
for update to authenticated
using (id = auth.uid() or public.is_admin(auth.uid()))
with check (id = auth.uid() or public.is_admin(auth.uid()));

-- Events / matches / results public read and admin write
DROP POLICY IF EXISTS events_public_read ON public.events;
create policy events_public_read on public.events
for select to anon, authenticated
using (status in ('scheduled', 'live', 'completed'));

DROP POLICY IF EXISTS events_admin_all ON public.events;
create policy events_admin_all on public.events
for all to authenticated
using (public.is_admin(auth.uid()))
with check (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS matches_public_read ON public.matches;
create policy matches_public_read on public.matches
for select to anon, authenticated
using (true);

DROP POLICY IF EXISTS matches_admin_all ON public.matches;
create policy matches_admin_all on public.matches
for all to authenticated
using (public.is_admin(auth.uid()))
with check (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS results_public_read ON public.results;
create policy results_public_read on public.results
for select to anon, authenticated
using (published_at is not null);

DROP POLICY IF EXISTS results_admin_all ON public.results;
create policy results_admin_all on public.results
for all to authenticated
using (public.is_admin(auth.uid()))
with check (public.is_admin(auth.uid()));

-- Registrations
DROP POLICY IF EXISTS registrations_public_insert ON public.registrations;
create policy registrations_public_insert on public.registrations
for insert to anon, authenticated
with check (true);

DROP POLICY IF EXISTS registrations_read_own ON public.registrations;
create policy registrations_read_own on public.registrations
for select to authenticated
using (user_id = auth.uid() or public.is_admin(auth.uid()));

DROP POLICY IF EXISTS registrations_admin_update ON public.registrations;
create policy registrations_admin_update on public.registrations
for update to authenticated
using (public.is_admin(auth.uid()))
with check (public.is_admin(auth.uid()));

-- Predictions
DROP POLICY IF EXISTS predictions_read_own_or_admin ON public.predictions;
create policy predictions_read_own_or_admin on public.predictions
for select to authenticated
using (user_id = auth.uid() or public.is_admin(auth.uid()));

DROP POLICY IF EXISTS predictions_insert_own ON public.predictions;
create policy predictions_insert_own on public.predictions
for insert to authenticated
with check (user_id = auth.uid());

DROP POLICY IF EXISTS predictions_update_own_or_admin ON public.predictions;
create policy predictions_update_own_or_admin on public.predictions
for update to authenticated
using (user_id = auth.uid() or public.is_admin(auth.uid()))
with check (user_id = auth.uid() or public.is_admin(auth.uid()));

-- Writing and votes
DROP POLICY IF EXISTS writing_public_read ON public.writing_submissions;
create policy writing_public_read on public.writing_submissions
for select to anon, authenticated
using (status = 'published' or user_id = auth.uid() or public.is_admin(auth.uid()));

DROP POLICY IF EXISTS writing_insert_own ON public.writing_submissions;
create policy writing_insert_own on public.writing_submissions
for insert to authenticated
with check (user_id = auth.uid());

DROP POLICY IF EXISTS writing_update_own_or_admin ON public.writing_submissions;
create policy writing_update_own_or_admin on public.writing_submissions
for update to authenticated
using (user_id = auth.uid() or public.is_admin(auth.uid()))
with check (user_id = auth.uid() or public.is_admin(auth.uid()));

DROP POLICY IF EXISTS votes_public_read ON public.submission_votes;
create policy votes_public_read on public.submission_votes
for select to anon, authenticated
using (true);

DROP POLICY IF EXISTS votes_insert_own ON public.submission_votes;
create policy votes_insert_own on public.submission_votes
for insert to authenticated
with check (voter_user_id = auth.uid());

-- Admin tables
DROP POLICY IF EXISTS app_settings_public_read ON public.app_settings;
create policy app_settings_public_read on public.app_settings
for select to anon, authenticated
using (true);

DROP POLICY IF EXISTS app_settings_admin_manage ON public.app_settings;
create policy app_settings_admin_manage on public.app_settings
for all to authenticated
using (public.is_admin(auth.uid()))
with check (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS admin_logs_admin_read ON public.admin_activity_logs;
create policy admin_logs_admin_read on public.admin_activity_logs
for select to authenticated
using (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS admin_logs_admin_insert ON public.admin_activity_logs;
create policy admin_logs_admin_insert on public.admin_activity_logs
for insert to authenticated
with check (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS admin_emails_admin_manage ON public.admin_emails;
create policy admin_emails_admin_manage on public.admin_emails
for all to authenticated
using (public.is_admin(auth.uid()))
with check (public.is_admin(auth.uid()));

insert into public.app_settings (key, value)
values
  ('registration_enabled', 'true'::jsonb),
  ('predictions_enabled', 'true'::jsonb),
  ('writing_enabled', 'true'::jsonb)
on conflict (key) do nothing;

create extension if not exists "pgcrypto";

alter table public.registrations
  add column if not exists activity_slug text,
  add column if not exists previous_experience text,
  add column if not exists motivation text,
  add column if not exists availability_date date,
  add column if not exists preferred_role text,
  add column if not exists registration_details jsonb not null default '{}'::jsonb,
  add column if not exists team_id uuid references public.teams(id) on delete set null;

create index if not exists idx_registrations_activity_slug on public.registrations (activity_slug);
create index if not exists idx_registrations_team_id on public.registrations (team_id);

create table if not exists public.team_memberships (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references public.teams(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  role text not null default 'player',
  created_at timestamptz not null default now(),
  unique(team_id, profile_id)
);

create index if not exists idx_team_memberships_team_id on public.team_memberships (team_id);
create index if not exists idx_team_memberships_profile_id on public.team_memberships (profile_id);

create table if not exists public.tournaments (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  sport_id uuid references public.sports(id) on delete set null,
  event_id uuid references public.events(id) on delete set null,
  format text not null default 'knockout',
  status text not null default 'draft',
  starts_at timestamptz,
  notes text,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'tournaments_status_check'
      and conrelid = 'public.tournaments'::regclass
  ) then
    alter table public.tournaments
    add constraint tournaments_status_check
    check (status in ('draft', 'scheduled', 'live', 'completed', 'cancelled'));
  end if;
end $$;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'tournaments_format_check'
      and conrelid = 'public.tournaments'::regclass
  ) then
    alter table public.tournaments
    add constraint tournaments_format_check
    check (format in ('knockout', 'group', 'league', 'hybrid'));
  end if;
end $$;

create index if not exists idx_tournaments_sport_status on public.tournaments (sport_id, status);
create index if not exists idx_tournaments_event_id on public.tournaments (event_id);

drop trigger if exists trg_tournaments_touch_updated_at on public.tournaments;
create trigger trg_tournaments_touch_updated_at
before update on public.tournaments
for each row execute procedure public.touch_updated_at();

create table if not exists public.tournament_teams (
  id uuid primary key default gen_random_uuid(),
  tournament_id uuid not null references public.tournaments(id) on delete cascade,
  team_id uuid not null references public.teams(id) on delete cascade,
  seed integer,
  group_label text,
  assigned_at timestamptz not null default now(),
  unique(tournament_id, team_id)
);

create index if not exists idx_tournament_teams_tournament on public.tournament_teams (tournament_id);
create index if not exists idx_tournament_teams_team on public.tournament_teams (team_id);
create unique index if not exists uq_tournament_teams_seed
on public.tournament_teams (tournament_id, seed)
where seed is not null;

alter table public.team_memberships enable row level security;
alter table public.tournaments enable row level security;
alter table public.tournament_teams enable row level security;

drop policy if exists team_memberships_read_own_or_staff on public.team_memberships;
create policy team_memberships_read_own_or_staff on public.team_memberships
for select to authenticated
using (
  profile_id = (select auth.uid())
  or public.is_staff((select auth.uid()))
);

drop policy if exists team_memberships_staff_manage on public.team_memberships;
create policy team_memberships_staff_manage on public.team_memberships
for all to authenticated
using (public.is_staff((select auth.uid())))
with check (public.is_staff((select auth.uid())));

drop policy if exists tournaments_public_read on public.tournaments;
create policy tournaments_public_read on public.tournaments
for select to anon, authenticated
using (true);

drop policy if exists tournaments_staff_manage on public.tournaments;
create policy tournaments_staff_manage on public.tournaments
for all to authenticated
using (public.is_staff((select auth.uid())))
with check (public.is_staff((select auth.uid())));

drop policy if exists tournament_teams_public_read on public.tournament_teams;
create policy tournament_teams_public_read on public.tournament_teams
for select to anon, authenticated
using (true);

drop policy if exists tournament_teams_staff_manage on public.tournament_teams;
create policy tournament_teams_staff_manage on public.tournament_teams
for all to authenticated
using (public.is_staff((select auth.uid())))
with check (public.is_staff((select auth.uid())));

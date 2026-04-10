-- Repair migration for environments where activity-related registration columns
-- were not applied, causing PostgREST schema-cache lookup errors.

alter table if exists public.registrations
  add column if not exists activity_slug text,
  add column if not exists previous_experience text,
  add column if not exists motivation text,
  add column if not exists availability_date date,
  add column if not exists preferred_role text,
  add column if not exists registration_details jsonb not null default '{}'::jsonb;

do $$
begin
  if exists (
    select 1
    from information_schema.tables
    where table_schema = 'public'
      and table_name = 'teams'
  ) then
    alter table public.registrations
      add column if not exists team_id uuid references public.teams(id) on delete set null;
  end if;
end $$;

create index if not exists idx_registrations_activity_slug on public.registrations (activity_slug);
create index if not exists idx_registrations_team_id on public.registrations (team_id);

-- Force PostgREST to refresh schema cache so the new column is queryable right away.
notify pgrst, 'reload schema';

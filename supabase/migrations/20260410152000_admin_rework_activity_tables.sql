create table if not exists public.activities (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  category text not null check (category in ('collective_sport', 'individual_sport', 'culture')),
  is_active boolean not null default true,
  display_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_activities_category_order
  on public.activities (category, display_order, title);

drop trigger if exists trg_activities_touch_updated_at on public.activities;
create trigger trg_activities_touch_updated_at
before update on public.activities
for each row execute procedure public.touch_updated_at();

insert into public.activities (slug, title, category, display_order)
values
  ('football', 'Football', 'collective_sport', 10),
  ('basketball', 'Basketball', 'collective_sport', 20),
  ('handball', 'Handball', 'collective_sport', 30),
  ('volleyball', 'Volleyball', 'collective_sport', 40),
  ('chess', 'Chess', 'individual_sport', 10),
  ('running', 'Running', 'individual_sport', 20),
  ('talent-show', 'Talent Show', 'culture', 10),
  ('knowledge-cup', 'Knowledge Cup', 'culture', 20),
  ('writing-contest', 'Writing Contest', 'culture', 30),
  ('art-exhibition', 'Drawing & Art', 'culture', 40)
on conflict (slug) do update
set
  title = excluded.title,
  category = excluded.category,
  display_order = excluded.display_order,
  is_active = true;

alter table public.events
  add column if not exists activity_id uuid references public.activities(id) on delete set null,
  add column if not exists show_in_schedule boolean not null default false;

create index if not exists idx_events_activity_id on public.events (activity_id);
create index if not exists idx_events_show_in_schedule_starts_at on public.events (show_in_schedule, starts_at);

update public.events e
set activity_id = a.id
from public.activities a
where e.activity_id is null
  and (
    a.slug = e.slug
    or a.slug = coalesce((select s.slug from public.sports s where s.id = e.sport_id), '')
    or lower(a.title) = lower(coalesce(e.category, ''))
  );

create table if not exists public.activity_registrations_football (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  profile_id uuid references public.profiles(id) on delete set null,
  event_id uuid not null references public.events(id) on delete cascade,
  team_id uuid references public.teams(id) on delete set null,
  full_name text not null,
  email text not null,
  phone text not null,
  department_or_school text not null,
  team_name text,
  additional_notes text,
  emergency_contact text,
  preferred_role text,
  previous_experience text not null,
  motivation text not null,
  detail_gender text not null,
  status registration_status not null default 'pending',
  attendance_status text not null default 'pending'
    check (attendance_status in ('pending', 'checked_in', 'absent', 'cancelled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id, event_id)
);

create table if not exists public.activity_registrations_basketball (
  like public.activity_registrations_football including all
);

create table if not exists public.activity_registrations_handball (
  like public.activity_registrations_football including all
);

create table if not exists public.activity_registrations_volleyball (
  like public.activity_registrations_football including all
);

create table if not exists public.activity_registrations_chess (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  profile_id uuid references public.profiles(id) on delete set null,
  event_id uuid not null references public.events(id) on delete cascade,
  team_id uuid references public.teams(id) on delete set null,
  full_name text not null,
  email text not null,
  phone text not null,
  department_or_school text not null,
  team_name text,
  additional_notes text,
  emergency_contact text,
  preferred_role text,
  previous_experience text not null,
  motivation text not null,
  detail_competition_level text,
  detail_elo_rating text,
  status registration_status not null default 'pending',
  attendance_status text not null default 'pending'
    check (attendance_status in ('pending', 'checked_in', 'absent', 'cancelled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id, event_id)
);

create table if not exists public.activity_registrations_running (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  profile_id uuid references public.profiles(id) on delete set null,
  event_id uuid not null references public.events(id) on delete cascade,
  team_id uuid references public.teams(id) on delete set null,
  full_name text not null,
  email text not null,
  phone text not null,
  department_or_school text not null,
  team_name text,
  additional_notes text,
  emergency_contact text,
  preferred_role text,
  previous_experience text not null,
  motivation text not null,
  detail_competition_level text,
  status registration_status not null default 'pending',
  attendance_status text not null default 'pending'
    check (attendance_status in ('pending', 'checked_in', 'absent', 'cancelled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id, event_id)
);

create table if not exists public.activity_registrations_talent_show (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  profile_id uuid references public.profiles(id) on delete set null,
  event_id uuid not null references public.events(id) on delete cascade,
  team_id uuid references public.teams(id) on delete set null,
  full_name text not null,
  email text not null,
  phone text not null,
  department_or_school text not null,
  team_name text,
  additional_notes text,
  emergency_contact text,
  preferred_role text,
  previous_experience text not null,
  motivation text not null,
  detail_talent_type text not null,
  detail_performance_description text not null,
  status registration_status not null default 'pending',
  attendance_status text not null default 'pending'
    check (attendance_status in ('pending', 'checked_in', 'absent', 'cancelled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id, event_id)
);

create table if not exists public.activity_registrations_knowledge_cup (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  profile_id uuid references public.profiles(id) on delete set null,
  event_id uuid not null references public.events(id) on delete cascade,
  team_id uuid references public.teams(id) on delete set null,
  full_name text not null,
  email text not null,
  phone text not null,
  department_or_school text not null,
  team_name text,
  additional_notes text,
  emergency_contact text,
  preferred_role text,
  previous_experience text not null,
  motivation text not null,
  status registration_status not null default 'pending',
  attendance_status text not null default 'pending'
    check (attendance_status in ('pending', 'checked_in', 'absent', 'cancelled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id, event_id)
);

create table if not exists public.activity_registrations_writing_contest (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  profile_id uuid references public.profiles(id) on delete set null,
  event_id uuid not null references public.events(id) on delete cascade,
  team_id uuid references public.teams(id) on delete set null,
  full_name text not null,
  email text not null,
  phone text not null,
  department_or_school text not null,
  team_name text,
  additional_notes text,
  emergency_contact text,
  preferred_role text,
  previous_experience text not null,
  motivation text not null,
  status registration_status not null default 'pending',
  attendance_status text not null default 'pending'
    check (attendance_status in ('pending', 'checked_in', 'absent', 'cancelled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id, event_id)
);

create table if not exists public.activity_registrations_art_exhibition (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  profile_id uuid references public.profiles(id) on delete set null,
  event_id uuid not null references public.events(id) on delete cascade,
  team_id uuid references public.teams(id) on delete set null,
  full_name text not null,
  email text not null,
  phone text not null,
  department_or_school text not null,
  team_name text,
  additional_notes text,
  emergency_contact text,
  preferred_role text,
  previous_experience text not null,
  motivation text not null,
  detail_art_category text not null,
  status registration_status not null default 'pending',
  attendance_status text not null default 'pending'
    check (attendance_status in ('pending', 'checked_in', 'absent', 'cancelled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id, event_id)
);

do $$
declare
  registration_tables text[] := array[
    'activity_registrations_football',
    'activity_registrations_basketball',
    'activity_registrations_handball',
    'activity_registrations_volleyball',
    'activity_registrations_chess',
    'activity_registrations_running',
    'activity_registrations_talent_show',
    'activity_registrations_knowledge_cup',
    'activity_registrations_writing_contest',
    'activity_registrations_art_exhibition'
  ];
  table_name text;
begin
  foreach table_name in array registration_tables loop
    execute format('create index if not exists idx_%1$s_user_id on public.%1$s (user_id);', table_name);
    execute format('create index if not exists idx_%1$s_event_id on public.%1$s (event_id);', table_name);
    execute format('create index if not exists idx_%1$s_status on public.%1$s (status);', table_name);
    execute format('create index if not exists idx_%1$s_created_at on public.%1$s (created_at desc);', table_name);

    execute format('drop trigger if exists trg_%1$s_touch_updated_at on public.%1$s;', table_name);
    execute format(
      'create trigger trg_%1$s_touch_updated_at before update on public.%1$s for each row execute procedure public.touch_updated_at();',
      table_name
    );

    execute format('alter table public.%1$s enable row level security;', table_name);

    execute format('drop policy if exists %1$s_select on public.%1$s;', table_name);
    execute format(
      'create policy %1$s_select on public.%1$s for select to authenticated using (user_id = (select auth.uid()) or public.is_staff((select auth.uid())));',
      table_name
    );

    execute format('drop policy if exists %1$s_insert on public.%1$s;', table_name);
    execute format(
      'create policy %1$s_insert on public.%1$s for insert to authenticated with check (user_id = (select auth.uid()) and profile_id = (select auth.uid()));',
      table_name
    );

    execute format('drop policy if exists %1$s_update on public.%1$s;', table_name);
    execute format(
      'create policy %1$s_update on public.%1$s for update to authenticated using (user_id = (select auth.uid()) or public.is_staff((select auth.uid()))) with check (user_id = (select auth.uid()) or public.is_staff((select auth.uid())));',
      table_name
    );

    execute format('drop policy if exists %1$s_delete on public.%1$s;', table_name);
    execute format(
      'create policy %1$s_delete on public.%1$s for delete to authenticated using (user_id = (select auth.uid()) or public.is_staff((select auth.uid())));',
      table_name
    );
  end loop;
end $$;

create or replace view public.v_activity_registrations_all as
  select
    r.id,
    'activity_registrations_football'::text as registration_table,
    'football'::text as activity_slug,
    'Football'::text as activity_title,
    'collective_sport'::text as category_type,
    r.user_id,
    r.profile_id,
    r.event_id,
    r.full_name,
    r.email,
    r.phone,
    r.department_or_school,
    r.team_id,
    r.team_name,
    r.additional_notes,
    r.emergency_contact,
    r.preferred_role,
    r.previous_experience,
    r.motivation,
    r.detail_gender,
    null::text as detail_competition_level,
    null::text as detail_elo_rating,
    null::text as detail_talent_type,
    null::text as detail_performance_description,
    null::text as detail_art_category,
    r.status,
    r.attendance_status,
    r.created_at,
    r.updated_at
  from public.activity_registrations_football r
  union all
  select
    r.id,
    'activity_registrations_basketball',
    'basketball',
    'Basketball',
    'collective_sport',
    r.user_id,
    r.profile_id,
    r.event_id,
    r.full_name,
    r.email,
    r.phone,
    r.department_or_school,
    r.team_id,
    r.team_name,
    r.additional_notes,
    r.emergency_contact,
    r.preferred_role,
    r.previous_experience,
    r.motivation,
    r.detail_gender,
    null::text,
    null::text,
    null::text,
    null::text,
    null::text,
    r.status,
    r.attendance_status,
    r.created_at,
    r.updated_at
  from public.activity_registrations_basketball r
  union all
  select
    r.id,
    'activity_registrations_handball',
    'handball',
    'Handball',
    'collective_sport',
    r.user_id,
    r.profile_id,
    r.event_id,
    r.full_name,
    r.email,
    r.phone,
    r.department_or_school,
    r.team_id,
    r.team_name,
    r.additional_notes,
    r.emergency_contact,
    r.preferred_role,
    r.previous_experience,
    r.motivation,
    r.detail_gender,
    null::text,
    null::text,
    null::text,
    null::text,
    null::text,
    r.status,
    r.attendance_status,
    r.created_at,
    r.updated_at
  from public.activity_registrations_handball r
  union all
  select
    r.id,
    'activity_registrations_volleyball',
    'volleyball',
    'Volleyball',
    'collective_sport',
    r.user_id,
    r.profile_id,
    r.event_id,
    r.full_name,
    r.email,
    r.phone,
    r.department_or_school,
    r.team_id,
    r.team_name,
    r.additional_notes,
    r.emergency_contact,
    r.preferred_role,
    r.previous_experience,
    r.motivation,
    r.detail_gender,
    null::text,
    null::text,
    null::text,
    null::text,
    null::text,
    r.status,
    r.attendance_status,
    r.created_at,
    r.updated_at
  from public.activity_registrations_volleyball r
  union all
  select
    r.id,
    'activity_registrations_chess',
    'chess',
    'Chess',
    'individual_sport',
    r.user_id,
    r.profile_id,
    r.event_id,
    r.full_name,
    r.email,
    r.phone,
    r.department_or_school,
    r.team_id,
    r.team_name,
    r.additional_notes,
    r.emergency_contact,
    r.preferred_role,
    r.previous_experience,
    r.motivation,
    null::text,
    r.detail_competition_level,
    r.detail_elo_rating,
    null::text,
    null::text,
    null::text,
    r.status,
    r.attendance_status,
    r.created_at,
    r.updated_at
  from public.activity_registrations_chess r
  union all
  select
    r.id,
    'activity_registrations_running',
    'running',
    'Running',
    'individual_sport',
    r.user_id,
    r.profile_id,
    r.event_id,
    r.full_name,
    r.email,
    r.phone,
    r.department_or_school,
    r.team_id,
    r.team_name,
    r.additional_notes,
    r.emergency_contact,
    r.preferred_role,
    r.previous_experience,
    r.motivation,
    null::text,
    r.detail_competition_level,
    null::text,
    null::text,
    null::text,
    null::text,
    r.status,
    r.attendance_status,
    r.created_at,
    r.updated_at
  from public.activity_registrations_running r
  union all
  select
    r.id,
    'activity_registrations_talent_show',
    'talent-show',
    'Talent Show',
    'culture',
    r.user_id,
    r.profile_id,
    r.event_id,
    r.full_name,
    r.email,
    r.phone,
    r.department_or_school,
    r.team_id,
    r.team_name,
    r.additional_notes,
    r.emergency_contact,
    r.preferred_role,
    r.previous_experience,
    r.motivation,
    null::text,
    null::text,
    null::text,
    r.detail_talent_type,
    r.detail_performance_description,
    null::text,
    r.status,
    r.attendance_status,
    r.created_at,
    r.updated_at
  from public.activity_registrations_talent_show r
  union all
  select
    r.id,
    'activity_registrations_knowledge_cup',
    'knowledge-cup',
    'Knowledge Cup',
    'culture',
    r.user_id,
    r.profile_id,
    r.event_id,
    r.full_name,
    r.email,
    r.phone,
    r.department_or_school,
    r.team_id,
    r.team_name,
    r.additional_notes,
    r.emergency_contact,
    r.preferred_role,
    r.previous_experience,
    r.motivation,
    null::text,
    null::text,
    null::text,
    null::text,
    null::text,
    null::text,
    r.status,
    r.attendance_status,
    r.created_at,
    r.updated_at
  from public.activity_registrations_knowledge_cup r
  union all
  select
    r.id,
    'activity_registrations_writing_contest',
    'writing-contest',
    'Writing Contest',
    'culture',
    r.user_id,
    r.profile_id,
    r.event_id,
    r.full_name,
    r.email,
    r.phone,
    r.department_or_school,
    r.team_id,
    r.team_name,
    r.additional_notes,
    r.emergency_contact,
    r.preferred_role,
    r.previous_experience,
    r.motivation,
    null::text,
    null::text,
    null::text,
    null::text,
    null::text,
    null::text,
    r.status,
    r.attendance_status,
    r.created_at,
    r.updated_at
  from public.activity_registrations_writing_contest r
  union all
  select
    r.id,
    'activity_registrations_art_exhibition',
    'art-exhibition',
    'Drawing & Art',
    'culture',
    r.user_id,
    r.profile_id,
    r.event_id,
    r.full_name,
    r.email,
    r.phone,
    r.department_or_school,
    r.team_id,
    r.team_name,
    r.additional_notes,
    r.emergency_contact,
    r.preferred_role,
    r.previous_experience,
    r.motivation,
    null::text,
    null::text,
    null::text,
    null::text,
    null::text,
    r.detail_art_category,
    r.status,
    r.attendance_status,
    r.created_at,
    r.updated_at
  from public.activity_registrations_art_exhibition r;

create or replace view public.v_profile_activity_registrations as
  select
    r.*,
    e.title as event_title,
    e.slug as event_slug,
    e.starts_at as event_starts_at,
    e.status as event_status,
    e.venue as event_venue
  from public.v_activity_registrations_all r
  left join public.events e on e.id = r.event_id;

create or replace view public.v_admin_activity_registrations_collective as
  select * from public.v_profile_activity_registrations where category_type = 'collective_sport';

create or replace view public.v_admin_activity_registrations_individual as
  select * from public.v_profile_activity_registrations where category_type = 'individual_sport';

create or replace view public.v_admin_activity_registrations_culture as
  select * from public.v_profile_activity_registrations where category_type = 'culture';

grant select on public.v_activity_registrations_all to authenticated;
grant select on public.v_profile_activity_registrations to authenticated;
grant select on public.v_admin_activity_registrations_collective to authenticated;
grant select on public.v_admin_activity_registrations_individual to authenticated;
grant select on public.v_admin_activity_registrations_culture to authenticated;

notify pgrst, 'reload schema';

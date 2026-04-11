alter table public.profiles
  add column if not exists gender text;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'profiles_gender_check'
      and conrelid = 'public.profiles'::regclass
  ) then
    alter table public.profiles
      add constraint profiles_gender_check
      check (gender is null or gender in ('men', 'women'));
  end if;
end $$;

with inferred as (
  select user_id as profile_id, lower(detail_gender) as gender, created_at
  from public.activity_registrations_football
  where user_id is not null
  union all
  select user_id as profile_id, lower(detail_gender) as gender, created_at
  from public.activity_registrations_basketball
  where user_id is not null
  union all
  select user_id as profile_id, lower(detail_gender) as gender, created_at
  from public.activity_registrations_handball
  where user_id is not null
  union all
  select user_id as profile_id, lower(detail_gender) as gender, created_at
  from public.activity_registrations_volleyball
  where user_id is not null
),
picked as (
  select distinct on (profile_id) profile_id, gender
  from inferred
  where gender in ('men', 'women')
  order by profile_id, created_at desc
)
update public.profiles p
set gender = picked.gender
from picked
where p.id = picked.profile_id
  and p.gender is null;

alter table public.teams
  add column if not exists category text;

update public.teams t
set category = case s.sport_type
  when 'individual' then 'individual'
  when 'culture' then 'culture'
  else 'collective'
end
from public.sports s
where t.sport_id = s.id
  and (t.category is null or t.category not in ('collective', 'individual', 'culture'));

update public.teams
set category = 'collective'
where category is null;

alter table public.teams
  alter column category set default 'collective',
  alter column category set not null;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'teams_category_check'
      and conrelid = 'public.teams'::regclass
  ) then
    alter table public.teams
    add constraint teams_category_check
    check (category in ('collective', 'individual', 'culture'));
  end if;
end $$;

alter table public.teams
  drop column if exists short_code,
  drop column if exists city,
  drop column if exists coach_name;

notify pgrst, 'reload schema';

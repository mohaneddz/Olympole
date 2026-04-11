alter table public.profiles
  drop constraint if exists profiles_gender_check;

update public.profiles
set gender = case
  when lower(gender) = 'men' then 'male'
  when lower(gender) = 'women' then 'female'
  else lower(gender)
end
where gender is not null;

alter table public.profiles
  add constraint profiles_gender_check
  check (gender is null or gender in ('male', 'female'));

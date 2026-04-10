alter table if exists public.profiles
  add column if not exists student_id text;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'profiles_student_id_numeric_check'
      and conrelid = 'public.profiles'::regclass
  ) then
    alter table public.profiles
      add constraint profiles_student_id_numeric_check
      check (student_id is null or student_id ~ '^[0-9]+$');
  end if;
end $$;

create unique index if not exists uq_profiles_student_id
  on public.profiles (student_id)
  where student_id is not null;

notify pgrst, 'reload schema';

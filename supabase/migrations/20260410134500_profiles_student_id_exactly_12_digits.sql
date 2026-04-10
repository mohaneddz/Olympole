update public.profiles
set student_id = null
where student_id is not null
  and student_id !~ '^[0-9]{12}$';

alter table public.profiles
  drop constraint if exists profiles_student_id_numeric_check;

alter table public.profiles
  drop constraint if exists profiles_student_id_12_digits_check;

alter table public.profiles
  add constraint profiles_student_id_12_digits_check
  check (student_id is null or student_id ~ '^[0-9]{12}$');

notify pgrst, 'reload schema';

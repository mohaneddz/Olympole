alter table public.profiles
  add column if not exists school text,
  add column if not exists year_of_study text;

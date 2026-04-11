alter table public.activity_registrations_running
  add column if not exists detail_running_distance text,
  add column if not exists detail_joined_marathon_before boolean;

alter table public.activity_registrations_chess
  add column if not exists detail_participated_before boolean;

alter table public.activity_registrations_writing_contest
  add column if not exists detail_writing_category text,
  add column if not exists detail_participated_before boolean;

alter table public.activity_registrations_art_exhibition
  add column if not exists detail_participated_before boolean;

alter table public.activity_registrations_talent_show
  add column if not exists detail_talent_type_other text,
  add column if not exists detail_participated_before boolean;

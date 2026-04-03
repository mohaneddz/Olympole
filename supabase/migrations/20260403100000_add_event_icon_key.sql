alter table public.events
add column if not exists icon_key text not null default '🏆';

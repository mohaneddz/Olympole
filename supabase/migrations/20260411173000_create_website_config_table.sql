create table if not exists public.website_config (
  id smallint primary key default 1 check (id = 1),
  registration_enabled boolean not null default true,
  predictions_enabled boolean not null default true,
  fantasy_launch boolean not null default false,
  writing_enabled boolean not null default true,
  live_streaming_enabled boolean not null default true,
  registration_max_events_per_user integer not null default 8 check (registration_max_events_per_user between 1 and 20),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

insert into public.website_config (
  id,
  registration_enabled,
  predictions_enabled,
  fantasy_launch,
  writing_enabled,
  live_streaming_enabled,
  registration_max_events_per_user
)
values (
  1,
  coalesce(
    (
      select case
        when lower(value #>> '{}') in ('true', 'false') then (value #>> '{}')::boolean
        else null
      end
      from public.app_settings
      where key = 'registration_enabled'
      limit 1
    ),
    true
  ),
  coalesce(
    (
      select case
        when lower(value #>> '{}') in ('true', 'false') then (value #>> '{}')::boolean
        else null
      end
      from public.app_settings
      where key = 'predictions_enabled'
      limit 1
    ),
    true
  ),
  coalesce(
    (
      select case
        when lower(value #>> '{}') in ('true', 'false') then (value #>> '{}')::boolean
        else null
      end
      from public.app_settings
      where key = 'fantasy_launch'
      limit 1
    ),
    false
  ),
  coalesce(
    (
      select case
        when lower(value #>> '{}') in ('true', 'false') then (value #>> '{}')::boolean
        else null
      end
      from public.app_settings
      where key = 'writing_enabled'
      limit 1
    ),
    true
  ),
  coalesce(
    (
      select case
        when lower(value #>> '{}') in ('true', 'false') then (value #>> '{}')::boolean
        else null
      end
      from public.app_settings
      where key = 'live_streaming_enabled'
      limit 1
    ),
    true
  ),
  coalesce(
    (
      select least(
        20,
        greatest(
          1,
          case
            when (value #>> '{}') ~ '^[0-9]+$' then (value #>> '{}')::integer
            else 8
          end
        )
      )
      from public.app_settings
      where key = 'registration_max_events_per_user'
      limit 1
    ),
    8
  )
)
on conflict (id) do nothing;

drop trigger if exists trg_website_config_touch_updated_at on public.website_config;
create trigger trg_website_config_touch_updated_at
before update on public.website_config
for each row execute procedure public.touch_updated_at();

alter table public.website_config enable row level security;

drop policy if exists website_config_public_read on public.website_config;
create policy website_config_public_read on public.website_config
for select to anon, authenticated
using (true);

drop policy if exists website_config_admin_manage on public.website_config;
create policy website_config_admin_manage on public.website_config
for all to authenticated
using (public.is_admin((select auth.uid())))
with check (public.is_admin((select auth.uid())));

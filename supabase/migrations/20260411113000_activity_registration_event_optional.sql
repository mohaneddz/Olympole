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
    execute format('alter table public.%1$s alter column event_id drop not null;', table_name);

    execute format('drop index if exists public.uq_%1$s_user;', table_name);
    execute format('alter table public.%1$s drop constraint if exists %1$s_user_id_event_id_key;', table_name);

    execute format(
      $sql$
        delete from public.%1$s t
        using public.%1$s d
        where t.user_id is not null
          and t.user_id = d.user_id
          and (
            t.created_at < d.created_at
            or (t.created_at = d.created_at and t.id::text < d.id::text)
          );
      $sql$,
      table_name
    );

    execute format(
      'create unique index if not exists uq_%1$s_user on public.%1$s (user_id) where user_id is not null;',
      table_name
    );
  end loop;
end $$;

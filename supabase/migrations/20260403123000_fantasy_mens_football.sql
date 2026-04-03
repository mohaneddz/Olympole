create extension if not exists "pgcrypto";

do $$
begin
  if not exists (select 1 from pg_type where typname = 'fantasy_gameweek_status') then
    create type fantasy_gameweek_status as enum ('draft', 'open', 'locked', 'scored');
  end if;
  if not exists (select 1 from pg_type where typname = 'fantasy_squad_status') then
    create type fantasy_squad_status as enum ('draft', 'locked');
  end if;
  if not exists (select 1 from pg_type where typname = 'fantasy_pick_role') then
    create type fantasy_pick_role as enum ('starter', 'bench');
  end if;
  if not exists (select 1 from pg_type where typname = 'fantasy_player_position') then
    create type fantasy_player_position as enum ('gk', 'def', 'mid', 'fwd');
  end if;
end $$;

create table if not exists public.fantasy_competitions (
  id uuid primary key default gen_random_uuid(),
  slug text not null,
  name text not null,
  sport_id uuid not null references public.sports(id) on delete restrict,
  gender_scope text not null default 'men',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (slug),
  constraint fantasy_competitions_gender_scope_check check (gender_scope in ('men'))
);

create table if not exists public.fantasy_gameweeks (
  id uuid primary key default gen_random_uuid(),
  competition_id uuid not null references public.fantasy_competitions(id) on delete cascade,
  gw_number integer not null,
  name text not null,
  deadline_at timestamptz not null,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  status fantasy_gameweek_status not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (competition_id, gw_number),
  constraint fantasy_gameweeks_number_positive_check check (gw_number > 0),
  constraint fantasy_gameweeks_window_check check (deadline_at <= starts_at and starts_at <= ends_at)
);

create table if not exists public.fantasy_gameweek_matches (
  id uuid primary key default gen_random_uuid(),
  gameweek_id uuid not null references public.fantasy_gameweeks(id) on delete cascade,
  match_id uuid not null references public.matches(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (gameweek_id, match_id)
);

create table if not exists public.fantasy_players (
  id uuid primary key default gen_random_uuid(),
  competition_id uuid not null references public.fantasy_competitions(id) on delete cascade,
  team_player_id uuid not null references public.team_players(id) on delete restrict,
  team_id uuid not null references public.teams(id) on delete restrict,
  display_name text not null,
  position fantasy_player_position not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (competition_id, team_player_id)
);

create table if not exists public.fantasy_player_match_stats (
  id uuid primary key default gen_random_uuid(),
  match_id uuid not null references public.matches(id) on delete cascade,
  fantasy_player_id uuid not null references public.fantasy_players(id) on delete cascade,
  minutes_played integer not null default 0,
  goals integer not null default 0,
  assists integer not null default 0,
  clean_sheet boolean not null default false,
  goals_conceded integer not null default 0,
  saves integer not null default 0,
  penalty_saved integer not null default 0,
  penalty_missed integer not null default 0,
  yellow_cards integer not null default 0,
  red_cards integer not null default 0,
  own_goals integer not null default 0,
  bonus integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (match_id, fantasy_player_id),
  constraint fantasy_player_match_stats_minutes_check check (minutes_played >= 0 and minutes_played <= 130),
  constraint fantasy_player_match_stats_goals_check check (goals >= 0),
  constraint fantasy_player_match_stats_assists_check check (assists >= 0),
  constraint fantasy_player_match_stats_goals_conceded_check check (goals_conceded >= 0),
  constraint fantasy_player_match_stats_saves_check check (saves >= 0),
  constraint fantasy_player_match_stats_penalty_saved_check check (penalty_saved >= 0),
  constraint fantasy_player_match_stats_penalty_missed_check check (penalty_missed >= 0),
  constraint fantasy_player_match_stats_yellow_cards_check check (yellow_cards >= 0),
  constraint fantasy_player_match_stats_red_cards_check check (red_cards >= 0),
  constraint fantasy_player_match_stats_own_goals_check check (own_goals >= 0),
  constraint fantasy_player_match_stats_bonus_check check (bonus >= 0)
);

create table if not exists public.fantasy_scoring_rules (
  id uuid primary key default gen_random_uuid(),
  competition_id uuid not null references public.fantasy_competitions(id) on delete cascade,
  version integer not null,
  rules_json jsonb not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  unique (competition_id, version),
  constraint fantasy_scoring_rules_version_positive_check check (version > 0)
);

create table if not exists public.fantasy_player_match_points (
  id uuid primary key default gen_random_uuid(),
  match_id uuid not null references public.matches(id) on delete cascade,
  fantasy_player_id uuid not null references public.fantasy_players(id) on delete cascade,
  scoring_rule_id uuid not null references public.fantasy_scoring_rules(id) on delete restrict,
  total_points integer not null,
  breakdown_json jsonb not null default '{}'::jsonb,
  calculated_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  unique (match_id, fantasy_player_id, scoring_rule_id)
);

create table if not exists public.fantasy_squads (
  id uuid primary key default gen_random_uuid(),
  competition_id uuid not null references public.fantasy_competitions(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  gameweek_id uuid not null references public.fantasy_gameweeks(id) on delete cascade,
  status fantasy_squad_status not null default 'draft',
  submitted_at timestamptz,
  locked_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (profile_id, gameweek_id)
);

create table if not exists public.fantasy_squad_picks (
  id uuid primary key default gen_random_uuid(),
  squad_id uuid not null references public.fantasy_squads(id) on delete cascade,
  fantasy_player_id uuid not null references public.fantasy_players(id) on delete restrict,
  pick_role fantasy_pick_role not null,
  slot_no smallint not null,
  created_at timestamptz not null default now(),
  unique (squad_id, fantasy_player_id),
  unique (squad_id, slot_no),
  constraint fantasy_squad_picks_slot_range_check check (slot_no between 1 and 7),
  constraint fantasy_squad_picks_slot_role_check check (
    (pick_role = 'starter' and slot_no between 1 and 5)
    or (pick_role = 'bench' and slot_no between 6 and 7)
  )
);

create table if not exists public.fantasy_manager_gameweek_scores (
  id uuid primary key default gen_random_uuid(),
  competition_id uuid not null references public.fantasy_competitions(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  gameweek_id uuid not null references public.fantasy_gameweeks(id) on delete cascade,
  squad_id uuid references public.fantasy_squads(id) on delete set null,
  starter_points integer not null default 0,
  bench_points integer not null default 0,
  total_points integer not null default 0,
  rank_in_gw integer,
  breakdown_json jsonb not null default '{}'::jsonb,
  calculated_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (profile_id, gameweek_id),
  constraint fantasy_manager_gameweek_scores_total_check check (total_points = starter_points + bench_points),
  constraint fantasy_manager_gameweek_scores_rank_check check (rank_in_gw is null or rank_in_gw > 0)
);

create unique index if not exists uq_fantasy_competitions_slug_lower
on public.fantasy_competitions (lower(slug));

create unique index if not exists uq_fantasy_scoring_rules_active
on public.fantasy_scoring_rules (competition_id)
where is_active = true;

create index if not exists idx_fantasy_gameweeks_competition_deadline
on public.fantasy_gameweeks (competition_id, deadline_at);

create index if not exists idx_fantasy_players_competition_active
on public.fantasy_players (competition_id, is_active);

create index if not exists idx_fantasy_player_match_stats_match
on public.fantasy_player_match_stats (match_id);

create index if not exists idx_fantasy_player_match_points_match
on public.fantasy_player_match_points (match_id);

create index if not exists idx_fantasy_squads_profile_gw
on public.fantasy_squads (profile_id, gameweek_id);

create index if not exists idx_fantasy_squads_competition_gw
on public.fantasy_squads (competition_id, gameweek_id);

create index if not exists idx_fantasy_squad_picks_squad
on public.fantasy_squad_picks (squad_id);

create index if not exists idx_fantasy_manager_scores_competition_gw_points
on public.fantasy_manager_gameweek_scores (competition_id, gameweek_id, total_points desc);

create or replace function public.validate_fantasy_competition_sport()
returns trigger
language plpgsql
as $$
declare
  sport_slug text;
begin
  select lower(s.slug)
  into sport_slug
  from public.sports s
  where s.id = new.sport_id;

  if sport_slug is null then
    raise exception 'Invalid sport_id for fantasy competition.';
  end if;

  if sport_slug <> 'football' then
    raise exception 'Fantasy competition must reference football sport only.';
  end if;

  if new.gender_scope <> 'men' then
    raise exception 'Only men competition is allowed for this fantasy module.';
  end if;

  return new;
end;
$$;

create or replace function public.validate_fantasy_gameweek_match()
returns trigger
language plpgsql
as $$
declare
  is_valid boolean;
begin
  select exists (
    select 1
    from public.fantasy_gameweeks gw
    join public.fantasy_competitions fc on fc.id = gw.competition_id
    join public.matches m on m.id = new.match_id
    join public.events e on e.id = m.event_id
    where gw.id = new.gameweek_id
      and e.sport_id = fc.sport_id
  )
  into is_valid;

  if not is_valid then
    raise exception 'Match must belong to the same football competition sport.';
  end if;

  return new;
end;
$$;

create or replace function public.validate_fantasy_player_link()
returns trigger
language plpgsql
as $$
declare
  is_valid boolean;
begin
  select exists (
    select 1
    from public.team_players tp
    join public.teams t on t.id = tp.team_id
    join public.fantasy_competitions fc on fc.id = new.competition_id
    where tp.id = new.team_player_id
      and t.id = new.team_id
      and t.sport_id = fc.sport_id
  )
  into is_valid;

  if not is_valid then
    raise exception 'Fantasy player must map to a team player from the same football sport.';
  end if;

  return new;
end;
$$;

create or replace function public.check_fantasy_squad_pick_limits(p_squad_id uuid, p_require_exact boolean)
returns void
language plpgsql
as $$
declare
  starter_count integer := 0;
  bench_count integer := 0;
  total_count integer := 0;
  mismatched_competition_count integer := 0;
begin
  select
    coalesce(sum(case when sp.pick_role = 'starter' then 1 else 0 end), 0),
    coalesce(sum(case when sp.pick_role = 'bench' then 1 else 0 end), 0),
    count(*)
  into starter_count, bench_count, total_count
  from public.fantasy_squad_picks sp
  where sp.squad_id = p_squad_id;

  select count(*)
  into mismatched_competition_count
  from public.fantasy_squad_picks sp
  join public.fantasy_squads sq on sq.id = sp.squad_id
  join public.fantasy_players fp on fp.id = sp.fantasy_player_id
  where sp.squad_id = p_squad_id
    and fp.competition_id <> sq.competition_id;

  if mismatched_competition_count > 0 then
    raise exception 'All picked players must belong to the same fantasy competition as the squad.';
  end if;

  if starter_count > 5 then
    raise exception 'Squad cannot have more than 5 starters.';
  end if;

  if bench_count > 2 then
    raise exception 'Squad cannot have more than 2 bench players.';
  end if;

  if total_count > 7 then
    raise exception 'Squad cannot exceed 7 total players.';
  end if;

  if p_require_exact and (starter_count <> 5 or bench_count <> 2 or total_count <> 7) then
    raise exception 'Locked squad must contain exactly 7 players (5 starters + 2 bench).';
  end if;
end;
$$;

create or replace function public.validate_fantasy_squad_row()
returns trigger
language plpgsql
as $$
declare
  gameweek_deadline timestamptz;
  gameweek_status fantasy_gameweek_status;
  gameweek_competition_id uuid;
begin
  select gw.deadline_at, gw.status, gw.competition_id
  into gameweek_deadline, gameweek_status, gameweek_competition_id
  from public.fantasy_gameweeks gw
  where gw.id = new.gameweek_id;

  if gameweek_competition_id is null then
    raise exception 'Invalid gameweek for fantasy squad.';
  end if;

  if new.competition_id <> gameweek_competition_id then
    raise exception 'Squad competition must match gameweek competition.';
  end if;

  if tg_op = 'UPDATE' and old.status = 'locked' and new.status <> 'locked' then
    raise exception 'Locked squads cannot be reverted to draft.';
  end if;

  if new.status = 'locked' then
    if now() > gameweek_deadline then
      raise exception 'Cannot lock squad after gameweek deadline.';
    end if;

    if gameweek_status in ('locked', 'scored') then
      raise exception 'Cannot lock squad when gameweek is locked or scored.';
    end if;

    if new.submitted_at is null then
      new.submitted_at := now();
    end if;
    if new.locked_at is null then
      new.locked_at := now();
    end if;

    perform public.check_fantasy_squad_pick_limits(new.id, true);
  end if;

  return new;
end;
$$;

create or replace function public.enforce_fantasy_squad_window()
returns trigger
language plpgsql
as $$
declare
  deadline_at_value timestamptz;
  gw_status fantasy_gameweek_status;
  actor_id uuid;
  target_gameweek_id uuid;
begin
  actor_id := (select auth.uid());

  if actor_id is null or public.is_staff(actor_id) then
    return coalesce(new, old);
  end if;

  if tg_op = 'DELETE' then
    target_gameweek_id := old.gameweek_id;
  else
    target_gameweek_id := new.gameweek_id;
  end if;

  select gw.deadline_at, gw.status
  into deadline_at_value, gw_status
  from public.fantasy_gameweeks gw
  where gw.id = target_gameweek_id;

  if deadline_at_value is null then
    raise exception 'Invalid gameweek.';
  end if;

  if now() > deadline_at_value or gw_status in ('locked', 'scored') then
    raise exception 'Gameweek is locked; squad changes are no longer allowed.';
  end if;

  if tg_op = 'UPDATE' and old.status = 'locked' then
    raise exception 'Locked squads cannot be edited.';
  end if;

  return coalesce(new, old);
end;
$$;

create or replace function public.enforce_fantasy_pick_window()
returns trigger
language plpgsql
as $$
declare
  deadline_at_value timestamptz;
  gw_status fantasy_gameweek_status;
  squad_status fantasy_squad_status;
  actor_id uuid;
  target_squad_id uuid;
begin
  actor_id := (select auth.uid());

  if actor_id is null or public.is_staff(actor_id) then
    return coalesce(new, old);
  end if;

  if tg_op = 'DELETE' then
    target_squad_id := old.squad_id;
  else
    target_squad_id := new.squad_id;
  end if;

  select gw.deadline_at, gw.status, sq.status
  into deadline_at_value, gw_status, squad_status
  from public.fantasy_squads sq
  join public.fantasy_gameweeks gw on gw.id = sq.gameweek_id
  where sq.id = target_squad_id;

  if deadline_at_value is null then
    raise exception 'Invalid squad/gameweek.';
  end if;

  if squad_status = 'locked' or now() > deadline_at_value or gw_status in ('locked', 'scored') then
    raise exception 'Squad picks are locked for this gameweek.';
  end if;

  return coalesce(new, old);
end;
$$;

create or replace function public.validate_fantasy_squad_pick_mutation()
returns trigger
language plpgsql
as $$
declare
  target_squad_id uuid;
  squad_status fantasy_squad_status;
  require_exact boolean;
begin
  if tg_op = 'DELETE' then
    target_squad_id := old.squad_id;
  else
    target_squad_id := new.squad_id;
  end if;

  select sq.status
  into squad_status
  from public.fantasy_squads sq
  where sq.id = target_squad_id;

  if squad_status is null then
    raise exception 'Invalid squad for pick mutation.';
  end if;

  require_exact := (squad_status = 'locked');
  perform public.check_fantasy_squad_pick_limits(target_squad_id, require_exact);

  return null;
end;
$$;

drop trigger if exists trg_fantasy_competitions_validate on public.fantasy_competitions;
create trigger trg_fantasy_competitions_validate
before insert or update on public.fantasy_competitions
for each row execute procedure public.validate_fantasy_competition_sport();

drop trigger if exists trg_fantasy_competitions_touch_updated_at on public.fantasy_competitions;
create trigger trg_fantasy_competitions_touch_updated_at
before update on public.fantasy_competitions
for each row execute procedure public.touch_updated_at();

drop trigger if exists trg_fantasy_gameweeks_touch_updated_at on public.fantasy_gameweeks;
create trigger trg_fantasy_gameweeks_touch_updated_at
before update on public.fantasy_gameweeks
for each row execute procedure public.touch_updated_at();

drop trigger if exists trg_fantasy_gameweek_matches_validate on public.fantasy_gameweek_matches;
create trigger trg_fantasy_gameweek_matches_validate
before insert or update on public.fantasy_gameweek_matches
for each row execute procedure public.validate_fantasy_gameweek_match();

drop trigger if exists trg_fantasy_players_validate on public.fantasy_players;
create trigger trg_fantasy_players_validate
before insert or update on public.fantasy_players
for each row execute procedure public.validate_fantasy_player_link();

drop trigger if exists trg_fantasy_players_touch_updated_at on public.fantasy_players;
create trigger trg_fantasy_players_touch_updated_at
before update on public.fantasy_players
for each row execute procedure public.touch_updated_at();

drop trigger if exists trg_fantasy_player_match_stats_touch_updated_at on public.fantasy_player_match_stats;
create trigger trg_fantasy_player_match_stats_touch_updated_at
before update on public.fantasy_player_match_stats
for each row execute procedure public.touch_updated_at();

drop trigger if exists trg_fantasy_squads_validate_row on public.fantasy_squads;
create trigger trg_fantasy_squads_validate_row
before insert or update on public.fantasy_squads
for each row execute procedure public.validate_fantasy_squad_row();

drop trigger if exists trg_fantasy_squads_enforce_window on public.fantasy_squads;
create trigger trg_fantasy_squads_enforce_window
before insert or update or delete on public.fantasy_squads
for each row execute procedure public.enforce_fantasy_squad_window();

drop trigger if exists trg_fantasy_squads_touch_updated_at on public.fantasy_squads;
create trigger trg_fantasy_squads_touch_updated_at
before update on public.fantasy_squads
for each row execute procedure public.touch_updated_at();

drop trigger if exists trg_fantasy_squad_picks_enforce_window on public.fantasy_squad_picks;
create trigger trg_fantasy_squad_picks_enforce_window
before insert or update or delete on public.fantasy_squad_picks
for each row execute procedure public.enforce_fantasy_pick_window();

drop trigger if exists trg_fantasy_squad_picks_check_limits on public.fantasy_squad_picks;
create constraint trigger trg_fantasy_squad_picks_check_limits
after insert or update or delete on public.fantasy_squad_picks
deferrable initially deferred
for each row execute procedure public.validate_fantasy_squad_pick_mutation();

drop trigger if exists trg_fantasy_manager_gameweek_scores_touch_updated_at on public.fantasy_manager_gameweek_scores;
create trigger trg_fantasy_manager_gameweek_scores_touch_updated_at
before update on public.fantasy_manager_gameweek_scores
for each row execute procedure public.touch_updated_at();

alter table public.fantasy_competitions enable row level security;
alter table public.fantasy_gameweeks enable row level security;
alter table public.fantasy_gameweek_matches enable row level security;
alter table public.fantasy_players enable row level security;
alter table public.fantasy_player_match_stats enable row level security;
alter table public.fantasy_scoring_rules enable row level security;
alter table public.fantasy_player_match_points enable row level security;
alter table public.fantasy_squads enable row level security;
alter table public.fantasy_squad_picks enable row level security;
alter table public.fantasy_manager_gameweek_scores enable row level security;

drop policy if exists fantasy_competitions_public_read on public.fantasy_competitions;
create policy fantasy_competitions_public_read on public.fantasy_competitions
for select to anon, authenticated
using (is_active = true);

drop policy if exists fantasy_competitions_staff_manage on public.fantasy_competitions;
create policy fantasy_competitions_staff_manage on public.fantasy_competitions
for all to authenticated
using (public.is_staff((select auth.uid())))
with check (public.is_staff((select auth.uid())));

drop policy if exists fantasy_gameweeks_public_read on public.fantasy_gameweeks;
create policy fantasy_gameweeks_public_read on public.fantasy_gameweeks
for select to anon, authenticated
using (true);

drop policy if exists fantasy_gameweeks_staff_manage on public.fantasy_gameweeks;
create policy fantasy_gameweeks_staff_manage on public.fantasy_gameweeks
for all to authenticated
using (public.is_staff((select auth.uid())))
with check (public.is_staff((select auth.uid())));

drop policy if exists fantasy_gameweek_matches_public_read on public.fantasy_gameweek_matches;
create policy fantasy_gameweek_matches_public_read on public.fantasy_gameweek_matches
for select to anon, authenticated
using (true);

drop policy if exists fantasy_gameweek_matches_staff_manage on public.fantasy_gameweek_matches;
create policy fantasy_gameweek_matches_staff_manage on public.fantasy_gameweek_matches
for all to authenticated
using (public.is_staff((select auth.uid())))
with check (public.is_staff((select auth.uid())));

drop policy if exists fantasy_players_public_read on public.fantasy_players;
create policy fantasy_players_public_read on public.fantasy_players
for select to anon, authenticated
using (is_active = true);

drop policy if exists fantasy_players_staff_manage on public.fantasy_players;
create policy fantasy_players_staff_manage on public.fantasy_players
for all to authenticated
using (public.is_staff((select auth.uid())))
with check (public.is_staff((select auth.uid())));

drop policy if exists fantasy_player_match_stats_public_read on public.fantasy_player_match_stats;
create policy fantasy_player_match_stats_public_read on public.fantasy_player_match_stats
for select to anon, authenticated
using (true);

drop policy if exists fantasy_player_match_stats_staff_manage on public.fantasy_player_match_stats;
create policy fantasy_player_match_stats_staff_manage on public.fantasy_player_match_stats
for all to authenticated
using (public.is_staff((select auth.uid())))
with check (public.is_staff((select auth.uid())));

drop policy if exists fantasy_scoring_rules_public_read on public.fantasy_scoring_rules;
create policy fantasy_scoring_rules_public_read on public.fantasy_scoring_rules
for select to anon, authenticated
using (is_active = true);

drop policy if exists fantasy_scoring_rules_staff_manage on public.fantasy_scoring_rules;
create policy fantasy_scoring_rules_staff_manage on public.fantasy_scoring_rules
for all to authenticated
using (public.is_staff((select auth.uid())))
with check (public.is_staff((select auth.uid())));

drop policy if exists fantasy_player_match_points_public_read on public.fantasy_player_match_points;
create policy fantasy_player_match_points_public_read on public.fantasy_player_match_points
for select to anon, authenticated
using (true);

drop policy if exists fantasy_player_match_points_staff_manage on public.fantasy_player_match_points;
create policy fantasy_player_match_points_staff_manage on public.fantasy_player_match_points
for all to authenticated
using (public.is_staff((select auth.uid())))
with check (public.is_staff((select auth.uid())));

drop policy if exists fantasy_squads_select_own_or_staff on public.fantasy_squads;
create policy fantasy_squads_select_own_or_staff on public.fantasy_squads
for select to authenticated
using (
  profile_id = (select auth.uid())
  or public.is_staff((select auth.uid()))
);

drop policy if exists fantasy_squads_insert_own on public.fantasy_squads;
create policy fantasy_squads_insert_own on public.fantasy_squads
for insert to authenticated
with check (
  profile_id = (select auth.uid())
  and exists (
    select 1
    from public.fantasy_gameweeks gw
    where gw.id = gameweek_id
      and gw.competition_id = competition_id
      and now() <= gw.deadline_at
      and gw.status in ('draft', 'open')
  )
);

drop policy if exists fantasy_squads_update_own_or_staff on public.fantasy_squads;
create policy fantasy_squads_update_own_or_staff on public.fantasy_squads
for update to authenticated
using (
  public.is_staff((select auth.uid()))
  or (
    profile_id = (select auth.uid())
    and status <> 'locked'
    and exists (
      select 1
      from public.fantasy_gameweeks gw
      where gw.id = gameweek_id
        and now() <= gw.deadline_at
        and gw.status in ('draft', 'open')
    )
  )
)
with check (
  public.is_staff((select auth.uid()))
  or (
    profile_id = (select auth.uid())
    and exists (
      select 1
      from public.fantasy_gameweeks gw
      where gw.id = gameweek_id
        and now() <= gw.deadline_at
        and gw.status in ('draft', 'open')
    )
  )
);

drop policy if exists fantasy_squads_delete_own_or_staff on public.fantasy_squads;
create policy fantasy_squads_delete_own_or_staff on public.fantasy_squads
for delete to authenticated
using (
  public.is_staff((select auth.uid()))
  or (
    profile_id = (select auth.uid())
    and status <> 'locked'
    and exists (
      select 1
      from public.fantasy_gameweeks gw
      where gw.id = gameweek_id
        and now() <= gw.deadline_at
        and gw.status in ('draft', 'open')
    )
  )
);

drop policy if exists fantasy_squad_picks_select_own_or_staff on public.fantasy_squad_picks;
create policy fantasy_squad_picks_select_own_or_staff on public.fantasy_squad_picks
for select to authenticated
using (
  exists (
    select 1
    from public.fantasy_squads sq
    where sq.id = squad_id
      and (
        sq.profile_id = (select auth.uid())
        or public.is_staff((select auth.uid()))
      )
  )
);

drop policy if exists fantasy_squad_picks_insert_own_or_staff on public.fantasy_squad_picks;
create policy fantasy_squad_picks_insert_own_or_staff on public.fantasy_squad_picks
for insert to authenticated
with check (
  exists (
    select 1
    from public.fantasy_squads sq
    join public.fantasy_gameweeks gw on gw.id = sq.gameweek_id
    where sq.id = squad_id
      and (
        public.is_staff((select auth.uid()))
        or (
          sq.profile_id = (select auth.uid())
          and sq.status <> 'locked'
          and now() <= gw.deadline_at
          and gw.status in ('draft', 'open')
        )
      )
  )
);

drop policy if exists fantasy_squad_picks_update_own_or_staff on public.fantasy_squad_picks;
create policy fantasy_squad_picks_update_own_or_staff on public.fantasy_squad_picks
for update to authenticated
using (
  exists (
    select 1
    from public.fantasy_squads sq
    join public.fantasy_gameweeks gw on gw.id = sq.gameweek_id
    where sq.id = squad_id
      and (
        public.is_staff((select auth.uid()))
        or (
          sq.profile_id = (select auth.uid())
          and sq.status <> 'locked'
          and now() <= gw.deadline_at
          and gw.status in ('draft', 'open')
        )
      )
  )
)
with check (
  exists (
    select 1
    from public.fantasy_squads sq
    join public.fantasy_gameweeks gw on gw.id = sq.gameweek_id
    where sq.id = squad_id
      and (
        public.is_staff((select auth.uid()))
        or (
          sq.profile_id = (select auth.uid())
          and sq.status <> 'locked'
          and now() <= gw.deadline_at
          and gw.status in ('draft', 'open')
        )
      )
  )
);

drop policy if exists fantasy_squad_picks_delete_own_or_staff on public.fantasy_squad_picks;
create policy fantasy_squad_picks_delete_own_or_staff on public.fantasy_squad_picks
for delete to authenticated
using (
  exists (
    select 1
    from public.fantasy_squads sq
    join public.fantasy_gameweeks gw on gw.id = sq.gameweek_id
    where sq.id = squad_id
      and (
        public.is_staff((select auth.uid()))
        or (
          sq.profile_id = (select auth.uid())
          and sq.status <> 'locked'
          and now() <= gw.deadline_at
          and gw.status in ('draft', 'open')
        )
      )
  )
);

drop policy if exists fantasy_manager_scores_public_read on public.fantasy_manager_gameweek_scores;
create policy fantasy_manager_scores_public_read on public.fantasy_manager_gameweek_scores
for select to anon, authenticated
using (true);

drop policy if exists fantasy_manager_scores_staff_manage on public.fantasy_manager_gameweek_scores;
create policy fantasy_manager_scores_staff_manage on public.fantasy_manager_gameweek_scores
for all to authenticated
using (public.is_staff((select auth.uid())))
with check (public.is_staff((select auth.uid())));

insert into public.fantasy_competitions (slug, name, sport_id, gender_scope, is_active)
select
  'mens-football-fpl',
  'Olympole Men Football Fantasy',
  s.id,
  'men',
  true
from public.sports s
where lower(s.slug) = 'football'
on conflict (slug) do nothing;

insert into public.fantasy_scoring_rules (competition_id, version, rules_json, is_active)
select
  fc.id,
  1,
  jsonb_build_object(
    'appearance_60_plus', 2,
    'appearance_under_60', 1,
    'goal_gk', 10,
    'goal_def', 6,
    'goal_mid', 5,
    'goal_fwd', 4,
    'assist', 3,
    'clean_sheet_gk_def', 4,
    'clean_sheet_mid', 1,
    'penalty_saved', 5,
    'penalty_missed', -2,
    'yellow_card', -1,
    'red_card', -3,
    'own_goal', -2,
    'every_2_goals_conceded_gk_def', -1,
    'every_3_saves_gk', 1,
    'bonus', 1
  ),
  true
from public.fantasy_competitions fc
where fc.slug = 'mens-football-fpl'
on conflict (competition_id, version) do nothing;

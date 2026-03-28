-- Olympole realistic seed data for full-feature simulation.
-- This seed is idempotent and safe to run multiple times.

insert into public.app_settings (key, value)
values
  ('registration_enabled', 'true'::jsonb),
  ('predictions_enabled', 'true'::jsonb),
  ('writing_enabled', 'true'::jsonb),
  ('live_streaming_enabled', 'true'::jsonb),
  ('registration_max_events_per_user', '8'::jsonb)
on conflict (key) do update
set value = excluded.value,
    updated_at = now();

insert into public.sports (name, slug, sport_type, is_team_based, gender_division, description, is_active)
values
  ('Football', 'football', 'collective', true, 'men_women', 'League format with knockout finals and stadium finals.', true),
  ('Basketball', 'basketball', 'collective', true, 'men_women', 'Fast-paced 5v5 tournament with finals coverage.', true),
  ('Handball', 'handball', 'collective', true, 'men_women', 'Competitive handball event with pooled matches.', true),
  ('Volleyball', 'volleyball', 'collective', true, 'men_women', 'Indoor volleyball rounds and elimination stages.', true),
  ('Swimming', 'swimming', 'individual', false, 'mixed', 'Time-trial based swimming competition with finals.', true),
  ('Tennis', 'tennis', 'individual', false, 'mixed', 'Singles elimination tournament hosted off-campus.', true),
  ('Chess', 'chess', 'individual', false, 'mixed', 'Swiss rounds, variants, and puzzle challenges.', true),
  ('MMA', 'mma', 'individual', false, 'mixed', 'Safety-led combat event under qualified referees.', true),
  ('Running', 'running', 'individual', false, 'mixed', 'Sprint and endurance disciplines with route timing.', true),
  ('Talent Show', 'talent-show', 'culture', false, 'mixed', 'Open talent competition with audience voting.', true),
  ('Knowledge Cup', 'knowledge-cup', 'culture', true, 'mixed', 'Team-based quiz competition across categories.', true),
  ('Writing Contest', 'writing-contest', 'culture', false, 'mixed', 'Online writing submissions and public voting.', true),
  ('Art Exhibition', 'art-exhibition', 'culture', false, 'mixed', 'Drawing, digital art, and exhibition program.', true),
  ('Mini Game Day', 'mini-game-day', 'culture', false, 'mixed', 'Casual campus mini-game booths and activities.', true)
on conflict (slug) do update
set
  name = excluded.name,
  sport_type = excluded.sport_type,
  is_team_based = excluded.is_team_based,
  gender_division = excluded.gender_division,
  description = excluded.description,
  is_active = excluded.is_active,
  updated_at = now();

with team_seed(sport_slug, name, short_code, city, coach_name) as (
  values
    ('football', 'Atlas Falcons', 'ATF', 'Algiers', 'Karim Ziani'),
    ('football', 'North Strikers', 'NST', 'Oran', 'Amina Farah'),
    ('football', 'Campus Lions', 'CPL', 'Blida', 'Yacine Khelifa'),
    ('football', 'Blue Meteors', 'BLM', 'Tlemcen', 'Meriem Hamdi'),
    ('basketball', 'Court Kings', 'CRK', 'Algiers', 'Sofiane Belkacem'),
    ('basketball', 'Sky Dunkers', 'SKD', 'Constantine', 'Nadia Saadi'),
    ('basketball', 'Pivot Pulse', 'PVP', 'Setif', 'Ilyes Rezig'),
    ('handball', 'Rapid Hands', 'RPH', 'Algiers', 'Rami Ouali'),
    ('handball', 'Goal Guard', 'GLG', 'Oran', 'Mona Derbal'),
    ('volleyball', 'Net Storm', 'NTS', 'Algiers', 'Adel Mokrani'),
    ('volleyball', 'Spike Force', 'SPF', 'Annaba', 'Nesrine Haidar'),
    ('knowledge-cup', 'Quantum Minds', 'QMD', 'Hub', 'Rania Ait'),
    ('knowledge-cup', 'Logic Syndicate', 'LGS', 'Hub', 'Ibrahim Cherif')
)
insert into public.teams (sport_id, name, short_code, city, coach_name, is_active)
select s.id, t.name, t.short_code, t.city, t.coach_name, true
from team_seed t
join public.sports s on s.slug = t.sport_slug
on conflict (sport_id, name) do update
set
  short_code = excluded.short_code,
  city = excluded.city,
  coach_name = excluded.coach_name,
  is_active = excluded.is_active,
  updated_at = now();

with player_seed(team_name, full_name, position, jersey_number, is_captain) as (
  values
    ('Atlas Falcons', 'Youssef Benali', 'Forward', 9, true),
    ('Atlas Falcons', 'Hakim Zeroual', 'Midfielder', 8, false),
    ('Atlas Falcons', 'Nadir Belaid', 'Defender', 4, false),
    ('North Strikers', 'Sami Rouis', 'Forward', 11, true),
    ('North Strikers', 'Arezki Meziane', 'Goalkeeper', 1, false),
    ('Campus Lions', 'Mehdi Boudiaf', 'Forward', 7, true),
    ('Campus Lions', 'Amine Touil', 'Defender', 5, false),
    ('Court Kings', 'Nabil Rahmani', 'Guard', 3, true),
    ('Court Kings', 'Farid Lounis', 'Center', 15, false),
    ('Sky Dunkers', 'Sara Djemai', 'Guard', 2, true),
    ('Sky Dunkers', 'Lina Redouane', 'Forward', 12, false),
    ('Rapid Hands', 'Walid Chekkal', 'Pivot', 10, true),
    ('Goal Guard', 'Souad Merabet', 'Wing', 6, true),
    ('Net Storm', 'Hicham Mebarki', 'Setter', 1, true),
    ('Spike Force', 'Yasmine Gharbi', 'Opposite', 9, true)
)
insert into public.team_players (team_id, full_name, position, jersey_number, is_captain)
select t.id, p.full_name, p.position, p.jersey_number, p.is_captain
from player_seed p
join public.teams t on t.name = p.team_name
on conflict (team_id, full_name) do update
set
  position = excluded.position,
  jersey_number = excluded.jersey_number,
  is_captain = excluded.is_captain;

with event_seed(
  title,
  slug,
  type,
  category,
  venue,
  starts_at,
  ends_at,
  status,
  description,
  sport_slug,
  is_featured,
  is_registration_open,
  current_round,
  registration_deadline,
  max_participants
) as (
  values
    ('Opening Ceremony', 'opening-ceremony-2026', 'ceremony', 'Ceremony', 'Main Campus Stage', '2026-04-07T17:00:00Z', '2026-04-07T20:00:00Z', 'completed', 'Official launch ceremony for Olympole 2026.', null, true, false, null, '2026-04-05T23:59:00Z', 1200),
    ('Football Tournament', 'football-tournament-2026', 'sport', 'Collective Sports', 'Central Stadium', '2026-04-08T08:00:00Z', '2026-04-30T22:00:00Z', 'live', 'League stage and knockout finals.', 'football', true, true, 'Knockout', '2026-04-10T23:59:00Z', 220),
    ('Basketball Tournament', 'basketball-tournament-2026', 'sport', 'Collective Sports', 'Sports Hall A', '2026-04-09T09:00:00Z', '2026-04-28T20:00:00Z', 'live', 'Men and women brackets with semi-finals and finals.', 'basketball', true, true, 'Semi Finals', '2026-04-12T23:59:00Z', 140),
    ('Handball Tournament', 'handball-tournament-2026', 'sport', 'Collective Sports', 'Sports Hall B', '2026-04-10T09:00:00Z', '2026-04-27T20:00:00Z', 'scheduled', 'Pooled rounds and elimination stage.', 'handball', false, true, 'Group Stage', '2026-04-12T23:59:00Z', 120),
    ('Volleyball Tournament', 'volleyball-tournament-2026', 'sport', 'Collective Sports', 'Sports Hall C', '2026-04-11T10:00:00Z', '2026-04-29T19:00:00Z', 'scheduled', 'Group stage and finals.', 'volleyball', false, true, 'Group Stage', '2026-04-13T23:59:00Z', 120),
    ('Swimming Finals', 'swimming-finals-2026', 'sport', 'Individual Sports', 'City Aquatic Center', '2026-04-19T07:00:00Z', '2026-04-19T14:00:00Z', 'scheduled', 'Multiple distance categories and timed finals.', 'swimming', false, true, null, '2026-04-16T23:59:00Z', 80),
    ('Tennis Singles', 'tennis-singles-2026', 'sport', 'Individual Sports', 'West Court Complex', '2026-04-20T08:00:00Z', '2026-04-24T18:00:00Z', 'scheduled', 'Singles elimination format.', 'tennis', false, true, 'Round of 16', '2026-04-16T23:59:00Z', 64),
    ('Chess Grand Cup', 'chess-grand-cup-2026', 'sport', 'Individual Sports', 'Innovation Hall', '2026-04-18T09:00:00Z', '2026-04-22T18:00:00Z', 'live', 'Swiss rounds and puzzle challenge side event.', 'chess', false, true, 'Round 5', '2026-04-15T23:59:00Z', 100),
    ('MMA Open', 'mma-open-2026', 'sport', 'Individual Sports', 'Secure Arena', '2026-04-25T15:00:00Z', '2026-04-25T20:00:00Z', 'scheduled', 'Safety-first supervised bouts with medics onsite.', 'mma', false, true, null, '2026-04-19T23:59:00Z', 40),
    ('Running Festival', 'running-festival-2026', 'sport', 'Individual Sports', 'Campus Route + City Loop', '2026-04-26T05:30:00Z', '2026-04-26T11:30:00Z', 'scheduled', '100m sprint and 10km endurance run.', 'running', true, true, null, '2026-04-20T23:59:00Z', 500),
    ('Talent Show Finals', 'talent-show-finals-2026', 'culture', 'Cultural Events', 'Grand Auditorium', '2026-04-23T18:00:00Z', '2026-04-23T22:00:00Z', 'scheduled', 'Final stage performances and audience voting.', 'talent-show', true, true, 'Finals', '2026-04-18T23:59:00Z', 120),
    ('Knowledge Cup', 'knowledge-cup-2026', 'culture', 'Cultural Events', 'Lecture Hall 2', '2026-04-21T13:00:00Z', '2026-04-21T18:00:00Z', 'live', 'Team quiz rounds and semifinals.', 'knowledge-cup', false, true, 'Semi Finals', '2026-04-17T23:59:00Z', 60),
    ('Writing Contest', 'writing-contest-2026', 'culture', 'Cultural Events', 'Online Platform', '2026-04-08T00:00:00Z', '2026-04-30T23:59:00Z', 'live', 'Online submissions and voting window.', 'writing-contest', true, true, null, '2026-04-25T23:59:00Z', 500),
    ('Art Exhibition', 'art-exhibition-2026', 'culture', 'Cultural Events', 'Main Gallery', '2026-04-15T10:00:00Z', '2026-04-30T20:00:00Z', 'live', 'Digital and traditional art exhibition with votes.', 'art-exhibition', true, true, null, '2026-04-20T23:59:00Z', 300),
    ('Mini Game Day', 'mini-game-day-2026', 'mini_game', 'Additional Components', 'Campus Walkway', '2026-04-27T10:00:00Z', '2026-04-27T18:00:00Z', 'scheduled', 'Casual mini-games across campus stands.', 'mini-game-day', false, true, null, '2026-04-24T23:59:00Z', 1000),
    ('Closing Ceremony & Awards', 'closing-ceremony-2026', 'ceremony', 'Ceremony', 'Main Campus Stage', '2026-04-30T19:00:00Z', '2026-04-30T22:00:00Z', 'scheduled', 'Award distribution and official closure.', null, true, false, null, null, 1200)
)
insert into public.events (
  title,
  slug,
  type,
  category,
  venue,
  starts_at,
  ends_at,
  status,
  description,
  sport_id,
  is_featured,
  is_registration_open,
  current_round,
  registration_deadline,
  max_participants,
  visibility
)
select
  e.title,
  e.slug,
  e.type::event_type,
  e.category,
  e.venue,
  e.starts_at::timestamptz,
  e.ends_at::timestamptz,
  e.status::event_status,
  e.description,
  s.id,
  e.is_featured,
  e.is_registration_open,
  e.current_round,
  e.registration_deadline::timestamptz,
  e.max_participants,
  'public'
from event_seed e
left join public.sports s on s.slug = e.sport_slug
on conflict (slug) do update
set
  title = excluded.title,
  type = excluded.type,
  category = excluded.category,
  venue = excluded.venue,
  starts_at = excluded.starts_at,
  ends_at = excluded.ends_at,
  status = excluded.status,
  description = excluded.description,
  sport_id = excluded.sport_id,
  is_featured = excluded.is_featured,
  is_registration_open = excluded.is_registration_open,
  current_round = excluded.current_round,
  registration_deadline = excluded.registration_deadline,
  max_participants = excluded.max_participants,
  visibility = excluded.visibility,
  updated_at = now();

with match_seed(
  event_slug,
  sport_slug,
  team_a,
  team_b,
  score_a,
  score_b,
  status,
  round,
  venue,
  starts_at,
  event_phase,
  mvp_player,
  live_minute,
  is_prediction_locked,
  notes
) as (
  values
    ('football-tournament-2026', 'football', 'Atlas Falcons', 'North Strikers', 2, 1, 'completed', 'Quarter Final', 'Central Stadium', '2026-04-18T17:00:00Z', 'knockout', 'Youssef Benali', null, true, 'seeded fixture'),
    ('football-tournament-2026', 'football', 'Campus Lions', 'Blue Meteors', 1, 1, 'live', 'Quarter Final', 'Central Stadium', '2026-04-28T17:00:00Z', 'knockout', null, 71, false, 'seeded fixture'),
    ('basketball-tournament-2026', 'basketball', 'Court Kings', 'Sky Dunkers', 84, 80, 'completed', 'Semi Final', 'Sports Hall A', '2026-04-19T15:30:00Z', 'playoffs', 'Nabil Rahmani', null, true, 'seeded fixture'),
    ('basketball-tournament-2026', 'basketball', 'Pivot Pulse', 'Court Kings', 65, 67, 'scheduled', 'Final', 'Sports Hall A', '2026-04-29T16:30:00Z', 'final', null, null, false, 'seeded fixture'),
    ('handball-tournament-2026', 'handball', 'Rapid Hands', 'Goal Guard', 0, 0, 'scheduled', 'Group A', 'Sports Hall B', '2026-04-22T14:00:00Z', 'group', null, null, false, 'seeded fixture'),
    ('volleyball-tournament-2026', 'volleyball', 'Net Storm', 'Spike Force', 2, 0, 'live', 'Group B', 'Sports Hall C', '2026-04-28T12:00:00Z', 'group', null, 2, false, 'seeded fixture'),
    ('knowledge-cup-2026', 'knowledge-cup', 'Quantum Minds', 'Logic Syndicate', 42, 39, 'completed', 'Semi Final', 'Lecture Hall 2', '2026-04-21T14:00:00Z', 'semi', 'Rym Haddad', null, true, 'seeded fixture')
)
insert into public.matches (
  event_id,
  sport,
  team_a,
  team_b,
  score_a,
  score_b,
  status,
  round,
  venue,
  starts_at,
  team_a_id,
  team_b_id,
  event_phase,
  mvp_player,
  live_minute,
  is_prediction_locked,
  notes,
  winning_team_id
)
select
  e.id,
  s.name,
  ms.team_a,
  ms.team_b,
  ms.score_a,
  ms.score_b,
  ms.status::match_status,
  ms.round,
  ms.venue,
  ms.starts_at::timestamptz,
  ta.id,
  tb.id,
  ms.event_phase,
  ms.mvp_player,
  ms.live_minute,
  ms.is_prediction_locked,
  ms.notes,
  case
    when ms.status = 'completed' and ms.score_a > ms.score_b then ta.id
    when ms.status = 'completed' and ms.score_b > ms.score_a then tb.id
    else null
  end
from match_seed ms
join public.events e on e.slug = ms.event_slug
join public.sports s on s.slug = ms.sport_slug
left join public.teams ta on ta.name = ms.team_a and ta.sport_id = s.id
left join public.teams tb on tb.name = ms.team_b and tb.sport_id = s.id
on conflict (event_id, team_a, team_b, starts_at) do update
set
  score_a = excluded.score_a,
  score_b = excluded.score_b,
  status = excluded.status,
  round = excluded.round,
  venue = excluded.venue,
  team_a_id = excluded.team_a_id,
  team_b_id = excluded.team_b_id,
  event_phase = excluded.event_phase,
  mvp_player = excluded.mvp_player,
  live_minute = excluded.live_minute,
  is_prediction_locked = excluded.is_prediction_locked,
  notes = excluded.notes,
  winning_team_id = excluded.winning_team_id,
  updated_at = now();

with result_seed(event_slug, participant_or_team_name, placement, medal, score_summary, published_at) as (
  values
    ('football-tournament-2026', 'Atlas Falcons', 1, 'gold', 'Final standings after knockout phase.', '2026-04-30T20:30:00Z'),
    ('football-tournament-2026', 'North Strikers', 2, 'silver', 'Strong defensive run through semifinals.', '2026-04-30T20:30:00Z'),
    ('football-tournament-2026', 'Campus Lions', 3, 'bronze', 'Third place playoff winners.', '2026-04-30T20:30:00Z'),
    ('basketball-tournament-2026', 'Court Kings', 1, 'gold', 'Narrow final victory, 67-65.', '2026-04-29T19:00:00Z'),
    ('basketball-tournament-2026', 'Pivot Pulse', 2, 'silver', 'Excellent semifinal and final showing.', '2026-04-29T19:00:00Z'),
    ('knowledge-cup-2026', 'Quantum Minds', 1, 'gold', 'Top scoring across quiz rounds.', '2026-04-21T18:00:00Z'),
    ('knowledge-cup-2026', 'Logic Syndicate', 2, 'silver', 'Reached finals after close semis.', '2026-04-21T18:00:00Z')
)
insert into public.results (
  event_id,
  participant_or_team_name,
  placement,
  medal,
  score_summary,
  published_at
)
select
  e.id,
  r.participant_or_team_name,
  r.placement,
  r.medal,
  r.score_summary,
  r.published_at::timestamptz
from result_seed r
join public.events e on e.slug = r.event_slug
on conflict (event_id, participant_or_team_name, placement) do update
set
  medal = excluded.medal,
  score_summary = excluded.score_summary,
  published_at = excluded.published_at;

with stream_seed(title, description, event_slug, playback_url, status, access, starts_at, ends_at) as (
  values
    ('Olympole Main Stage Live', 'Primary stream for ceremonies and finals.', 'closing-ceremony-2026', 'https://www.youtube.com/embed/5qap5aO4i9A', 'live', 'public', '2026-04-30T18:30:00Z', null),
    ('Talent Show Backstage Feed', 'Restricted backstage feed for organizers.', 'talent-show-finals-2026', 'https://www.youtube.com/embed/jfKfPfyJRdk', 'draft', 'private', null, null)
)
insert into public.live_streams (title, description, event_id, playback_url, status, access, starts_at, ends_at)
select
  ss.title,
  ss.description,
  e.id,
  ss.playback_url,
  ss.status::stream_status,
  ss.access::stream_access,
  ss.starts_at::timestamptz,
  ss.ends_at::timestamptz
from stream_seed ss
left join public.events e on e.slug = ss.event_slug
where not exists (
  select 1
  from public.live_streams ls
  where ls.title = ss.title
    and coalesce(ls.starts_at, 'epoch'::timestamptz) = coalesce(ss.starts_at::timestamptz, 'epoch'::timestamptz)
);

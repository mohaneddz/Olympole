# Olympole MVP

Olympole is the ESC Club operations platform for OLYMPOLE 2026.

This version is a working MVP built on Next.js 16 + Supabase with:
- auth + protected admin routes
- persisted registrations
- admin event/match/result management
- public schedule/results/match center from database
- predictions (winner-pick with scoring)
- writing submissions + voting + admin moderation
- runtime feature toggles
- profile management page
- sports/team management
- live stream management + public live page
- multi-event enrollment

## Stack

- Next.js 16.2.1 (App Router)
- React 19
- TypeScript
- Tailwind CSS v4
- Supabase (Auth + Postgres + RLS)
- Zod validation

## Environment Variables

Create `.env` with:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY=
SUPABASE_SEC_KEY=
SUPABASE_CONNECTION_STRING=
ADMIN_EMAILS=admin1@example.com,admin2@example.com
```

Notes:
- `SUPABASE_SEC_KEY` must stay server-only.
- `ADMIN_EMAILS` is used by app-level role sync and should contain lowercase emails.

## Setup

```bash
pnpm install
```

Supabase local init is already present in `supabase/`.

## Database Migrations

Migration files are in `supabase/migrations/`.

Apply migration to remote:

```bash
supabase db push --db-url "$SUPABASE_CONNECTION_STRING"
```

Seed realistic sample data (sports, teams, events, matches, results, streams):

```bash
supabase db reset --db-url "$SUPABASE_CONNECTION_STRING"
```

If you cannot resolve `db.<project-ref>.supabase.co`, verify your connection string and DNS/network access.

## Run

```bash
pnpm dev
```

## Quality Commands

```bash
pnpm lint
pnpm build
```

## Key Routes

Public:
- `/`
- `/sports`
- `/schedule`
- `/results`
- `/match-center`
- `/predictions`
- `/register`
- `/profile`
- `/live`
- `/culture/*`
- `/login`

Admin (protected):
- `/admin`
- `/admin/users`
- `/admin/events`
- `/admin/sports`
- `/admin/live`
- `/admin/system`
- `/admin/settings`

## MVP Scope Delivered

- Stabilized codebase and fixed lint blockers
- Added backend foundation with migration + RLS policies
- Implemented auth flow and route protection
- Wired registration submission + admin approval flow
- Replaced static schedule/results/match-center with DB reads
- Implemented event/match/result admin CRUD basics
- Implemented prediction submissions + scoring rerun action
- Implemented writing submissions, voting, moderation
- Added loading/error/not-found handling

## Backup / Ops Notes

- Keep migration SQL under `supabase/migrations/` as source of truth.
- Use periodic Postgres dumps from Supabase dashboard or `pg_dump` against `SUPABASE_CONNECTION_STRING`.
- Record admin actions via `admin_activity_logs` (already wired).

# Vitalize

A glassmorphic health analytics dashboard for tracking daily vitals — steps, hydration, sleep, and calories — with progress rings, trend charts, and goal management.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080)
- `pnpm --filter @workspace/vitalize run dev` — run the frontend (port 26128)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite, Tailwind CSS, Framer Motion, Recharts, Wouter
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `lib/api-spec/openapi.yaml` — OpenAPI contract (source of truth)
- `lib/db/src/schema/health_logs.ts` — health_logs table
- `lib/db/src/schema/goals.ts` — goals table
- `lib/api-client-react/src/generated/` — generated React Query hooks
- `lib/api-zod/src/generated/` — generated Zod schemas
- `artifacts/api-server/src/routes/health-logs.ts` — health log CRUD routes
- `artifacts/api-server/src/routes/goals.ts` — goals routes
- `artifacts/vitalize/src/` — React frontend

## Architecture decisions

- OpenAPI-first: all contracts defined in `openapi.yaml`, frontend/backend types generated via Orval
- POST `/health-logs` upserts by date — logging the same day twice updates rather than errors
- Goals auto-initialize to defaults if none exist (single-row pattern)
- `/health-logs/today`, `/health-logs/summary`, and `/health-logs/trend` are derived/aggregate endpoints that make the dashboard feel real without extra frontend logic
- Dark mode is the primary and only mode; no light mode toggle needed

## Product

- Dashboard with animated SVG progress rings (steps, hydration, sleep, calories) and a 7-day area trend chart
- Log Entry page for quick metric entry (upserts today's log)
- History page with scrollable past entries and delete/edit actions
- Goals settings page to configure daily targets

## Gotchas

- Always run `pnpm --filter @workspace/api-spec run codegen` after changing `openapi.yaml`
- Always run `pnpm run typecheck:libs` after changing DB schema files before typechecking leaf packages
- After changing DB schema, run `pnpm --filter @workspace/db run push`

# Internal Dev Portal

A production-shaped internal developer portal for startups and growing engineering teams.

This app is positioned as a Backstage-lite platform that brings together:

- service catalog and ownership
- markdown docs and runbooks
- environment and deploy links
- GitHub auth and repository sync
- webhook-driven engineering activity
- workspace roles, invites, and audit logging

## Current Status

The project is in a strong working-v1 state and is ready to demo as a portfolio-quality SaaS.

What is complete today:

- authenticated app shell with protected routes
- premium visual redesign across landing, shell, dashboard, catalog, service detail, docs, activity, and admin screens
- services, teams, and markdown document CRUD
- GitHub login plus local demo access
- membership-aware access control with invite-based onboarding
- repository import from GitHub and repo-to-service linking
- signed GitHub webhook verification and normalized activity events
- role-based mutation guards and audit logs
- command-style global search with keyboard navigation
- focused Vitest unit tests for permissions, env validation, invites, and webhook logic
- Playwright smoke coverage for login, dashboard, catalog mutation, docs, and search-to-service navigation
- CI, Docker packaging, Render blueprint support, and a deployment-friendly health route
- PostgreSQL migration history and seeded demo data
- safe hosted bootstrap flow that seeds demo data only when the database is empty

What is still pending:

- final consistency pass for empty, loading, and error states across the main product surfaces
- background workers for recurring health checks and sync jobs
- deeper E2E coverage beyond the current smoke suite
- final hosted OAuth and webhook validation against a live public URL

## What Makes This Showcase-Ready

The current implementation is intentionally shaped like a real SaaS foundation rather than a static UI prototype:

- Next.js App Router with protected routes
- GitHub OAuth plus local demo access
- Prisma-backed PostgreSQL data model with migration history
- CRUD for services, teams, and markdown documents
- many-to-many repository-to-service mapping
- signed GitHub webhook verification and normalization
- invite-based onboarding and membership-aware access
- role-based authorization on server mutations
- audit logging for administrative and catalog changes
- activity feed that captures both manual and integration-driven events
- real command-style global search with keyboard navigation
- focused Vitest unit coverage plus Playwright browser smoke coverage
- GitHub Actions CI, production build/start verification, Docker standalone packaging, and Render blueprint support
- a cohesive UI system across both shell and inner product workflows

## Verified

The current build has been verified with:

- `npm run prisma:generate`
- `npm run prisma:seed`
- `npm run prisma:seed:if-empty`
- `npm run typecheck`
- `npm run test`
- `npm run build`
- `npm run test:e2e`
- `npm run start`

Operational verification completed against PostgreSQL:

- seed data loads successfully
- `/api/health` returns `database: ok`
- protected routes respond normally against the Postgres-backed app
- invite links resolve correctly against the same runtime base URL used for webhook instructions

## Tech Stack

- Next.js 15
- TypeScript
- NextAuth v5 beta
- Prisma
- PostgreSQL
- Zod for server-side validation and env parsing
- Vitest for focused unit tests
- Playwright for browser smoke tests
- Lucide icons and custom UI styles
- Docker Compose for local database orchestration

## Feature Snapshot

### Product surfaces

- landing page
- dashboard
- service catalog
- service detail pages
- docs and runbooks
- activity feed
- integrations admin
- members admin with invite management
- public invite-acceptance flow

### Platform capabilities

- workspace roles: `owner`, `admin`, `editor`, `viewer`
- workspace invites and membership-aware login
- Prisma data layer
- migration-backed schema management
- audit logging
- search API and keyboard-driven command palette
- GitHub OAuth
- GitHub repo import
- GitHub webhook ingestion
- health endpoint
- CI workflow
- Docker deployment path
- Render blueprint for hosted deployment

## Local Setup

1. Install dependencies.
2. Copy `.env.example` to `.env`.
3. Fill in the GitHub OAuth values if you want real GitHub login.
4. Start the local PostgreSQL container.
5. Generate Prisma client.
6. Apply migrations.
7. Seed demo data.
8. Start the app.

```powershell
npm install
npm run db:start
npm run prisma:generate
npm run prisma:migrate:deploy
npm run prisma:seed
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

If you want to test the production build locally instead:

```powershell
npm run build
npm run start
```

If you want to run the browser smoke suite locally:

```powershell
npm run test:e2e:install
npm run test:e2e
```

## Environment Variables

- `DATABASE_URL`: PostgreSQL connection string
- `AUTH_SECRET`: secret used by NextAuth
- `GITHUB_CLIENT_ID`: GitHub OAuth app client ID
- `GITHUB_CLIENT_SECRET`: GitHub OAuth app client secret
- `GITHUB_WEBHOOK_SECRET`: shared secret used to verify signed GitHub webhooks
- `NEXT_PUBLIC_APP_URL`: optional explicit base URL used for invite links and webhook configuration instructions

Runtime URL resolution order:

1. `NEXT_PUBLIC_APP_URL`
2. `RENDER_EXTERNAL_URL`
3. `VERCEL_PROJECT_PRODUCTION_URL`
4. `VERCEL_URL`
5. `http://localhost:3000`

The app validates runtime configuration at startup. In production mode, `AUTH_SECRET` is required, GitHub OAuth credentials must be provided as a complete pair, and `DATABASE_URL` must be a PostgreSQL connection string.

## Local PostgreSQL

A local Postgres container is defined in `docker-compose.yml`.

Useful commands:

- `npm run db:start`
- `npm run db:stop`
- `npm run db:logs`
- `npm run db:reset`

Default local connection string:

```text
postgresql://postgres:postgres@localhost:5432/internal_dev_portal?schema=public
```

## Prisma Migrations

The migrations live under `prisma/migrations`.

This project uses normal Prisma migration history in CI and on Linux-hosted deployment targets.

Local note for this Windows machine:

- Prisma's schema engine is still intermittently failing for `prisma migrate dev` and `prisma migrate deploy` even though the schema validates.
- CI and hosted Linux environments should use the standard Prisma commands.
- If the local migration engine fails again, use the committed SQL migrations as the source of truth.

## End-to-End Tests

Playwright configuration lives in `playwright.config.ts` and the smoke tests live under `tests/e2e`.

Current test files:

- `tests/e2e/auth.setup.ts`
- `tests/e2e/smoke.spec.ts`

The smoke suite authenticates with demo access and exercises a small but meaningful slice of the real product workflow.

## GitHub OAuth Setup

Create a GitHub OAuth App with:

- Homepage URL: `http://localhost:3000`
- Authorization callback URL: `http://localhost:3000/api/auth/callback/github`

For a hosted deployment, change both values to your public app URL.

GitHub sign-in is membership-aware in the current build:

- existing workspace members can enter directly
- invited users can sign in and then accept their invite from the join page
- users without membership or a valid invite stay on `/login`

## GitHub Webhook Setup

After login, the Integrations page shows the webhook endpoint. Locally it will be:

```text
http://localhost:3000/api/webhooks/github
```

Configure the webhook in GitHub with:

- content type: `application/json`
- secret: the same value as `GITHUB_WEBHOOK_SECRET`
- events: `push`, `release`, and `workflow_run`

Supported normalized events today:

- `push`
- `release` when published
- `workflow_run` when completed

These deliveries are stored in the database and surfaced in the Integrations page.

## Health and Operations

A deployment-friendly health endpoint is available at:

```text
/api/health
```

It reports:

- service availability
- database connectivity
- runtime configuration status
- whether GitHub OAuth and webhook secrets are configured

## CI Pipeline

A GitHub Actions workflow lives at `.github/workflows/ci.yml`.

On every push and pull request it:

1. provisions a PostgreSQL service container
2. installs dependencies
3. applies Prisma migrations and seeds demo data
4. runs typecheck, unit tests, and production build
5. installs Playwright Chromium
6. runs the Playwright smoke suite
7. builds the demo Docker image

## Hosted Deployment

### Render blueprint

A Render blueprint is included at the repository root in `render.yaml`.

It deploys:

- a Node web service for `internal-dev-portal`
- a managed PostgreSQL database

The blueprint is configured to:

- build from the `internal-dev-portal` subdirectory
- run `prisma migrate deploy` before each deploy
- run `prisma:seed:if-empty` so the first deploy gets demo data without wiping later data
- populate `DATABASE_URL` from the managed Postgres instance
- generate `AUTH_SECRET` and `GITHUB_WEBHOOK_SECRET`
- use `/api/health` as the health check

Before the hosted GitHub integration is fully live, you still need to fill in:

- `GITHUB_CLIENT_ID`
- `GITHUB_CLIENT_SECRET`

After Render assigns the public URL, update your GitHub OAuth app callback URL and webhook settings to match that hosted domain.

### Docker image + external PostgreSQL

A multistage `Dockerfile` is included and Next.js is configured with `output: "standalone"`.

```powershell
docker build -t internal-dev-portal .
docker run -p 3000:3000 -e DATABASE_URL="postgresql://..." -e AUTH_SECRET="..." internal-dev-portal
```

## Auth and Roles

Workspace roles are enforced on the server:

- `owner`
- `admin`
- `editor`
- `viewer`

Permissions in the current build:

- owner/admin: member roles, invites, teams, integrations, repo links
- editor and above: services and documents
- viewer: read-only portal access

## Demo Notes

- Demo access creates a local owner session immediately.
- Seed data includes example services, docs, audit logs, webhook deliveries, and a pending invite so the product feels alive on first run.
- The seeded invite token is `demo-invite-token`.
- Hosted bootstrap uses `prisma:seed:if-empty` so demo data appears on the first deployment without resetting later data.

## Scripts

- `npm run dev`
- `npm run build`
- `npm run start`
- `npm run typecheck`
- `npm run test`
- `npm run test:coverage`
- `npm run test:e2e`
- `npm run test:e2e:headed`
- `npm run test:e2e:debug`
- `npm run test:e2e:install`
- `npm run check`
- `npm run prisma:generate`
- `npm run prisma:migrate`
- `npm run prisma:migrate:deploy`
- `npm run prisma:seed`
- `npm run prisma:seed:if-empty`
- `npm run db:start`
- `npm run db:stop`
- `npm run db:logs`
- `npm run db:reset`


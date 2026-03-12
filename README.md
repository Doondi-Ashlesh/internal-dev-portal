# Internal Dev Portal

A production-shaped internal developer portal for startups and growing engineering teams.

This app is positioned as a Backstage-lite platform that brings together:

- service catalog and ownership
- markdown docs and runbooks
- environment and deploy links
- GitHub auth and repository sync
- webhook-driven engineering activity
- workspace roles and audit logging

## Current Status

The project is now in a strong working-v1 state and is already demoable as a portfolio-quality product.

What is complete today:

- authenticated app shell with protected routes
- premium visual redesign with a polished engineering-operations look and feel
- coordinated inner-screen polish across dashboard, catalog, docs, activity, service detail, and admin experiences
- dashboard, catalog, docs, activity, service detail, and admin areas
- services, teams, and markdown document CRUD
- GitHub login plus local demo access
- repository import from GitHub and repo-to-service linking
- signed GitHub webhook verification and normalized activity events
- role-based mutation guards and audit logs
- command-style global search
- focused unit tests for permissions, env validation, and webhook logic
- Playwright smoke coverage for login, dashboard, catalog mutation, docs, and search-to-service navigation
- CI, Docker packaging, and a deployment-friendly health route
- PostgreSQL migration with Prisma migration history and seeded demo data
- sidebar usability fix so the left navigation scrolls independently

What is still pending:

- final consistency pass for empty, loading, and error states across the main product surfaces
- richer member management and invite flows
- background workers for recurring health checks or sync jobs
- deeper E2E coverage beyond the current smoke suite
- final hosted deployment and production environment validation

## What Makes This Showcase-Ready

The current implementation is intentionally shaped like a real SaaS foundation rather than a static UI prototype:

- Next.js App Router with protected routes
- GitHub OAuth plus local demo access
- Prisma-backed PostgreSQL data model with migration history
- CRUD for services, teams, and markdown documents
- many-to-many repository-to-service mapping
- signed GitHub webhook verification and normalization
- role-based authorization on server mutations
- audit logging for administrative and catalog changes
- activity feed that captures both manual and integration-driven events
- real command-style global search with keyboard navigation
- focused Vitest unit coverage plus Playwright browser smoke coverage
- GitHub Actions CI and standalone deployment packaging
- a cohesive UI system across the shell and the main in-product workflows

## Design Refresh

The latest pass upgraded the product from a functional admin interface to a more portfolio-ready engineering console.

Highlights:

- stronger typography with a clearer brand and UI hierarchy
- darker, more premium control-plane shell styling
- richer surfaces, cards, buttons, inputs, and search presentation
- layered background treatment and more intentional motion
- redesigned landing page that feels like a serious SaaS product
- sidebar structure and workspace chrome that better match the platform use case
- dashboard, service detail, and admin surfaces that now match the shell much more closely

Latest inner-screen polish delivered:

- stronger dashboard hero, metrics, and content hierarchy
- richer service detail posture, metadata, docs, and activity presentation
- more intentional admin form and management surfaces for services, docs, teams, and integrations

Remaining UI follow-up:

- align empty, loading, and error states with the new visual system
- do one final micro-interaction and spacing consistency pass if needed

## Verified Today

The current build has been verified with:

- `npm run db:start`
- `npm run db:setup`
- `npm run typecheck`
- `npm run test`
- `npm run build`
- `npm run test:e2e`
- `npm run check`
- `npm run start`

Focused unit tests currently cover:

- role and permission gating
- runtime environment validation
- GitHub webhook signature verification
- normalized webhook event mapping for `push`, `release`, and `workflow_run`

Playwright smoke coverage currently covers:

- demo login flow
- dashboard rendering
- global search to service detail navigation
- catalog create/delete mutation
- docs page rendering

Operational verification completed against PostgreSQL:

- Prisma migration applied successfully
- seed data loaded successfully
- `/api/health` returns `database: ok`
- protected routes respond normally against the Postgres-backed app

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
- members admin

### Platform capabilities

- workspace roles: `owner`, `admin`, `editor`, `viewer`
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

## Local Setup

1. Install dependencies.
2. Copy `.env.example` to `.env`.
3. Fill in the GitHub OAuth values if you want real GitHub login.
4. Start the local PostgreSQL container.
5. Apply migrations and seed demo data.
6. Start the app.

```powershell
npm install
npm run db:start
npm run db:setup
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
- `NEXT_PUBLIC_APP_URL`: base URL used for displaying webhook configuration instructions

The app validates runtime configuration at startup. In production mode, `AUTH_SECRET` is required, GitHub OAuth credentials must be provided as a complete pair, and `DATABASE_URL` must be a PostgreSQL connection string.

## Local PostgreSQL

A local Postgres container is defined in `docker-compose.yml`.

Useful commands:

- `npm run db:start`
- `npm run db:setup`
- `npm run db:stop`
- `npm run db:logs`
- `npm run db:reset`

Default local connection string:

```text
postgresql://postgres:postgres@localhost:5432/internal_dev_portal?schema=public
```

## Prisma Migrations

The initial PostgreSQL migration lives in `prisma/migrations/20260311142000_init/migration.sql`.

This project now uses standard Prisma migration flow instead of the earlier SQLite bootstrap script path.

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

Once configured, sign in through `/login` and use the Integrations area to import repositories.

## GitHub Webhook Setup

After login, the Integrations page shows the webhook endpoint. For local development, it will be:

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

## Deployment Options

### Option 1: Node host + managed PostgreSQL

This is the cleanest production-shaped deployment path for the app.

```powershell
npm install
npm run build
npm run start
```

Use a managed Postgres instance and set `DATABASE_URL` in the environment.

### Option 2: Docker image + external PostgreSQL

A multistage `Dockerfile` is included and Next.js is configured with `output: "standalone"`.

```powershell
docker build -t internal-dev-portal .
docker run -p 3000:3000 -e DATABASE_URL="postgresql://..." internal-dev-portal
```

## Known Gaps

- There is a non-blocking Vitest warning caused by the parent workspace `tsconfig.json` extending Expo config outside this app.
- The current Playwright suite is a smoke layer, not deep regression coverage.
- Background jobs for recurring health checks and richer sync workflows are not built yet.
- Hosted production deployment has not been exercised yet.
- Playwright still prints a local warning because the smoke suite uses `next start` while Next recommends the standalone server for this output mode. The suite still passes.

## Auth and Roles

Workspace roles are enforced on the server:

- `owner`
- `admin`
- `editor`
- `viewer`

Permissions in the current build:

- owner/admin: member roles, teams, integrations, repo links
- editor and above: services and documents
- viewer: read-only portal access

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
- `npm run db:start`
- `npm run db:stop`
- `npm run db:logs`
- `npm run db:reset`
- `npm run db:setup`
- `npm run db:dev:setup`

## Demo Notes

- Demo access creates a local owner session immediately.
- GitHub sign-in auto-provisions local workspace membership in development so you can test integrations quickly.
- Seed data includes example services, docs, audit logs, and webhook deliveries to make the product feel alive on first run.
- The seeded workspace is stored in PostgreSQL.

## Next Recommended Work

1. Deploy the app against a managed Postgres instance and verify the hosted production story.
2. Validate GitHub OAuth and webhook behavior in the hosted environment.
3. Improve member invitation and workspace onboarding flows.
4. Add worker-based health polling and recurring sync jobs.
5. Expand Playwright coverage for members, integrations, and document CRUD.
6. Add a final consistency pass for empty, loading, and error states.
7. Add richer failure-state coverage around GitHub webhook processing and repo sync.
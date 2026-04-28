# Internal Dev Portal

An internal developer portal for fast-moving engineering teams. Brings service ownership, documentation, deploy context, and GitHub activity into one place — without the overhead of heavyweight platform tooling.

## Screenshots

### Landing page

![Landing page](./landing-zoom1.png)

### Sign in

![Sign in](./login-zoom1.png)

### Dashboard

![Dashboard](./dashboard.png)

### Service catalog

![Service catalog](./catalog.png)

### Service detail

![Service detail](./service-detail.png)

### Docs and runbooks

![Docs and runbooks](./docs.png)

### Activity feed

![Activity feed](./activity.png)

## Features

- **Service catalog** — register services with ownership, environment links, and repository connections
- **Docs and runbooks** — create and manage markdown documents scoped to your workspace
- **Activity feed** — unified changelog driven by GitHub webhooks and manual entries
- **GitHub integration** — OAuth sign-in, repository import, and signed webhook ingestion for push, release, and workflow events
- **Workspace access control** — roles (`owner`, `admin`, `editor`, `viewer`), invite-based onboarding, and membership-aware login
- **Audit logging** — server-side audit trail for catalog and administrative changes
- **Global search** — command-style search with keyboard navigation across services, docs, and teams
- **Health endpoint** — `/api/health` reports database connectivity and configuration status
- **CI/CD ready** — GitHub Actions workflow, Docker standalone image, and Render blueprint included

## Tech Stack

- Next.js 15 (App Router)
- TypeScript
- NextAuth v5
- Prisma
- PostgreSQL
- Zod for server-side validation and env parsing
- Vitest for unit tests
- Playwright for end-to-end tests
- Docker Compose for local database orchestration

## Local Setup

1. Install dependencies.
2. Copy `.env.example` to `.env`.
3. Fill in your GitHub OAuth credentials.
4. Start the local PostgreSQL container.
5. Generate the Prisma client.
6. Apply migrations.
7. Seed demo data.
8. Start the app.

```bash
npm install
npm run db:start
npm run prisma:generate
npm run prisma:migrate:deploy
npm run prisma:seed
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

To run the production build locally:

```bash
npm run build
npm run start
```

To run the browser test suite:

```bash
npm run test:e2e:install
npm run test:e2e
```

## Environment Variables

- `DATABASE_URL`: PostgreSQL connection string
- `AUTH_SECRET`: secret used by NextAuth
- `GITHUB_CLIENT_ID`: GitHub OAuth app client ID
- `GITHUB_CLIENT_SECRET`: GitHub OAuth app client secret
- `GITHUB_WEBHOOK_SECRET`: shared secret used to verify signed GitHub webhooks
- `NEXT_PUBLIC_APP_URL`: base URL used for invite links and webhook configuration instructions

Runtime URL resolution order:

1. `NEXT_PUBLIC_APP_URL`
2. `RENDER_EXTERNAL_URL`
3. `VERCEL_PROJECT_PRODUCTION_URL`
4. `VERCEL_URL`
5. `http://localhost:3000`

In production mode, `AUTH_SECRET` is required, GitHub OAuth credentials must be provided as a complete pair, and `DATABASE_URL` must be a PostgreSQL connection string.

## Local PostgreSQL

A local Postgres container is defined in `docker-compose.yml`.

```bash
npm run db:start   # start the container
npm run db:stop    # stop the container
npm run db:logs    # stream logs
npm run db:reset   # wipe and restart
```

Default local connection string:

```
postgresql://postgres:postgres@localhost:5432/internal_dev_portal?schema=public
```

## Prisma Migrations

Migrations live under `prisma/migrations`. Apply them with:

```bash
npm run prisma:migrate:deploy
```

## End-to-End Tests

Playwright configuration is in `playwright.config.ts`. Tests live under `tests/e2e`.

- `tests/e2e/auth.setup.ts` — authenticates a demo workspace session
- `tests/e2e/smoke.spec.ts` — exercises login, dashboard, catalog, docs, and search

## GitHub OAuth Setup

Create a GitHub OAuth App with:

- Homepage URL: `http://localhost:3000`
- Authorization callback URL: `http://localhost:3000/api/auth/callback/github`

For a hosted deployment, update both values to your public URL.

Sign-in is membership-aware:

- existing workspace members sign in directly
- invited users sign in and accept their invite from the join page
- users without membership or a valid invite remain on `/login`

## GitHub Webhook Setup

The webhook endpoint is shown on the Integrations page after login. Locally:

```
http://localhost:3000/api/webhooks/github
```

Configure the webhook in GitHub with:

- Content type: `application/json`
- Secret: the value of `GITHUB_WEBHOOK_SECRET`
- Events: `push`, `release`, `workflow_run`

Supported events:

- `push`
- `release` (published)
- `workflow_run` (completed)

Deliveries are stored in the database and displayed on the Integrations page.

## Health and Operations

```
GET /api/health
```

Returns:

- service status
- database connectivity
- runtime configuration status
- GitHub OAuth and webhook secret presence

## CI Pipeline

The GitHub Actions workflow at `.github/workflows/ci.yml` runs on every push and pull request:

1. Provisions a PostgreSQL service container
2. Installs dependencies
3. Applies Prisma migrations and seeds data
4. Runs typecheck, unit tests, and production build
5. Installs Playwright Chromium and runs the smoke suite
6. Builds the Docker image

## Hosted Deployment

### Render

A Render blueprint at `render.yaml` deploys a Node web service and a managed PostgreSQL database.

The blueprint:

- runs `prisma migrate deploy` before each deploy
- runs `prisma:seed:if-empty` so the first deploy is seeded without overwriting later data
- wires `DATABASE_URL` from the managed Postgres instance
- auto-generates `AUTH_SECRET` and `GITHUB_WEBHOOK_SECRET`
- uses `/api/health` as the health check

Set `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET` in the Render dashboard, then update your GitHub OAuth app's callback URL to match the assigned public URL.

### Docker

```bash
docker build -t internal-dev-portal .
docker run -p 3000:3000 \
  -e DATABASE_URL="postgresql://..." \
  -e AUTH_SECRET="..." \
  internal-dev-portal
```

## Auth and Roles

Roles are enforced server-side on all mutations:

| Role | Access |
|------|--------|
| `owner` / `admin` | members, invites, teams, integrations, repository links |
| `editor` | services and documents |
| `viewer` | read-only access |

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run typecheck` | TypeScript check |
| `npm run test` | Unit tests |
| `npm run test:coverage` | Unit tests with coverage |
| `npm run test:e2e` | Playwright smoke suite |
| `npm run test:e2e:headed` | Playwright with browser UI |
| `npm run test:e2e:debug` | Playwright in debug mode |
| `npm run test:e2e:install` | Install Playwright browsers |
| `npm run check` | Typecheck + unit tests |
| `npm run prisma:generate` | Generate Prisma client |
| `npm run prisma:migrate` | Create and apply a migration |
| `npm run prisma:migrate:deploy` | Apply migrations (production) |
| `npm run prisma:seed` | Seed demo data |
| `npm run prisma:seed:if-empty` | Seed only if database is empty |
| `npm run db:start` | Start local Postgres container |
| `npm run db:stop` | Stop local Postgres container |
| `npm run db:logs` | Stream Postgres logs |
| `npm run db:reset` | Wipe and restart Postgres |

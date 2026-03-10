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
- dashboard, catalog, docs, activity, service detail, and admin areas
- services, teams, and markdown document CRUD
- GitHub login plus local demo access
- repository import from GitHub and repo-to-service linking
- signed GitHub webhook verification and normalized activity events
- role-based mutation guards and audit logs
- command-style global search
- focused unit tests for permissions, env validation, and webhook logic
- CI, Docker packaging, and a deployment-friendly health route
- sidebar usability fix so the left navigation scrolls independently

What is still pending:

- PostgreSQL migration
- broader automated test coverage
- richer member management and invite flows
- background workers for recurring health checks or sync jobs
- final production validation on a hosted Postgres-backed environment

## What Makes This Showcase-Ready

The current implementation is intentionally shaped like a real SaaS foundation rather than a static UI prototype:

- Next.js App Router with protected routes
- GitHub OAuth plus local demo access
- Prisma-backed SQLite workspace data
- CRUD for services, teams, and markdown documents
- many-to-many repository-to-service mapping
- signed GitHub webhook verification and normalization
- role-based authorization on server mutations
- audit logging for administrative and catalog changes
- activity feed that captures both manual and integration-driven events
- real command-style global search with keyboard navigation
- GitHub Actions CI and standalone deployment packaging

## Verified Today

The current build has been verified with:

- `npm run typecheck`
- `npm run test`
- `npm run check`

Focused tests currently cover:

- role and permission gating
- runtime environment validation
- GitHub webhook signature verification
- normalized webhook event mapping for `push`, `release`, and `workflow_run`

## Tech Stack

- Next.js 15
- TypeScript
- NextAuth v5 beta
- Prisma
- SQLite for local demo data
- Zod for server-side validation and env parsing
- Lucide icons and custom UI styles

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
4. Bootstrap the local database.
5. Start the dev server.

```powershell
npm install
npm run db:setup
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment Variables

- `DATABASE_URL`: local SQLite connection string
- `AUTH_SECRET`: secret used by NextAuth
- `GITHUB_CLIENT_ID`: GitHub OAuth app client ID
- `GITHUB_CLIENT_SECRET`: GitHub OAuth app client secret
- `GITHUB_WEBHOOK_SECRET`: shared secret used to verify signed GitHub webhooks
- `NEXT_PUBLIC_APP_URL`: base URL used for displaying webhook configuration instructions

The app now validates runtime configuration at startup. In production mode, `AUTH_SECRET` is required and GitHub OAuth credentials must be provided as a complete pair.

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

1. installs dependencies
2. bootstraps the local database
3. runs typecheck and production build
4. builds the demo Docker image

## Deployment Options

### Option 1: Single-node Node host

This is the cleanest way to show the app live in its current SQLite-backed form.

```powershell
npm install
npm run db:setup
npm run build
npm run start
```

### Option 2: Docker demo deployment

A multistage `Dockerfile` is included and Next.js is configured with `output: "standalone"`.

```powershell
docker build -t internal-dev-portal .
docker run -p 3000:3000 internal-dev-portal
```

Then open [http://localhost:3000](http://localhost:3000).

## Production Note

The current project is excellent for a portfolio-grade, single-node deployment and demo environment. The default SQLite setup is intentionally simple for local development and review. If you wanted to push this toward a multi-instance production deployment, the next step would be swapping the datasource to managed Postgres and replacing the local bootstrap script with standard Prisma migrations.

## Remaining Work

### Immediate next step

1. Migrate Prisma from SQLite to PostgreSQL.
2. Create the first proper Prisma migration for Postgres.
3. Update seed/bootstrap so local development and hosted environments both work cleanly.
4. Re-verify auth, CRUD, search, repo import, and webhook ingestion against Postgres.

### After PostgreSQL

1. Expand focused tests around server actions, RBAC enforcement, and audit logging.
2. Add a small end-to-end smoke test flow for login, catalog, and docs.
3. Improve workspace administration with member invite flows and better role management UX.
4. Add background jobs or scheduled health checks for richer service status widgets.
5. Tighten production polish around error states, empty states, and onboarding.

## Known Gaps

- SQLite is still the default datasource in the current repo.
- There is a non-blocking Vitest warning caused by the parent workspace `tsconfig.json` extending Expo config outside this app.
- Full end-to-end browser coverage is not added yet.
- The product is production-shaped, but not yet validated on PostgreSQL.

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
- `npm run check`
- `npm run prisma:generate`
- `npm run prisma:bootstrap`
- `npm run prisma:seed`
- `npm run db:setup`

## Demo Notes

- Demo access creates a local owner session immediately.
- GitHub sign-in auto-provisions local workspace membership in development so you can test integrations quickly.
- Seed data includes example services, docs, audit logs, and webhook deliveries to make the product feel alive on first run.

## Tomorrow's Starting Point

When work resumes, the cleanest next move is:

1. switch the Prisma datasource to PostgreSQL
2. create and run the initial Postgres migration
3. reseed the workspace data
4. run `npm run check`
5. verify login, catalog, docs, search, repo import, and webhook activity in the browser
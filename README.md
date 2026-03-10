# Internal Developer Portal

A new multi-tenant internal Developer tooling SaaS starter focused on:

- service catalog
- ownership maps
- runbooks and markdown docs
- deployment and environment links
- changelog/activity feed
- GitHub auth and webhook sync
- role-based access

## Current State

This repository currently includes:

- a Next.js App Router scaffold
- initial product pages for dashboard, catalog, docs, activity, and admin
- a Prisma schema for the core SaaS data model
- mock workspace data to drive the UI before backend wiring
- auth, search, permissions, database, and GitHub integration scaffolding

## Planned Build Sequence

1. Install dependencies
2. Wire GitHub OAuth and sessions
3. Run Prisma migration/generate
4. Replace sample data with database-backed loaders
5. Add service CRUD
6. Add markdown editing
7. Add webhook ingestion and activity normalization
8. Add health checks and role management polish

## Environment Variables

Copy `.env.example` to `.env` and fill in:

- `DATABASE_URL`
- `AUTH_SECRET`
- `GITHUB_CLIENT_ID`
- `GITHUB_CLIENT_SECRET`

## Notes

Dependencies have not been installed yet in this scaffold.

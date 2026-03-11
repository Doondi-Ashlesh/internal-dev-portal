import { WorkspaceSnapshot } from "@/lib/types";

export const sampleWorkspace: WorkspaceSnapshot = {
  workspace: {
    id: "ws_foundry",
    name: "Foundry Labs",
    slug: "foundry-labs",
    memberCount: 18
  },
  members: [
    { id: "member_anaya", userId: "user_anaya", name: "Anaya Patel", email: "anaya@foundry.dev", role: "owner" },
    { id: "member_marco", userId: "user_marco", name: "Marco Sims", email: "marco@foundry.dev", role: "admin" },
    { id: "member_mina", userId: "user_mina", name: "Mina Lopez", email: "mina@foundry.dev", role: "editor" },
    { id: "member_jordan", userId: "user_jordan", name: "Jordan Lee", email: "jordan@foundry.dev", role: "editor" }
  ],
  teams: [
    { id: "team_platform", name: "Platform", slug: "platform", memberCount: 5, description: "Infrastructure and developer systems" },
    { id: "team_growth", name: "Growth", slug: "growth", memberCount: 4, description: "Docs and acquisition systems" },
    { id: "team_core", name: "Core Product", slug: "core-product", memberCount: 6, description: "Application services and async workflows" }
  ],
  services: [
    {
      id: "svc_billing",
      slug: "billing-api",
      name: "Billing API",
      description: "Invoices, subscriptions, entitlements, and webhook handling for commercial flows.",
      team: "Platform",
      owner: "Anaya Patel",
      status: "healthy",
      tier: "critical",
      lifecycle: "active",
      repo: "foundry-labs/billing-api",
      primaryRepositoryUrl: "https://github.com/foundry-labs/billing-api",
      repositories: [
        { repositoryId: "repo_billing", fullName: "foundry-labs/billing-api", url: "https://github.com/foundry-labs/billing-api", relationshipType: "primary" },
        { repositoryId: "repo_infra", fullName: "foundry-labs/platform-infra", url: "https://github.com/foundry-labs/platform-infra", relationshipType: "infra" }
      ],
      environments: ["production", "staging"],
      tags: ["payments", "stripe", "node"],
      lastChange: "Release v2.8.1 deployed 2h ago"
    },
    {
      id: "svc_gateway",
      slug: "edge-gateway",
      name: "Edge Gateway",
      description: "Public ingress layer, rate limiting, request auth, and shared API gateway policies.",
      team: "Platform",
      owner: "Marco Sims",
      status: "degraded",
      tier: "critical",
      lifecycle: "active",
      repo: "foundry-labs/edge-gateway",
      primaryRepositoryUrl: "https://github.com/foundry-labs/edge-gateway",
      repositories: [
        { repositoryId: "repo_gateway", fullName: "foundry-labs/edge-gateway", url: "https://github.com/foundry-labs/edge-gateway", relationshipType: "primary" },
        { repositoryId: "repo_infra", fullName: "foundry-labs/platform-infra", url: "https://github.com/foundry-labs/platform-infra", relationshipType: "infra" }
      ],
      environments: ["production", "preview"],
      tags: ["gateway", "go", "nginx"],
      lastChange: "Latency alert opened 18m ago"
    },
    {
      id: "svc_docs",
      slug: "docs-web",
      name: "Docs Web",
      description: "Customer-facing docs site with content pipeline and API references.",
      team: "Growth",
      owner: "Mina Lopez",
      status: "healthy",
      tier: "medium",
      lifecycle: "active",
      repo: "foundry-labs/docs-web",
      primaryRepositoryUrl: "https://github.com/foundry-labs/docs-web",
      repositories: [
        { repositoryId: "repo_docs", fullName: "foundry-labs/docs-web", url: "https://github.com/foundry-labs/docs-web", relationshipType: "primary" }
      ],
      environments: ["production", "staging"],
      tags: ["nextjs", "docs"],
      lastChange: "OpenAPI sync succeeded yesterday"
    },
    {
      id: "svc_jobs",
      slug: "event-worker",
      name: "Event Worker",
      description: "Async processing for webhook normalization, changelog updates, and notifications.",
      team: "Core Product",
      owner: "Jordan Lee",
      status: "unknown",
      tier: "high",
      lifecycle: "experimental",
      repo: "foundry-labs/event-worker",
      primaryRepositoryUrl: "https://github.com/foundry-labs/event-worker",
      repositories: [
        { repositoryId: "repo_worker", fullName: "foundry-labs/event-worker", url: "https://github.com/foundry-labs/event-worker", relationshipType: "primary" },
        { repositoryId: "repo_contracts", fullName: "foundry-labs/service-contracts", url: "https://github.com/foundry-labs/service-contracts", relationshipType: "library" }
      ],
      environments: ["staging"],
      tags: ["queues", "workers", "typescript"],
      lastChange: "New service imported from GitHub"
    }
  ],
  documents: [
    {
      id: "doc_runbook_gateway",
      title: "Edge Gateway Runbook",
      slug: "edge-gateway-runbook",
      type: "runbook",
      serviceSlug: "edge-gateway",
      excerpt: "Escalation steps, rollback notes, dashboards, and emergency cache-bypass procedure.",
      updatedAt: "4 hours ago"
    },
    {
      id: "doc_announce",
      title: "Q2 Incident Review Template",
      slug: "q2-incident-review-template",
      type: "announcement",
      excerpt: "New template for engineering postmortems and weekly follow-up reviews.",
      updatedAt: "1 day ago"
    },
    {
      id: "doc_billing",
      title: "Billing API Overview",
      slug: "billing-api-overview",
      type: "doc",
      serviceSlug: "billing-api",
      excerpt: "Domain map for invoices, entitlements, subscription schedules, and webhook retries.",
      updatedAt: "2 days ago"
    },
    {
      id: "doc_oncall",
      title: "Platform On-Call Handoff",
      slug: "platform-oncall-handoff",
      type: "doc",
      excerpt: "Daily handoff expectations, paging severity, and ownership of business-hours triage.",
      updatedAt: "3 days ago"
    }
  ],
  activity: [
    {
      id: "act_1",
      source: "ci",
      title: "Billing API deployed to production",
      body: "GitHub Actions completed deploy workflow for commit 4ae29b8.",
      occurredAt: "2 hours ago",
      serviceSlug: "billing-api"
    },
    {
      id: "act_2",
      source: "github",
      title: "Edge Gateway alert annotation posted",
      body: "Latency above SLO for 15 minutes. Runbook linked automatically.",
      occurredAt: "18 minutes ago",
      serviceSlug: "edge-gateway"
    },
    {
      id: "act_3",
      source: "manual",
      title: "Internal announcement published",
      body: "Platform team posted the new on-call expectations for Q2.",
      occurredAt: "1 day ago"
    },
    {
      id: "act_4",
      source: "system",
      title: "New service imported",
      body: "event-worker was created from repository metadata and CODEOWNERS.",
      occurredAt: "2 days ago",
      serviceSlug: "event-worker"
    }
  ],
  metrics: {
    services: 4,
    healthy: 2,
    degraded: 1,
    docs: 4
  }
};
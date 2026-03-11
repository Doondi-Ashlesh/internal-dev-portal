const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  await prisma.healthCheck.deleteMany();
  await prisma.healthSource.deleteMany();
  await prisma.apiLink.deleteMany();
  await prisma.serviceEnvironment.deleteMany();
  await prisma.activityEvent.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.webhookDelivery.deleteMany();
  await prisma.document.deleteMany();
  await prisma.serviceRepository.deleteMany();
  await prisma.repository.deleteMany();
  await prisma.serviceOwner.deleteMany();
  await prisma.environment.deleteMany();
  await prisma.service.deleteMany();
  await prisma.team.deleteMany();
  await prisma.workspaceMember.deleteMany();
  await prisma.user.deleteMany();
  await prisma.workspace.deleteMany();

  const workspace = await prisma.workspace.create({
    data: {
      name: "Foundry Labs",
      slug: "foundry-labs"
    }
  });

  const users = await Promise.all([
    prisma.user.create({ data: { name: "Anaya Patel", email: "anaya@foundry.dev", githubId: "gh_anaya" } }),
    prisma.user.create({ data: { name: "Marco Sims", email: "marco@foundry.dev", githubId: "gh_marco" } }),
    prisma.user.create({ data: { name: "Mina Lopez", email: "mina@foundry.dev", githubId: "gh_mina" } }),
    prisma.user.create({ data: { name: "Jordan Lee", email: "jordan@foundry.dev", githubId: "gh_jordan" } })
  ]);

  const members = await Promise.all([
    prisma.workspaceMember.create({ data: { workspaceId: workspace.id, userId: users[0].id, role: "owner" } }),
    prisma.workspaceMember.create({ data: { workspaceId: workspace.id, userId: users[1].id, role: "admin" } }),
    prisma.workspaceMember.create({ data: { workspaceId: workspace.id, userId: users[2].id, role: "editor" } }),
    prisma.workspaceMember.create({ data: { workspaceId: workspace.id, userId: users[3].id, role: "editor" } })
  ]);

  const [platform, growth, core] = await Promise.all([
    prisma.team.create({ data: { workspaceId: workspace.id, name: "Platform", slug: "platform", description: "Infrastructure, gateways, developer systems" } }),
    prisma.team.create({ data: { workspaceId: workspace.id, name: "Growth", slug: "growth", description: "Docs, funnel, and content systems" } }),
    prisma.team.create({ data: { workspaceId: workspace.id, name: "Core Product", slug: "core-product", description: "Application services and async workflows" } })
  ]);

  const [production, staging, preview] = await Promise.all([
    prisma.environment.create({ data: { workspaceId: workspace.id, name: "Production", slug: "production" } }),
    prisma.environment.create({ data: { workspaceId: workspace.id, name: "Staging", slug: "staging" } }),
    prisma.environment.create({ data: { workspaceId: workspace.id, name: "Preview", slug: "preview" } })
  ]);

  const billing = await prisma.service.create({
    data: {
      workspaceId: workspace.id,
      teamId: platform.id,
      slug: "billing-api",
      name: "Billing API",
      description: "Invoices, subscriptions, entitlements, and webhook handling for commercial flows.",
      tier: "critical",
      lifecycle: "active",
      visibility: "internal",
      language: "TypeScript",
      framework: "Fastify",
      repoDefaultBranch: "main",
      tags: JSON.stringify(["payments", "stripe", "node"])
    }
  });

  const gateway = await prisma.service.create({
    data: {
      workspaceId: workspace.id,
      teamId: platform.id,
      slug: "edge-gateway",
      name: "Edge Gateway",
      description: "Public ingress layer, rate limiting, request auth, and shared API gateway policies.",
      tier: "critical",
      lifecycle: "active",
      visibility: "internal",
      language: "Go",
      framework: "Gin",
      repoDefaultBranch: "main",
      tags: JSON.stringify(["gateway", "go", "nginx"])
    }
  });

  const docsWeb = await prisma.service.create({
    data: {
      workspaceId: workspace.id,
      teamId: growth.id,
      slug: "docs-web",
      name: "Docs Web",
      description: "Customer-facing docs site with content pipeline and API references.",
      tier: "medium",
      lifecycle: "active",
      visibility: "internal",
      language: "TypeScript",
      framework: "Next.js",
      repoDefaultBranch: "main",
      tags: JSON.stringify(["nextjs", "docs"])
    }
  });

  const worker = await prisma.service.create({
    data: {
      workspaceId: workspace.id,
      teamId: core.id,
      slug: "event-worker",
      name: "Event Worker",
      description: "Async processing for webhook normalization, changelog updates, and notifications.",
      tier: "high",
      lifecycle: "experimental",
      visibility: "internal",
      language: "TypeScript",
      framework: "Node Worker",
      repoDefaultBranch: "main",
      tags: JSON.stringify(["queues", "workers", "typescript"])
    }
  });

  await Promise.all([
    prisma.serviceOwner.create({ data: { serviceId: billing.id, userId: users[0].id, ownerType: "primary" } }),
    prisma.serviceOwner.create({ data: { serviceId: gateway.id, userId: users[1].id, ownerType: "primary" } }),
    prisma.serviceOwner.create({ data: { serviceId: docsWeb.id, userId: users[2].id, ownerType: "primary" } }),
    prisma.serviceOwner.create({ data: { serviceId: worker.id, userId: users[3].id, ownerType: "primary" } })
  ]);

  const billingRepo = await prisma.repository.create({ data: { workspaceId: workspace.id, owner: "foundry-labs", name: "billing-api", fullName: "foundry-labs/billing-api", defaultBranch: "main", url: "https://github.com/foundry-labs/billing-api", externalId: "1" } });
  const gatewayRepo = await prisma.repository.create({ data: { workspaceId: workspace.id, owner: "foundry-labs", name: "edge-gateway", fullName: "foundry-labs/edge-gateway", defaultBranch: "main", url: "https://github.com/foundry-labs/edge-gateway", externalId: "2" } });
  const docsRepo = await prisma.repository.create({ data: { workspaceId: workspace.id, owner: "foundry-labs", name: "docs-web", fullName: "foundry-labs/docs-web", defaultBranch: "main", url: "https://github.com/foundry-labs/docs-web", externalId: "3" } });
  const workerRepo = await prisma.repository.create({ data: { workspaceId: workspace.id, owner: "foundry-labs", name: "event-worker", fullName: "foundry-labs/event-worker", defaultBranch: "main", url: "https://github.com/foundry-labs/event-worker", externalId: "4" } });
  const infraRepo = await prisma.repository.create({ data: { workspaceId: workspace.id, owner: "foundry-labs", name: "platform-infra", fullName: "foundry-labs/platform-infra", defaultBranch: "main", url: "https://github.com/foundry-labs/platform-infra", externalId: "5" } });
  const contractsRepo = await prisma.repository.create({ data: { workspaceId: workspace.id, owner: "foundry-labs", name: "service-contracts", fullName: "foundry-labs/service-contracts", defaultBranch: "main", url: "https://github.com/foundry-labs/service-contracts", externalId: "6" } });

  await Promise.all([
    prisma.serviceRepository.create({ data: { serviceId: billing.id, repositoryId: billingRepo.id, relationshipType: "primary" } }),
    prisma.serviceRepository.create({ data: { serviceId: billing.id, repositoryId: infraRepo.id, relationshipType: "infra" } }),
    prisma.serviceRepository.create({ data: { serviceId: gateway.id, repositoryId: gatewayRepo.id, relationshipType: "primary" } }),
    prisma.serviceRepository.create({ data: { serviceId: gateway.id, repositoryId: infraRepo.id, relationshipType: "infra" } }),
    prisma.serviceRepository.create({ data: { serviceId: docsWeb.id, repositoryId: docsRepo.id, relationshipType: "primary" } }),
    prisma.serviceRepository.create({ data: { serviceId: worker.id, repositoryId: workerRepo.id, relationshipType: "primary" } }),
    prisma.serviceRepository.create({ data: { serviceId: worker.id, repositoryId: contractsRepo.id, relationshipType: "library" } })
  ]);

  await Promise.all([
    prisma.serviceEnvironment.create({ data: { serviceId: billing.id, environmentId: production.id, deployUrl: "https://vercel.com/foundry/billing-api", dashboardUrl: "https://grafana.example.com/d/billing-prod", logsUrl: "https://app.datadoghq.com/logs?query=billing-api", configSummary: "Stripe live mode, Redis cache, worker fanout enabled" } }),
    prisma.serviceEnvironment.create({ data: { serviceId: billing.id, environmentId: staging.id, deployUrl: "https://vercel.com/foundry/billing-api-staging", dashboardUrl: "https://grafana.example.com/d/billing-staging", logsUrl: "https://app.datadoghq.com/logs?query=billing-api-staging", configSummary: "Sandbox payments and reduced webhook retries" } }),
    prisma.serviceEnvironment.create({ data: { serviceId: gateway.id, environmentId: production.id, deployUrl: "https://deploy.example.com/gateway-prod", dashboardUrl: "https://grafana.example.com/d/gateway-prod", logsUrl: "https://app.datadoghq.com/logs?query=edge-gateway", configSummary: "Global rate limits, auth cache, and WAF policies" } }),
    prisma.serviceEnvironment.create({ data: { serviceId: gateway.id, environmentId: preview.id, deployUrl: "https://deploy.example.com/gateway-preview", dashboardUrl: "https://grafana.example.com/d/gateway-preview", logsUrl: "https://app.datadoghq.com/logs?query=edge-gateway-preview", configSummary: "Preview traffic and relaxed policy checks" } }),
    prisma.serviceEnvironment.create({ data: { serviceId: docsWeb.id, environmentId: production.id, deployUrl: "https://vercel.com/foundry/docs-web", dashboardUrl: "https://vercel.com/foundry/docs-web/analytics", logsUrl: "https://app.datadoghq.com/logs?query=docs-web", configSummary: "Public docs and API reference publishing" } }),
    prisma.serviceEnvironment.create({ data: { serviceId: worker.id, environmentId: staging.id, deployUrl: "https://render.com/foundry/event-worker", dashboardUrl: "https://grafana.example.com/d/event-worker", logsUrl: "https://app.datadoghq.com/logs?query=event-worker", configSummary: "Async webhook fanout and changelog aggregation" } })
  ]);

  await Promise.all([
    prisma.apiLink.create({ data: { serviceId: billing.id, label: "OpenAPI", url: "https://docs.foundry.dev/billing/openapi", kind: "openapi" } }),
    prisma.apiLink.create({ data: { serviceId: billing.id, label: "Runbook Dashboard", url: "https://grafana.example.com/d/billing-prod", kind: "docs" } }),
    prisma.apiLink.create({ data: { serviceId: docsWeb.id, label: "Content Pipeline", url: "https://github.com/foundry-labs/docs-web/actions", kind: "other" } })
  ]);

  const billingHealth = await prisma.healthSource.create({ data: { serviceId: billing.id, provider: "http", label: "Billing API health endpoint", configJson: JSON.stringify({ url: "https://billing.foundry.dev/health" }) } });
  const gatewayHealth = await prisma.healthSource.create({ data: { serviceId: gateway.id, provider: "manual", label: "Gateway operational status", configJson: JSON.stringify({ source: "manual" }) } });
  const docsHealth = await prisma.healthSource.create({ data: { serviceId: docsWeb.id, provider: "http", label: "Docs site health endpoint", configJson: JSON.stringify({ url: "https://docs.foundry.dev/api/health" }) } });
  const workerHealth = await prisma.healthSource.create({ data: { serviceId: worker.id, provider: "manual", label: "Worker status", configJson: JSON.stringify({ source: "manual" }) } });

  await Promise.all([
    prisma.healthCheck.create({ data: { healthSourceId: billingHealth.id, status: "healthy", message: "P95 latency stable" } }),
    prisma.healthCheck.create({ data: { healthSourceId: gatewayHealth.id, status: "degraded", message: "Elevated latency under peak traffic" } }),
    prisma.healthCheck.create({ data: { healthSourceId: docsHealth.id, status: "healthy", message: "Publishing pipeline normal" } }),
    prisma.healthCheck.create({ data: { healthSourceId: workerHealth.id, status: "unknown", message: "Awaiting first check-in" } })
  ]);

  await Promise.all([
    prisma.document.create({ data: { workspaceId: workspace.id, serviceId: gateway.id, authorId: users[1].id, type: "runbook", title: "Edge Gateway Runbook", slug: "edge-gateway-runbook", contentMarkdown: "# Edge Gateway Runbook\n\n- Confirm traffic shape\n- Check upstream auth provider\n- Review recent deploys\n- Consider cache bypass if latency remains high" } }),
    prisma.document.create({ data: { workspaceId: workspace.id, authorId: users[0].id, type: "announcement", title: "Q2 Incident Review Template", slug: "q2-incident-review-template", contentMarkdown: "# Q2 Incident Review Template\n\nUse this for all platform and product incidents starting this quarter." } }),
    prisma.document.create({ data: { workspaceId: workspace.id, serviceId: billing.id, authorId: users[0].id, type: "doc", title: "Billing API Overview", slug: "billing-api-overview", contentMarkdown: "# Billing API Overview\n\nCovers invoices, entitlements, subscriptions, and webhook retries." } }),
    prisma.document.create({ data: { workspaceId: workspace.id, authorId: users[1].id, type: "doc", title: "Platform On-Call Handoff", slug: "platform-oncall-handoff", contentMarkdown: "# Platform On-Call Handoff\n\nDaily handoff expectations, severity guidance, and escalation ownership." } })
  ]);

  const now = Date.now();
  await Promise.all([
    prisma.activityEvent.create({ data: { workspaceId: workspace.id, serviceId: billing.id, actorUserId: users[0].id, source: "ci", type: "deploy.succeeded", title: "Billing API deployed to production", body: "GitHub Actions completed deploy workflow for commit 4ae29b8.", metadataJson: JSON.stringify({ commit: "4ae29b8" }), occurredAt: new Date(now - 2 * 60 * 60 * 1000) } }),
    prisma.activityEvent.create({ data: { workspaceId: workspace.id, serviceId: gateway.id, actorUserId: users[1].id, source: "github", type: "alert.annotated", title: "Edge Gateway alert annotation posted", body: "Latency above SLO for 15 minutes. Runbook linked automatically.", metadataJson: JSON.stringify({ severity: "high" }), occurredAt: new Date(now - 18 * 60 * 1000) } }),
    prisma.activityEvent.create({ data: { workspaceId: workspace.id, actorUserId: users[0].id, source: "manual", type: "announcement.published", title: "Internal announcement published", body: "Platform team posted the new on-call expectations for Q2.", metadataJson: JSON.stringify({ target: "workspace" }), occurredAt: new Date(now - 24 * 60 * 60 * 1000) } }),
    prisma.activityEvent.create({ data: { workspaceId: workspace.id, serviceId: worker.id, actorUserId: users[3].id, source: "system", type: "service.imported", title: "New service imported", body: "event-worker was created from repository metadata and CODEOWNERS.", metadataJson: JSON.stringify({ provider: "github" }), occurredAt: new Date(now - 2 * 24 * 60 * 60 * 1000) } })
  ]);

  await Promise.all([
    prisma.auditLog.create({ data: { workspaceId: workspace.id, actorUserId: users[0].id, entityType: "repository", action: "github.repositories.synced", metadataJson: JSON.stringify({ summary: "Synced 6 repositories from GitHub.", count: 6 }) } }),
    prisma.auditLog.create({ data: { workspaceId: workspace.id, actorUserId: users[1].id, entityType: "document", action: "document.updated", metadataJson: JSON.stringify({ summary: "Updated Edge Gateway Runbook.", title: "Edge Gateway Runbook" }) } }),
    prisma.auditLog.create({ data: { workspaceId: workspace.id, actorUserId: users[0].id, entityType: "workspaceMember", action: "workspace.member.role.updated", metadataJson: JSON.stringify({ summary: "Updated Mina Lopez to editor.", role: "editor" }) } })
  ]);

  await Promise.all([
    prisma.webhookDelivery.create({ data: { workspaceId: workspace.id, provider: "github", deliveryId: "demo-delivery-1", eventName: "push", repositoryFullName: "foundry-labs/billing-api", signatureValid: true, status: "processed", payloadJson: JSON.stringify({ ref: "refs/heads/main" }), processedAt: new Date(now - 70 * 60 * 1000) } }),
    prisma.webhookDelivery.create({ data: { workspaceId: workspace.id, provider: "github", deliveryId: "demo-delivery-2", eventName: "workflow_run", repositoryFullName: "foundry-labs/docs-web", signatureValid: true, status: "processed", payloadJson: JSON.stringify({ action: "completed" }), processedAt: new Date(now - 5 * 60 * 60 * 1000) } }),
    prisma.webhookDelivery.create({ data: { workspaceId: workspace.id, provider: "github", deliveryId: "demo-delivery-3", eventName: "release", repositoryFullName: "foundry-labs/platform-infra", signatureValid: false, status: "failed", payloadJson: JSON.stringify({ action: "published" }), errorMessage: "Invalid GitHub webhook signature.", processedAt: new Date(now - 30 * 60 * 1000) } })
  ]);

  console.log(`Database seeded for ${workspace.name}. Workspace members: ${members.length}.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
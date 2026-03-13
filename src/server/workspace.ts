import { db } from "@/lib/db";
import { env } from "@/lib/env";
import { resolveWorkspaceInviteStatus } from "@/lib/invites";
import { sampleWorkspace } from "@/lib/sample-data";
import {
  ActivityItem,
  AuditLogItem,
  DashboardMetrics,
  DocumentSummary,
  GithubRepositorySummary,
  RepositoryRelationship,
  ServiceSummary,
  WebhookDeliverySummary,
  WorkspaceInviteSummary,
  WorkspaceMemberSummary,
  WorkspaceSnapshot,
  WorkspaceSummary
} from "@/lib/types";
import { getCurrentWorkspaceContext, getOptionalCurrentWorkspaceContext } from "@/server/access";

function parseTags(tags: string): string[] {
  try {
    const parsed = JSON.parse(tags);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function parseMetadata(input: string) {
  try {
    return JSON.parse(input) as Record<string, unknown>;
  } catch {
    return {};
  }
}

function formatRelativeDate(date: Date): string {
  const diffMs = date.getTime() - Date.now();
  const diffMinutes = Math.round(diffMs / 60000);
  const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

  if (Math.abs(diffMinutes) < 60) {
    return rtf.format(diffMinutes, "minute");
  }

  const diffHours = Math.round(diffMinutes / 60);
  if (Math.abs(diffHours) < 24) {
    return rtf.format(diffHours, "hour");
  }

  const diffDays = Math.round(diffHours / 24);
  return rtf.format(diffDays, "day");
}

async function getLatestStatuses(workspaceId: string) {
  const checks = await db.healthCheck.findMany({
    include: {
      source: {
        include: {
          service: true
        }
      }
    },
    orderBy: { checkedAt: "desc" }
  });
  const latest = new Map<string, { status: ServiceSummary["status"] }>();

  for (const check of checks) {
    if (check.source.service.workspaceId !== workspaceId) {
      continue;
    }

    if (!latest.has(check.source.serviceId)) {
      latest.set(check.source.serviceId, { status: check.status as ServiceSummary["status"] });
    }
  }

  return latest;
}

async function getLatestActivityEvents(workspaceId: string) {
  const events = await db.activityEvent.findMany({
    where: { workspaceId },
    orderBy: { occurredAt: "desc" }
  });
  const latest = new Map<string, { title: string; occurredAt: Date }>();

  for (const event of events) {
    if (event.serviceId && !latest.has(event.serviceId)) {
      latest.set(event.serviceId, { title: event.title, occurredAt: event.occurredAt });
    }
  }

  return latest;
}

function mapWorkspaceMembers(members: Array<{ id: string; role: string; userId: string; user: { name: string | null; email: string | null; image: string | null } }>): WorkspaceMemberSummary[] {
  return members.map((member) => ({
    id: member.id,
    userId: member.userId,
    name: member.user.name ?? "Unknown user",
    email: member.user.email ?? "No email on file",
    role: member.role as WorkspaceMemberSummary["role"],
    avatarUrl: member.user.image ?? undefined
  }));
}

async function buildWorkspaceSnapshot(): Promise<WorkspaceSnapshot | null> {
  const workspaceContext = await getOptionalCurrentWorkspaceContext();
  const workspace = await db.workspace.findFirst({
    where: workspaceContext ? { id: workspaceContext.workspaceId } : undefined,
    include: {
      members: {
        include: {
          user: true
        },
        orderBy: { createdAt: "asc" }
      },
      teams: { orderBy: { name: "asc" } },
      services: {
        include: {
          team: true,
          owners: { include: { user: true, team: true } },
          repositories: { include: { repository: true } },
          environments: { include: { environment: true } }
        },
        orderBy: { name: "asc" }
      },
      documents: { orderBy: { updatedAt: "desc" } },
      events: { orderBy: { occurredAt: "desc" }, take: 12, include: { service: true } }
    }
  });

  if (!workspace) {
    return null;
  }

  const statusMap = await getLatestStatuses(workspace.id);
  const activityMap = await getLatestActivityEvents(workspace.id);

  const services: ServiceSummary[] = workspace.services.map((service) => {
    const primaryOwner = service.owners.find((owner) => owner.ownerType === "primary");
    const ownerName = primaryOwner?.user?.name ?? primaryOwner?.team?.name ?? service.team?.name ?? "Unassigned";
    const latestStatus = statusMap.get(service.id);
    const latestActivity = activityMap.get(service.id);
    const repositories = service.repositories.map((link) => ({
      repositoryId: link.repositoryId,
      fullName: link.repository.fullName,
      url: link.repository.url,
      relationshipType: link.relationshipType as RepositoryRelationship
    }));
    const primaryRepository = repositories.find((repository) => repository.relationshipType === "primary") ?? repositories[0];

    return {
      id: service.id,
      slug: service.slug,
      name: service.name,
      description: service.description ?? "No description yet.",
      team: service.team?.name ?? "Unassigned",
      teamId: service.teamId ?? undefined,
      owner: ownerName,
      status: latestStatus?.status ?? "unknown",
      tier: (service.tier ?? "low") as ServiceSummary["tier"],
      lifecycle: service.lifecycle as ServiceSummary["lifecycle"],
      repo: primaryRepository?.fullName ?? "Not linked",
      primaryRepositoryUrl: primaryRepository?.url,
      repositories,
      environments: service.environments.map((entry) => entry.environment.slug),
      tags: parseTags(service.tags),
      lastChange: latestActivity ? `${latestActivity.title} ${formatRelativeDate(latestActivity.occurredAt)}` : "No recent activity"
    };
  });

  const serviceSlugById = new Map(workspace.services.map((service) => [service.id, service.slug]));

  const documents: DocumentSummary[] = workspace.documents.map((document) => ({
    id: document.id,
    title: document.title,
    slug: document.slug,
    type: document.type,
    serviceSlug: document.serviceId ? serviceSlugById.get(document.serviceId) : undefined,
    serviceId: document.serviceId ?? undefined,
    excerpt: document.contentMarkdown.split("\n").slice(0, 2).join(" ").replace(/#/g, "").trim(),
    contentMarkdown: document.contentMarkdown,
    updatedAt: formatRelativeDate(document.updatedAt)
  }));

  const activity: ActivityItem[] = workspace.events.map((event) => ({
    id: event.id,
    source: event.source as ActivityItem["source"],
    title: event.title,
    body: event.body ?? "",
    occurredAt: formatRelativeDate(event.occurredAt),
    serviceSlug: event.service?.slug
  }));

  const metrics: DashboardMetrics = {
    services: services.length,
    healthy: services.filter((service) => service.status === "healthy").length,
    degraded: services.filter((service) => service.status === "degraded").length,
    docs: documents.length
  };

  const workspaceSummary: WorkspaceSummary = {
    id: workspace.id,
    name: workspace.name,
    slug: workspace.slug,
    memberCount: workspace.members.length
  };

  return {
    workspace: workspaceSummary,
    members: mapWorkspaceMembers(workspace.members),
    teams: workspace.teams.map((team) => ({
      id: team.id,
      name: team.name,
      slug: team.slug,
      description: team.description ?? undefined,
      memberCount: workspace.services.filter((service) => service.teamId === team.id).length
    })),
    services,
    documents,
    activity,
    metrics
  };
}

export async function getWorkspaceSnapshot(): Promise<WorkspaceSnapshot> {
  try {
    return (await buildWorkspaceSnapshot()) ?? sampleWorkspace;
  } catch {
    return sampleWorkspace;
  }
}

export async function getWorkspaceServices(): Promise<ServiceSummary[]> {
  return (await getWorkspaceSnapshot()).services;
}

export async function getWorkspaceDocuments(): Promise<DocumentSummary[]> {
  return (await getWorkspaceSnapshot()).documents;
}

export async function getWorkspaceActivity(): Promise<ActivityItem[]> {
  return (await getWorkspaceSnapshot()).activity;
}

export async function getWorkspaceMembers() {
  try {
    const context = await getCurrentWorkspaceContext();
    const members = await db.workspaceMember.findMany({
      where: { workspaceId: context.workspaceId },
      include: { user: true },
      orderBy: { createdAt: "asc" }
    });

    return mapWorkspaceMembers(members);
  } catch {
    return sampleWorkspace.members;
  }
}

export async function getWorkspaceRepositories(): Promise<GithubRepositorySummary[]> {
  try {
    const context = await getCurrentWorkspaceContext();
    const repositories = await db.repository.findMany({
      where: { workspaceId: context.workspaceId },
      include: {
        services: {
          include: {
            service: true
          }
        }
      },
      orderBy: {
        updatedAt: "desc"
      }
    });

    return repositories.map((repository) => ({
      id: repository.id,
      externalId: repository.externalId ?? undefined,
      owner: repository.owner,
      name: repository.name,
      fullName: repository.fullName,
      defaultBranch: repository.defaultBranch ?? undefined,
      url: repository.url,
      isPrivate: repository.isPrivate,
      links: repository.services.map((link) => ({
        serviceId: link.serviceId,
        serviceName: link.service.name,
        relationshipType: link.relationshipType as RepositoryRelationship
      }))
    }));
  } catch {
    return [];
  }
}

export async function getWorkspaceAuditLogs(limit = 12): Promise<AuditLogItem[]> {
  try {
    const context = await getCurrentWorkspaceContext();
    const logs = await db.auditLog.findMany({
      where: { workspaceId: context.workspaceId },
      include: { actor: true },
      orderBy: { createdAt: "desc" },
      take: limit
    });

    return logs.map((log) => {
      const metadata = parseMetadata(log.metadataJson);
      const summary = typeof metadata.summary === "string" ? metadata.summary : `${log.action} ${log.entityType}`;

      return {
        id: log.id,
        action: log.action,
        entityType: log.entityType,
        entityId: log.entityId ?? undefined,
        actorName: log.actor?.name ?? "System",
        summary,
        createdAt: formatRelativeDate(log.createdAt)
      };
    });
  } catch {
    return [];
  }
}

export async function getWorkspaceWebhookDeliveries(limit = 12): Promise<WebhookDeliverySummary[]> {
  try {
    const context = await getCurrentWorkspaceContext();
    const deliveries = await db.webhookDelivery.findMany({
      where: { workspaceId: context.workspaceId },
      orderBy: { createdAt: "desc" },
      take: limit
    });

    return deliveries.map((delivery) => ({
      id: delivery.id,
      deliveryId: delivery.deliveryId,
      eventName: delivery.eventName,
      repositoryFullName: delivery.repositoryFullName ?? undefined,
      status: delivery.status as WebhookDeliverySummary["status"],
      signatureValid: delivery.signatureValid,
      createdAt: formatRelativeDate(delivery.createdAt),
      processedAt: delivery.processedAt ? formatRelativeDate(delivery.processedAt) : undefined,
      errorMessage: delivery.errorMessage ?? undefined
    }));
  } catch {
    return [];
  }
}

export async function getWorkspaceInvites(limit = 12): Promise<WorkspaceInviteSummary[]> {
  try {
    const context = await getCurrentWorkspaceContext();
    const invites = await db.workspaceInvite.findMany({
      where: { workspaceId: context.workspaceId },
      include: { invitedBy: true },
      orderBy: { createdAt: "desc" },
      take: limit
    });

    return invites.map((invite) => ({
      id: invite.id,
      email: invite.email,
      role: invite.role,
      status: resolveWorkspaceInviteStatus(invite.status, invite.expiresAt),
      inviteUrl: `${env.appBaseUrl}/join/${invite.token}`,
      invitedByName: invite.invitedBy?.name ?? invite.invitedBy?.email ?? "Workspace admin",
      createdAt: formatRelativeDate(invite.createdAt),
      expiresAt: formatRelativeDate(invite.expiresAt),
      acceptedAt: invite.acceptedAt ? formatRelativeDate(invite.acceptedAt) : undefined
    }));
  } catch {
    return [];
  }
}

export async function getServiceBySlug(slug: string) {
  return (await getWorkspaceSnapshot()).services.find((service) => service.slug === slug) ?? null;
}

export async function getServiceContext(slug: string) {
  const snapshot = await getWorkspaceSnapshot();
  const service = snapshot.services.find((item) => item.slug === slug) ?? null;

  if (!service) {
    return null;
  }

  return {
    workspace: snapshot.workspace,
    service,
    documents: snapshot.documents.filter((document) => document.serviceSlug === slug),
    activity: snapshot.activity.filter((item) => item.serviceSlug === slug)
  };
}
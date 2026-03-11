"use server";

import { db } from "@/lib/db";
import { importGithubRepositories } from "@/lib/github";
import { WorkspaceRole } from "@/lib/types";
import { requireWorkspaceAccess, requireWorkspaceRole } from "@/server/access";
import { recordActivityEvent, recordAuditLog } from "@/server/ops";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const teamSchema = z.object({
  workspaceId: z.string().min(1),
  name: z.string().min(2),
  slug: z.string().min(2),
  description: z.string().optional()
});

const serviceSchema = z.object({
  workspaceId: z.string().min(1),
  teamId: z.string().optional(),
  name: z.string().min(2),
  slug: z.string().min(2),
  description: z.string().min(2),
  tier: z.enum(["critical", "high", "medium", "low"]),
  lifecycle: z.enum(["experimental", "active", "deprecated", "retired"]),
  tags: z.string().optional()
});

const documentSchema = z.object({
  workspaceId: z.string().min(1),
  serviceId: z.string().optional(),
  title: z.string().min(2),
  slug: z.string().min(2),
  type: z.enum(["doc", "runbook", "announcement"]),
  contentMarkdown: z.string().min(2)
});

const repositoryLinkSchema = z.object({
  repositoryId: z.string().min(1),
  serviceId: z.string().min(1),
  relationshipType: z.enum(["primary", "worker", "docs", "infra", "library", "other"])
});

const repositoryUnlinkSchema = z.object({
  repositoryId: z.string().min(1),
  serviceId: z.string().min(1)
});

const workspaceMemberRoleSchema = z.object({
  memberId: z.string().min(1),
  role: z.enum(["owner", "admin", "editor", "viewer"])
});

function normalizeOptional(value: FormDataEntryValue | null) {
  if (typeof value !== "string") {
    return undefined;
  }

  const trimmed = value.trim();
  return trimmed.length ? trimmed : undefined;
}

function parseTags(value: string | undefined) {
  return JSON.stringify(
    (value ?? "")
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean)
  );
}

function serializeSummary(summary: string, metadata?: Record<string, unknown>) {
  return {
    ...(metadata ?? {}),
    summary
  };
}

function revalidateWorkspaceViews(serviceSlugs: string[] = []) {
  ["/dashboard", "/catalog", "/docs", "/activity", "/admin/members", "/admin/integrations"].forEach((path) => revalidatePath(path));

  for (const slug of serviceSlugs.filter(Boolean)) {
    revalidatePath(`/services/${slug}`);
  }
}

async function requireCatalogAccess(workspaceId: string) {
  return requireWorkspaceAccess(workspaceId, "editor");
}

async function requireAdminAccess(workspaceId: string) {
  return requireWorkspaceAccess(workspaceId, "admin");
}

function ensureSameWorkspace(expectedWorkspaceId: string, actualWorkspaceId: string) {
  if (expectedWorkspaceId !== actualWorkspaceId) {
    throw new Error("The submitted record does not belong to the active workspace.");
  }
}

async function countWorkspaceOwners(workspaceId: string) {
  return db.workspaceMember.count({
    where: {
      workspaceId,
      role: "owner"
    }
  });
}

export async function createTeam(formData: FormData) {
  const parsed = teamSchema.parse({
    workspaceId: formData.get("workspaceId"),
    name: formData.get("name"),
    slug: formData.get("slug"),
    description: normalizeOptional(formData.get("description"))
  });

  const context = await requireAdminAccess(parsed.workspaceId);
  const team = await db.team.create({
    data: {
      workspaceId: context.workspaceId,
      name: parsed.name,
      slug: parsed.slug,
      description: parsed.description
    }
  });

  await recordAuditLog({
    workspaceId: context.workspaceId,
    actorUserId: context.userId,
    entityType: "team",
    entityId: team.id,
    action: "team.created",
    metadata: serializeSummary(`Created team ${team.name}.`, { name: team.name, slug: team.slug })
  });

  await recordActivityEvent({
    workspaceId: context.workspaceId,
    actorUserId: context.userId,
    source: "manual",
    type: "team.created",
    title: `Team created: ${team.name}`,
    body: `${context.userName} created the ${team.name} team.`,
    metadata: { teamId: team.id }
  });

  revalidateWorkspaceViews();
}

export async function updateTeam(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const parsed = teamSchema.parse({
    workspaceId: formData.get("workspaceId"),
    name: formData.get("name"),
    slug: formData.get("slug"),
    description: normalizeOptional(formData.get("description"))
  });

  const team = await db.team.findUnique({ where: { id } });

  if (!team) {
    throw new Error("Team not found.");
  }

  ensureSameWorkspace(parsed.workspaceId, team.workspaceId);
  const context = await requireAdminAccess(team.workspaceId);
  const updated = await db.team.update({
    where: { id },
    data: {
      name: parsed.name,
      slug: parsed.slug,
      description: parsed.description
    }
  });

  await recordAuditLog({
    workspaceId: context.workspaceId,
    actorUserId: context.userId,
    entityType: "team",
    entityId: updated.id,
    action: "team.updated",
    metadata: serializeSummary(`Updated team ${updated.name}.`, { name: updated.name, slug: updated.slug })
  });

  revalidateWorkspaceViews();
}

export async function deleteTeam(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const team = await db.team.findUnique({ where: { id } });

  if (!team) {
    throw new Error("Team not found.");
  }

  const context = await requireAdminAccess(team.workspaceId);
  await db.team.delete({ where: { id } });

  await recordAuditLog({
    workspaceId: context.workspaceId,
    actorUserId: context.userId,
    entityType: "team",
    entityId: id,
    action: "team.deleted",
    metadata: serializeSummary(`Deleted team ${team.name}.`, { name: team.name, slug: team.slug })
  });

  await recordActivityEvent({
    workspaceId: context.workspaceId,
    actorUserId: context.userId,
    source: "manual",
    type: "team.deleted",
    title: `Team deleted: ${team.name}`,
    body: `${context.userName} removed the ${team.name} team from the workspace.`,
    metadata: { teamId: id }
  });

  revalidateWorkspaceViews();
}

export async function createService(formData: FormData) {
  const parsed = serviceSchema.parse({
    workspaceId: formData.get("workspaceId"),
    teamId: normalizeOptional(formData.get("teamId")),
    name: formData.get("name"),
    slug: formData.get("slug"),
    description: formData.get("description"),
    tier: formData.get("tier"),
    lifecycle: formData.get("lifecycle"),
    tags: normalizeOptional(formData.get("tags"))
  });

  const context = await requireCatalogAccess(parsed.workspaceId);
  const service = await db.service.create({
    data: {
      workspaceId: context.workspaceId,
      teamId: parsed.teamId,
      name: parsed.name,
      slug: parsed.slug,
      description: parsed.description,
      tier: parsed.tier,
      lifecycle: parsed.lifecycle,
      visibility: "internal",
      tags: parseTags(parsed.tags)
    }
  });

  await recordAuditLog({
    workspaceId: context.workspaceId,
    actorUserId: context.userId,
    entityType: "service",
    entityId: service.id,
    action: "service.created",
    metadata: serializeSummary(`Created service ${service.name}.`, { name: service.name, slug: service.slug })
  });

  await recordActivityEvent({
    workspaceId: context.workspaceId,
    serviceId: service.id,
    actorUserId: context.userId,
    source: "manual",
    type: "service.created",
    title: `Service created: ${service.name}`,
    body: `${context.userName} added ${service.name} to the catalog.`,
    metadata: { serviceId: service.id }
  });

  revalidateWorkspaceViews([service.slug]);
}

export async function updateService(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const parsed = serviceSchema.parse({
    workspaceId: formData.get("workspaceId"),
    teamId: normalizeOptional(formData.get("teamId")),
    name: formData.get("name"),
    slug: formData.get("slug"),
    description: formData.get("description"),
    tier: formData.get("tier"),
    lifecycle: formData.get("lifecycle"),
    tags: normalizeOptional(formData.get("tags"))
  });

  const service = await db.service.findUnique({ where: { id } });

  if (!service) {
    throw new Error("Service not found.");
  }

  ensureSameWorkspace(parsed.workspaceId, service.workspaceId);
  const context = await requireCatalogAccess(service.workspaceId);
  const updated = await db.service.update({
    where: { id },
    data: {
      teamId: parsed.teamId,
      name: parsed.name,
      slug: parsed.slug,
      description: parsed.description,
      tier: parsed.tier,
      lifecycle: parsed.lifecycle,
      tags: parseTags(parsed.tags)
    }
  });

  await recordAuditLog({
    workspaceId: context.workspaceId,
    actorUserId: context.userId,
    entityType: "service",
    entityId: updated.id,
    action: "service.updated",
    metadata: serializeSummary(`Updated service ${updated.name}.`, { name: updated.name, slug: updated.slug })
  });

  await recordActivityEvent({
    workspaceId: context.workspaceId,
    serviceId: updated.id,
    actorUserId: context.userId,
    source: "manual",
    type: "service.updated",
    title: `Service updated: ${updated.name}`,
    body: `${context.userName} updated the ${updated.name} service record.`,
    metadata: { serviceId: updated.id }
  });

  revalidateWorkspaceViews([service.slug, updated.slug]);
}

export async function deleteService(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const service = await db.service.findUnique({ where: { id } });

  if (!service) {
    throw new Error("Service not found.");
  }

  const context = await requireCatalogAccess(service.workspaceId);
  await db.service.delete({ where: { id } });

  await recordAuditLog({
    workspaceId: context.workspaceId,
    actorUserId: context.userId,
    entityType: "service",
    entityId: id,
    action: "service.deleted",
    metadata: serializeSummary(`Deleted service ${service.name}.`, { name: service.name, slug: service.slug })
  });

  await recordActivityEvent({
    workspaceId: context.workspaceId,
    actorUserId: context.userId,
    source: "manual",
    type: "service.deleted",
    title: `Service deleted: ${service.name}`,
    body: `${context.userName} removed ${service.name} from the catalog.`,
    metadata: { serviceId: id }
  });

  revalidateWorkspaceViews([service.slug]);
}

export async function createDocument(formData: FormData) {
  const parsed = documentSchema.parse({
    workspaceId: formData.get("workspaceId"),
    serviceId: normalizeOptional(formData.get("serviceId")),
    title: formData.get("title"),
    slug: formData.get("slug"),
    type: formData.get("type"),
    contentMarkdown: formData.get("contentMarkdown")
  });

  const context = await requireCatalogAccess(parsed.workspaceId);
  const document = await db.document.create({
    data: {
      workspaceId: context.workspaceId,
      serviceId: parsed.serviceId,
      authorId: context.userId,
      title: parsed.title,
      slug: parsed.slug,
      type: parsed.type,
      contentMarkdown: parsed.contentMarkdown
    }
  });

  await recordAuditLog({
    workspaceId: context.workspaceId,
    actorUserId: context.userId,
    entityType: "document",
    entityId: document.id,
    action: "document.created",
    metadata: serializeSummary(`Created ${document.type} ${document.title}.`, { title: document.title, type: document.type })
  });

  await recordActivityEvent({
    workspaceId: context.workspaceId,
    serviceId: document.serviceId ?? undefined,
    actorUserId: context.userId,
    source: "manual",
    type: "document.created",
    title: `${document.type} created: ${document.title}`,
    body: `${context.userName} published ${document.title}.`,
    metadata: { documentId: document.id }
  });

  revalidateWorkspaceViews();
}

export async function updateDocument(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const parsed = documentSchema.parse({
    workspaceId: formData.get("workspaceId"),
    serviceId: normalizeOptional(formData.get("serviceId")),
    title: formData.get("title"),
    slug: formData.get("slug"),
    type: formData.get("type"),
    contentMarkdown: formData.get("contentMarkdown")
  });

  const document = await db.document.findUnique({ where: { id } });

  if (!document) {
    throw new Error("Document not found.");
  }

  ensureSameWorkspace(parsed.workspaceId, document.workspaceId);
  const context = await requireCatalogAccess(document.workspaceId);
  const updated = await db.document.update({
    where: { id },
    data: {
      serviceId: parsed.serviceId,
      title: parsed.title,
      slug: parsed.slug,
      type: parsed.type,
      contentMarkdown: parsed.contentMarkdown,
      authorId: context.userId
    }
  });

  await recordAuditLog({
    workspaceId: context.workspaceId,
    actorUserId: context.userId,
    entityType: "document",
    entityId: updated.id,
    action: "document.updated",
    metadata: serializeSummary(`Updated ${updated.type} ${updated.title}.`, { title: updated.title, type: updated.type })
  });

  await recordActivityEvent({
    workspaceId: context.workspaceId,
    serviceId: updated.serviceId ?? undefined,
    actorUserId: context.userId,
    source: "manual",
    type: "document.updated",
    title: `${updated.type} updated: ${updated.title}`,
    body: `${context.userName} updated ${updated.title}.`,
    metadata: { documentId: updated.id }
  });

  revalidateWorkspaceViews();
}

export async function deleteDocument(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const document = await db.document.findUnique({ where: { id } });

  if (!document) {
    throw new Error("Document not found.");
  }

  const context = await requireCatalogAccess(document.workspaceId);
  await db.document.delete({ where: { id } });

  await recordAuditLog({
    workspaceId: context.workspaceId,
    actorUserId: context.userId,
    entityType: "document",
    entityId: id,
    action: "document.deleted",
    metadata: serializeSummary(`Deleted ${document.type} ${document.title}.`, { title: document.title, type: document.type })
  });

  await recordActivityEvent({
    workspaceId: context.workspaceId,
    actorUserId: context.userId,
    source: "manual",
    type: "document.deleted",
    title: `${document.type} deleted: ${document.title}`,
    body: `${context.userName} removed ${document.title}.`,
    metadata: { documentId: id }
  });

  revalidateWorkspaceViews();
}

export async function importGithubRepositoriesAction(formData: FormData) {
  const workspaceId = String(formData.get("workspaceId") ?? "");
  const context = await requireAdminAccess(workspaceId);

  if (!context.accessToken) {
    throw new Error("GitHub access token missing. Sign in with GitHub again to import repositories.");
  }

  const result = await importGithubRepositories({
    workspaceId: context.workspaceId,
    accessToken: context.accessToken
  });

  await recordAuditLog({
    workspaceId: context.workspaceId,
    actorUserId: context.userId,
    entityType: "repository",
    action: "github.repositories.synced",
    metadata: serializeSummary(`Synced ${result.count} repositories from GitHub.`, { count: result.count })
  });

  await recordActivityEvent({
    workspaceId: context.workspaceId,
    actorUserId: context.userId,
    source: "system",
    type: "github.repositories.synced",
    title: `GitHub repository sync completed`,
    body: `${context.userName} synced ${result.count} repositories from GitHub.`,
    metadata: { count: result.count }
  });

  revalidateWorkspaceViews();
}

export async function saveRepositoryLink(formData: FormData) {
  const parsed = repositoryLinkSchema.parse({
    repositoryId: formData.get("repositoryId"),
    serviceId: formData.get("serviceId"),
    relationshipType: formData.get("relationshipType")
  });

  const repository = await db.repository.findUnique({ where: { id: parsed.repositoryId } });
  const service = await db.service.findUnique({ where: { id: parsed.serviceId } });

  if (!repository || !service) {
    throw new Error("Repository or service not found.");
  }

  ensureSameWorkspace(repository.workspaceId, service.workspaceId);
  const context = await requireAdminAccess(repository.workspaceId);
  const existing = await db.serviceRepository.findUnique({
    where: {
      serviceId_repositoryId: {
        serviceId: parsed.serviceId,
        repositoryId: parsed.repositoryId
      }
    }
  });

  if (existing) {
    await db.serviceRepository.update({
      where: { id: existing.id },
      data: { relationshipType: parsed.relationshipType }
    });
  } else {
    await db.serviceRepository.create({
      data: parsed
    });
  }

  await recordAuditLog({
    workspaceId: context.workspaceId,
    actorUserId: context.userId,
    entityType: "repositoryLink",
    entityId: existing?.id,
    action: "repository.link.saved",
    metadata: serializeSummary(`Linked ${repository.fullName} to ${service.name} as ${parsed.relationshipType}.`, {
      repositoryFullName: repository.fullName,
      serviceName: service.name,
      relationshipType: parsed.relationshipType
    })
  });

  await recordActivityEvent({
    workspaceId: context.workspaceId,
    serviceId: service.id,
    actorUserId: context.userId,
    source: "manual",
    type: "repository.link.saved",
    title: `Repository linked: ${repository.fullName}`,
    body: `${context.userName} linked ${repository.fullName} to ${service.name} as ${parsed.relationshipType}.`,
    metadata: { repositoryId: repository.id, serviceId: service.id, relationshipType: parsed.relationshipType }
  });

  revalidateWorkspaceViews([service.slug]);
}

export async function deleteRepositoryLink(formData: FormData) {
  const parsed = repositoryUnlinkSchema.parse({
    repositoryId: formData.get("repositoryId"),
    serviceId: formData.get("serviceId")
  });

  const repository = await db.repository.findUnique({ where: { id: parsed.repositoryId } });
  const service = await db.service.findUnique({ where: { id: parsed.serviceId } });

  if (!repository || !service) {
    throw new Error("Repository or service not found.");
  }

  ensureSameWorkspace(repository.workspaceId, service.workspaceId);
  const context = await requireAdminAccess(repository.workspaceId);
  await db.serviceRepository.delete({
    where: {
      serviceId_repositoryId: {
        serviceId: parsed.serviceId,
        repositoryId: parsed.repositoryId
      }
    }
  });

  await recordAuditLog({
    workspaceId: context.workspaceId,
    actorUserId: context.userId,
    entityType: "repositoryLink",
    action: "repository.link.deleted",
    metadata: serializeSummary(`Removed ${repository.fullName} from ${service.name}.`, {
      repositoryFullName: repository.fullName,
      serviceName: service.name
    })
  });

  await recordActivityEvent({
    workspaceId: context.workspaceId,
    serviceId: service.id,
    actorUserId: context.userId,
    source: "manual",
    type: "repository.link.deleted",
    title: `Repository unlinked: ${repository.fullName}`,
    body: `${context.userName} removed ${repository.fullName} from ${service.name}.`,
    metadata: { repositoryId: repository.id, serviceId: service.id }
  });

  revalidateWorkspaceViews([service.slug]);
}

export async function updateWorkspaceMemberRole(formData: FormData) {
  const parsed = workspaceMemberRoleSchema.parse({
    memberId: formData.get("memberId"),
    role: formData.get("role")
  });

  const member = await db.workspaceMember.findUnique({
    where: { id: parsed.memberId },
    include: { user: true }
  });

  if (!member) {
    throw new Error("Workspace member not found.");
  }

  const context = await requireAdminAccess(member.workspaceId);

  if (member.userId === context.userId && member.role === "owner" && parsed.role !== "owner") {
    const ownerCount = await countWorkspaceOwners(member.workspaceId);

    if (ownerCount <= 1) {
      throw new Error("You cannot demote the last workspace owner.");
    }
  }

  const updated = await db.workspaceMember.update({
    where: { id: member.id },
    data: {
      role: parsed.role as WorkspaceRole
    }
  });

  await recordAuditLog({
    workspaceId: context.workspaceId,
    actorUserId: context.userId,
    entityType: "workspaceMember",
    entityId: updated.id,
    action: "workspace.member.role.updated",
    metadata: serializeSummary(`Updated ${member.user.name ?? member.user.email ?? "workspace member"} to ${parsed.role}.`, {
      memberName: member.user.name,
      memberEmail: member.user.email,
      role: parsed.role
    })
  });

  await recordActivityEvent({
    workspaceId: context.workspaceId,
    actorUserId: context.userId,
    source: "manual",
    type: "workspace.member.role.updated",
    title: `Workspace role updated`,
    body: `${context.userName} changed ${member.user.name ?? member.user.email ?? "a member"} to ${parsed.role}.`,
    metadata: { memberId: updated.id, role: parsed.role }
  });

  revalidateWorkspaceViews();
}
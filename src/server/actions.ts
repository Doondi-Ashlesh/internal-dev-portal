"use server";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { importGithubRepositories } from "@/lib/github";
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
  lifecycle: z.enum(["experimental", "active", "deprecated"]),
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

function revalidateWorkspaceViews() {
  ["/dashboard", "/catalog", "/docs", "/activity", "/admin/members", "/admin/integrations"].forEach((path) => revalidatePath(path));
  revalidatePath("/services/[slug]", "page");
}

function getSessionAccessToken(session: { user?: { accessToken?: string } } | null) {
  const accessToken = session?.user?.accessToken;

  if (!accessToken) {
    throw new Error("GitHub access token missing. Please sign out and sign in with GitHub again.");
  }

  return accessToken;
}

export async function createTeam(formData: FormData) {
  const parsed = teamSchema.parse({
    workspaceId: formData.get("workspaceId"),
    name: formData.get("name"),
    slug: formData.get("slug"),
    description: normalizeOptional(formData.get("description"))
  });

  await db.team.create({ data: parsed });
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

  await db.team.update({
    where: { id },
    data: {
      name: parsed.name,
      slug: parsed.slug,
      description: parsed.description
    }
  });

  revalidateWorkspaceViews();
}

export async function deleteTeam(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  await db.team.delete({ where: { id } });
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

  await db.service.create({
    data: {
      workspaceId: parsed.workspaceId,
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

  revalidateWorkspaceViews();
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

  await db.service.update({
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

  revalidateWorkspaceViews();
}

export async function deleteService(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  await db.service.delete({ where: { id } });
  revalidateWorkspaceViews();
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

  await db.document.create({ data: parsed });
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

  await db.document.update({ where: { id }, data: parsed });
  revalidateWorkspaceViews();
}

export async function deleteDocument(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  await db.document.delete({ where: { id } });
  revalidateWorkspaceViews();
}

export async function importGithubRepositoriesAction(formData: FormData) {
  const session = await auth();
  const workspaceId = String(formData.get("workspaceId") ?? "");
  const accessToken = getSessionAccessToken(session);

  await importGithubRepositories({ workspaceId, accessToken });
  revalidateWorkspaceViews();
}

export async function saveRepositoryLink(formData: FormData) {
  const parsed = repositoryLinkSchema.parse({
    repositoryId: formData.get("repositoryId"),
    serviceId: formData.get("serviceId"),
    relationshipType: formData.get("relationshipType")
  });

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

  revalidateWorkspaceViews();
}

export async function deleteRepositoryLink(formData: FormData) {
  const parsed = repositoryUnlinkSchema.parse({
    repositoryId: formData.get("repositoryId"),
    serviceId: formData.get("serviceId")
  });

  await db.serviceRepository.delete({
    where: {
      serviceId_repositoryId: {
        serviceId: parsed.serviceId,
        repositoryId: parsed.repositoryId
      }
    }
  });

  revalidateWorkspaceViews();
}

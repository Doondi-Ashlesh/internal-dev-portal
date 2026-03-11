import { db } from "@/lib/db";
import { env } from "@/lib/env";
import {
  GithubWebhookPayload,
  normalizeGithubEvent,
  verifyGithubWebhookWithSecret
} from "@/lib/github-webhooks";
import { GithubRepositorySummary } from "@/lib/types";
import { recordAuditLog } from "@/server/ops";

interface GithubApiRepository {
  id: number;
  name: string;
  full_name: string;
  html_url: string;
  private: boolean;
  description: string | null;
  default_branch: string;
  pushed_at: string | null;
  owner: {
    login: string;
  };
}

export interface GithubRepoSyncInput {
  workspaceId: string;
  accessToken: string;
}

export interface GithubWebhookIngestInput {
  deliveryId: string;
  eventName: string;
  signature: string | null;
  payload: string;
}

function safeJsonParse<T>(payload: string) {
  try {
    return JSON.parse(payload) as T;
  } catch {
    return null;
  }
}

export async function fetchGithubRepositories(accessToken: string): Promise<GithubRepositorySummary[]> {
  const response = await fetch("https://api.github.com/user/repos?per_page=100&sort=updated&affiliation=owner,organization_member,collaborator", {
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${accessToken}`,
      "User-Agent": "internal-dev-portal",
      "X-GitHub-Api-Version": "2022-11-28"
    },
    cache: "no-store"
  });

  if (!response.ok) {
    throw new Error(`GitHub repository request failed with status ${response.status}`);
  }

  const repositories = (await response.json()) as GithubApiRepository[];

  return repositories.map((repository) => ({
    id: String(repository.id),
    externalId: String(repository.id),
    owner: repository.owner.login,
    name: repository.name,
    fullName: repository.full_name,
    defaultBranch: repository.default_branch,
    url: repository.html_url,
    isPrivate: repository.private,
    description: repository.description ?? undefined,
    pushedAt: repository.pushed_at ?? undefined,
    links: []
  }));
}

export async function importGithubRepositories(input: GithubRepoSyncInput) {
  const repositories = await fetchGithubRepositories(input.accessToken);

  for (const repository of repositories) {
    await db.repository.upsert({
      where: {
        workspaceId_fullName: {
          workspaceId: input.workspaceId,
          fullName: repository.fullName
        }
      },
      update: {
        externalId: repository.externalId,
        owner: repository.owner,
        name: repository.name,
        fullName: repository.fullName,
        defaultBranch: repository.defaultBranch,
        url: repository.url,
        isPrivate: repository.isPrivate,
        provider: "github"
      },
      create: {
        workspaceId: input.workspaceId,
        externalId: repository.externalId,
        owner: repository.owner,
        name: repository.name,
        fullName: repository.fullName,
        defaultBranch: repository.defaultBranch,
        url: repository.url,
        isPrivate: repository.isPrivate,
        provider: "github"
      }
    });
  }

  return {
    synced: true,
    count: repositories.length
  };
}

export function verifyGithubWebhook(signature: string | null, payload: string) {
  return verifyGithubWebhookWithSecret(env.githubWebhookSecret, signature, payload);
}

export async function ingestGithubWebhook(input: GithubWebhookIngestInput) {
  const signatureValid = verifyGithubWebhook(input.signature, input.payload);
  const payload = safeJsonParse<GithubWebhookPayload>(input.payload);
  const repositoryFullName = payload?.repository?.full_name;

  const existingDelivery = await db.webhookDelivery.findUnique({
    where: {
      provider_deliveryId: {
        provider: "github",
        deliveryId: input.deliveryId
      }
    }
  }).catch(() => null);

  if (existingDelivery) {
    return {
      status: 202,
      body: {
        accepted: true,
        duplicate: true,
        message: "Duplicate delivery ignored."
      }
    };
  }

  const repository = repositoryFullName
    ? await db.repository.findFirst({
        where: {
          provider: "github",
          fullName: repositoryFullName
        },
        include: {
          services: {
            include: {
              service: true
            }
          }
        }
      })
    : null;

  const delivery = await db.webhookDelivery.create({
    data: {
      workspaceId: repository?.workspaceId ?? null,
      provider: "github",
      deliveryId: input.deliveryId,
      eventName: input.eventName,
      repositoryFullName,
      signatureValid,
      status: signatureValid ? "pending" : "failed",
      payloadJson: input.payload
    }
  });

  if (!signatureValid) {
    await db.webhookDelivery.update({
      where: { id: delivery.id },
      data: {
        status: "failed",
        errorMessage: "Invalid GitHub webhook signature.",
        processedAt: new Date()
      }
    });

    return {
      status: 401,
      body: {
        accepted: false,
        message: "Invalid webhook signature."
      }
    };
  }

  if (!payload) {
    await db.webhookDelivery.update({
      where: { id: delivery.id },
      data: {
        status: "failed",
        errorMessage: "Webhook payload was not valid JSON.",
        processedAt: new Date()
      }
    });

    return {
      status: 400,
      body: {
        accepted: false,
        message: "Webhook payload was not valid JSON."
      }
    };
  }

  if (input.eventName === "ping") {
    await db.webhookDelivery.update({
      where: { id: delivery.id },
      data: {
        status: "processed",
        processedAt: new Date()
      }
    });

    if (repository?.workspaceId) {
      await recordAuditLog({
        workspaceId: repository.workspaceId,
        entityType: "webhook",
        entityId: delivery.id,
        action: "webhook.github.ping",
        metadata: {
          summary: `GitHub webhook connectivity verified for ${repository.fullName}.`,
          repositoryFullName: repository.fullName,
          eventName: input.eventName
        }
      });
    }

    return {
      status: 202,
      body: {
        accepted: true,
        message: "GitHub ping received."
      }
    };
  }

  const repositoryName = repository?.name ?? payload.repository?.name ?? repositoryFullName ?? "repository";
  const normalized = normalizeGithubEvent(input.eventName, payload, repositoryName);

  if (!normalized) {
    await db.webhookDelivery.update({
      where: { id: delivery.id },
      data: {
        status: "ignored",
        processedAt: new Date(),
        errorMessage: "Webhook event type is not currently normalized."
      }
    });

    return {
      status: 202,
      body: {
        accepted: true,
        message: `Ignored unsupported GitHub event: ${input.eventName}.`
      }
    };
  }

  if (!repository?.workspaceId) {
    await db.webhookDelivery.update({
      where: { id: delivery.id },
      data: {
        status: "ignored",
        processedAt: new Date(),
        errorMessage: "Repository is not mapped into the workspace catalog yet."
      }
    });

    return {
      status: 202,
      body: {
        accepted: true,
        message: "Repository is not yet linked to the workspace catalog."
      }
    };
  }

  const serviceTargets = repository.services.map((link) => link.serviceId);
  const activityTargets = serviceTargets.length ? serviceTargets.map((serviceId) => ({ serviceId })) : [{ serviceId: undefined }];

  await db.$transaction(async (transaction) => {
    for (const target of activityTargets) {
      await transaction.activityEvent.create({
        data: {
          workspaceId: repository.workspaceId,
          serviceId: target.serviceId,
          source: normalized.source,
          type: normalized.type,
          title: normalized.title,
          body: normalized.body,
          occurredAt: normalized.occurredAt,
          metadataJson: JSON.stringify({
            ...normalized.metadata,
            deliveryId: input.deliveryId,
            eventName: input.eventName,
            repositoryFullName: repository.fullName,
            linkedServiceCount: serviceTargets.length
          })
        }
      });
    }

    await transaction.webhookDelivery.update({
      where: { id: delivery.id },
      data: {
        status: "processed",
        processedAt: new Date(),
        errorMessage: null
      }
    });

    await transaction.auditLog.create({
      data: {
        workspaceId: repository.workspaceId,
        entityType: "webhook",
        entityId: delivery.id,
        action: "webhook.github.processed",
        metadataJson: JSON.stringify({
          summary: `Processed GitHub ${input.eventName} delivery for ${repository.fullName}.`,
          deliveryId: input.deliveryId,
          eventName: input.eventName,
          repositoryFullName: repository.fullName,
          createdEvents: activityTargets.length
        })
      }
    });
  });

  return {
    status: 202,
    body: {
      accepted: true,
      message: `Processed ${input.eventName} for ${repository.fullName}.`,
      createdEvents: activityTargets.length
    }
  };
}
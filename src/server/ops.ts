import { db } from "@/lib/db";
import { ActivityItem } from "@/lib/types";

interface AuditLogInput {
  workspaceId: string;
  actorUserId?: string;
  entityType: string;
  entityId?: string;
  action: string;
  metadata?: Record<string, unknown>;
}

interface ActivityEventInput {
  workspaceId: string;
  serviceId?: string;
  actorUserId?: string;
  source: ActivityItem["source"];
  type: string;
  title: string;
  body?: string;
  occurredAt?: Date;
  metadata?: Record<string, unknown>;
}

function serializeMetadata(metadata?: Record<string, unknown>) {
  try {
    return JSON.stringify(metadata ?? {});
  } catch {
    return "{}";
  }
}

export async function recordAuditLog(input: AuditLogInput) {
  await db.auditLog.create({
    data: {
      workspaceId: input.workspaceId,
      actorUserId: input.actorUserId,
      entityType: input.entityType,
      entityId: input.entityId,
      action: input.action,
      metadataJson: serializeMetadata(input.metadata)
    }
  });
}

export async function recordActivityEvent(input: ActivityEventInput) {
  await db.activityEvent.create({
    data: {
      workspaceId: input.workspaceId,
      serviceId: input.serviceId,
      actorUserId: input.actorUserId,
      source: input.source,
      type: input.type,
      title: input.title,
      body: input.body,
      occurredAt: input.occurredAt ?? new Date(),
      metadataJson: serializeMetadata(input.metadata)
    }
  });
}
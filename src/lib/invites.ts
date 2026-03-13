import { randomBytes } from "node:crypto";

import { WorkspaceInviteStatus } from "@/lib/types";

const DEFAULT_INVITE_TTL_DAYS = 7;

export function normalizeInviteEmail(email: string) {
  return email.trim().toLowerCase();
}

export function createWorkspaceInviteToken() {
  return randomBytes(24).toString("hex");
}

export function getWorkspaceInviteExpiry(days = DEFAULT_INVITE_TTL_DAYS) {
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000);
}

export function isWorkspaceInviteExpired(expiresAt: Date) {
  return expiresAt.getTime() < Date.now();
}

export function resolveWorkspaceInviteStatus(status: Exclude<WorkspaceInviteStatus, "expired">, expiresAt: Date): WorkspaceInviteStatus {
  if (status === "pending" && isWorkspaceInviteExpired(expiresAt)) {
    return "expired";
  }

  return status;
}
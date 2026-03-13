import { cache } from "react";
import type { Session } from "next-auth";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import {
  getDefaultGithubWorkspaceRole,
  isWorkspaceRole,
  upsertWorkspaceUser
} from "@/lib/auth";
import { hasWorkspaceRole } from "@/lib/permissions";
import { WorkspaceRole } from "@/lib/types";

export interface CurrentUserIdentity {
  userId: string;
  userName: string;
  userEmail?: string;
  accessToken?: string;
}

export interface CurrentWorkspaceContext extends CurrentUserIdentity {
  workspaceId: string;
  workspaceName: string;
  role: WorkspaceRole;
}

function getFallbackRole(session: Session | null): WorkspaceRole {
  const sessionRole = session?.user?.role;

  if (isWorkspaceRole(sessionRole)) {
    return sessionRole;
  }

  if (session?.user?.githubId) {
    return getDefaultGithubWorkspaceRole();
  }

  if (session?.user?.email === "demo@foundry.dev") {
    return "owner";
  }

  return "viewer";
}

async function provisionSessionUser(session: Session | null) {
  if (!session?.user) {
    return null;
  }

  return upsertWorkspaceUser({
    githubId: session.user.githubId,
    email: session.user.email,
    name: session.user.name,
    image: session.user.image,
    defaultRole: getFallbackRole(session),
    autoJoinWorkspace: false
  });
}

async function resolveSessionUser() {
  const session = await auth();

  if (!session?.user) {
    throw new Error("Authentication required.");
  }

  const sessionUserId = session.user.id;
  const sessionGithubId = session.user.githubId;
  const sessionEmail = session.user.email ?? undefined;

  let user = sessionUserId ? await db.user.findUnique({ where: { id: sessionUserId } }) : null;

  if (!user && sessionGithubId) {
    user = await db.user.findUnique({ where: { githubId: sessionGithubId } });
  }

  if (!user && sessionEmail) {
    user = await db.user.findUnique({ where: { email: sessionEmail } });
  }

  if (!user) {
    user = await provisionSessionUser(session);
  }

  if (!user) {
    throw new Error("Could not resolve the signed-in user in the local workspace.");
  }

  return { session, user };
}

export const getCurrentUserIdentity = cache(async (): Promise<CurrentUserIdentity> => {
  const { session, user } = await resolveSessionUser();

  return {
    userId: user.id,
    userName: user.name ?? session.user?.name ?? "Unknown user",
    userEmail: user.email ?? session.user?.email ?? undefined,
    accessToken: session.user?.accessToken
  };
});

export async function getOptionalCurrentUserIdentity() {
  try {
    return await getCurrentUserIdentity();
  } catch {
    return null;
  }
}

export async function requireCurrentUserIdentity() {
  return getCurrentUserIdentity();
}

export const getCurrentWorkspaceContext = cache(async (): Promise<CurrentWorkspaceContext> => {
  const identity = await getCurrentUserIdentity();
  const membership = await db.workspaceMember.findFirst({
    where: { userId: identity.userId },
    include: { workspace: true },
    orderBy: { createdAt: "asc" }
  });

  if (!membership) {
    throw new Error("No workspace membership found for the signed-in user.");
  }

  return {
    workspaceId: membership.workspaceId,
    workspaceName: membership.workspace.name,
    userId: identity.userId,
    userName: identity.userName,
    userEmail: identity.userEmail,
    role: membership.role as WorkspaceRole,
    accessToken: identity.accessToken
  };
});

export async function getOptionalCurrentWorkspaceContext() {
  try {
    return await getCurrentWorkspaceContext();
  } catch {
    return null;
  }
}

export async function getPageWorkspaceContext() {
  const context = await getOptionalCurrentWorkspaceContext();

  if (!context) {
    redirect("/login");
  }

  return context;
}

export async function requireWorkspaceRole(minimumRole: WorkspaceRole) {
  const context = await getCurrentWorkspaceContext();

  if (!hasWorkspaceRole(context.role, minimumRole)) {
    throw new Error(`This action requires ${minimumRole} access.`);
  }

  return context;
}

export async function requireWorkspaceAccess(workspaceId: string, minimumRole: WorkspaceRole) {
  const context = await requireWorkspaceRole(minimumRole);

  if (context.workspaceId !== workspaceId) {
    throw new Error("Cross-workspace mutations are not allowed.");
  }

  return context;
}
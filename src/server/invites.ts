import { db } from "@/lib/db";
import { env } from "@/lib/env";
import { resolveWorkspaceInviteStatus } from "@/lib/invites";
import { WorkspaceJoinInviteSummary } from "@/lib/types";
import { getOptionalCurrentUserIdentity } from "@/server/access";

function formatRelativeDate(date: Date) {
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

export async function getJoinInviteContext(token: string): Promise<WorkspaceJoinInviteSummary | null> {
  const invite = await db.workspaceInvite.findUnique({
    where: { token },
    include: {
      workspace: true,
      invitedBy: true,
      acceptedBy: true
    }
  });

  if (!invite) {
    return null;
  }

  const currentUser = await getOptionalCurrentUserIdentity();
  const status = resolveWorkspaceInviteStatus(invite.status, invite.expiresAt);

  return {
    id: invite.id,
    workspaceName: invite.workspace.name,
    workspaceSlug: invite.workspace.slug,
    email: invite.email,
    role: invite.role,
    status,
    invitedByName: invite.invitedBy?.name ?? invite.invitedBy?.email ?? "Workspace admin",
    expiresAt: formatRelativeDate(invite.expiresAt),
    inviteUrl: `${env.appBaseUrl}/join/${invite.token}`,
    token,
    currentUserEmail: currentUser?.userEmail,
    currentUserName: currentUser?.userName,
    acceptedByName: invite.acceptedBy?.name ?? invite.acceptedBy?.email ?? undefined
  };
}
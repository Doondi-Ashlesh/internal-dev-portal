import { WorkspaceRole } from "@/lib/types";

const roleRank: Record<WorkspaceRole, number> = {
  viewer: 0,
  editor: 1,
  admin: 2,
  owner: 3
};

export function hasWorkspaceRole(role: WorkspaceRole, minimumRole: WorkspaceRole) {
  return roleRank[role] >= roleRank[minimumRole];
}

export function canManageWorkspace(role: WorkspaceRole) {
  return hasWorkspaceRole(role, "admin");
}

export function canEditCatalog(role: WorkspaceRole) {
  return hasWorkspaceRole(role, "editor");
}

export function canInviteMembers(role: WorkspaceRole) {
  return canManageWorkspace(role);
}
import { WorkspaceRole } from "@/lib/types";

const roleRank: Record<WorkspaceRole, number> = {
  viewer: 0,
  editor: 1,
  admin: 2,
  owner: 3
};

export function canManageWorkspace(role: WorkspaceRole) {
  return roleRank[role] >= roleRank.admin;
}

export function canEditCatalog(role: WorkspaceRole) {
  return roleRank[role] >= roleRank.editor;
}

export function canInviteMembers(role: WorkspaceRole) {
  return roleRank[role] >= roleRank.admin;
}

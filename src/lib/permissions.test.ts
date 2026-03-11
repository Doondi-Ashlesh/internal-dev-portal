import { describe, expect, it } from "vitest";

import { canEditCatalog, canInviteMembers, canManageWorkspace, hasWorkspaceRole } from "@/lib/permissions";

describe("workspace permissions", () => {
  it("applies the role hierarchy correctly", () => {
    expect(hasWorkspaceRole("owner", "admin")).toBe(true);
    expect(hasWorkspaceRole("admin", "editor")).toBe(true);
    expect(hasWorkspaceRole("viewer", "editor")).toBe(false);
  });

  it("only allows editors and above to change catalog content", () => {
    expect(canEditCatalog("editor")).toBe(true);
    expect(canEditCatalog("admin")).toBe(true);
    expect(canEditCatalog("viewer")).toBe(false);
  });

  it("only allows admins and owners to manage workspace access", () => {
    expect(canManageWorkspace("owner")).toBe(true);
    expect(canManageWorkspace("admin")).toBe(true);
    expect(canManageWorkspace("editor")).toBe(false);
    expect(canInviteMembers("viewer")).toBe(false);
  });
});
import { describe, expect, it } from "vitest";

import {
  createWorkspaceInviteToken,
  getWorkspaceInviteExpiry,
  normalizeInviteEmail,
  resolveWorkspaceInviteStatus
} from "@/lib/invites";

describe("workspace invite helpers", () => {
  it("normalizes invite emails consistently", () => {
    expect(normalizeInviteEmail("  User@Example.com ")).toBe("user@example.com");
  });

  it("creates non-empty invite tokens", () => {
    expect(createWorkspaceInviteToken()).toHaveLength(48);
  });

  it("marks pending invites as expired after their expiry time", () => {
    const expired = new Date(Date.now() - 1000);
    const active = getWorkspaceInviteExpiry();

    expect(resolveWorkspaceInviteStatus("pending", expired)).toBe("expired");
    expect(resolveWorkspaceInviteStatus("pending", active)).toBe("pending");
    expect(resolveWorkspaceInviteStatus("accepted", expired)).toBe("accepted");
  });
});
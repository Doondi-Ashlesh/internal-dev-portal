import * as React from "react";
import { isValidElement, type ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

globalThis.React = React;

const mockSignIn = vi.fn();
const mockRedirect = vi.fn();
const mockGetOptionalCurrentUserIdentity = vi.fn();
const mockGetOptionalCurrentWorkspaceContext = vi.fn();
const mockGetJoinInviteContext = vi.fn();
const mockAcceptWorkspaceInvite = vi.fn();
const mockIsGithubAuthConfigured = vi.fn(() => true);
const mockIsDemoAuthEnabled = vi.fn(() => false);

vi.mock("@/auth", () => ({
  signIn: mockSignIn
}));

vi.mock("next/navigation", () => ({
  redirect: mockRedirect
}));

vi.mock("@/server/access", () => ({
  getOptionalCurrentUserIdentity: mockGetOptionalCurrentUserIdentity,
  getOptionalCurrentWorkspaceContext: mockGetOptionalCurrentWorkspaceContext
}));

vi.mock("@/server/invites", () => ({
  getJoinInviteContext: mockGetJoinInviteContext
}));

vi.mock("@/server/actions", () => ({
  acceptWorkspaceInvite: mockAcceptWorkspaceInvite
}));

vi.mock("@/lib/env", () => ({
  isGithubAuthConfigured: mockIsGithubAuthConfigured,
  isDemoAuthEnabled: mockIsDemoAuthEnabled
}));

function collectText(node: ReactNode): string[] {
  if (typeof node === "string" || typeof node === "number") {
    return [String(node)];
  }

  if (Array.isArray(node)) {
    return node.flatMap(collectText);
  }

  if (isValidElement(node)) {
    const element = node as React.ReactElement<{ children?: ReactNode }>;
    return collectText(element.props.children);
  }

  return [];
}

describe("demo auth CTAs", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetOptionalCurrentWorkspaceContext.mockResolvedValue(null);
    mockGetOptionalCurrentUserIdentity.mockResolvedValue(null);
    mockIsGithubAuthConfigured.mockReturnValue(true);
    mockIsDemoAuthEnabled.mockReturnValue(false);
  });

  it("hides demo CTAs on the login page when demo auth is disabled", async () => {
    const { default: LoginPage } = await import("./login/page");
    const page = await LoginPage();
    const text = collectText(page).join(" ");

    expect(text).toContain("GitHub sign in");
    expect(text).not.toContain("Demo access");
    expect(text).not.toContain("Enter demo workspace");
    expect(mockRedirect).not.toHaveBeenCalled();
  });

  it("hides demo CTAs on the invite page when demo auth is disabled", async () => {
    mockGetJoinInviteContext.mockResolvedValue({
      id: "invite_1",
      workspaceName: "Foundry Labs",
      workspaceSlug: "foundry-labs",
      email: "invitee@foundry.dev",
      role: "viewer",
      status: "pending",
      invitedByName: "Workspace admin",
      expiresAt: "in 5 days",
      inviteUrl: "http://localhost:3000/join/token",
      token: "token"
    });

    const { default: JoinInvitePage } = await import("./join/[token]/page");
    const page = await JoinInvitePage({ params: Promise.resolve({ token: "token" }) });
    const text = collectText(page).join(" ");

    expect(text).toContain("Continue with GitHub");
    expect(text).not.toContain("Demo invite access");
    expect(text).not.toContain("Use demo access");
    expect(mockRedirect).not.toHaveBeenCalled();
  });
});

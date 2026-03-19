import * as React from "react";
import { isValidElement, type ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

globalThis.React = React;

const {
  MockWorkspaceDataUnavailableError,
  mockGetPageWorkspaceContext,
  mockGetWorkspaceRepositories,
  mockGetWorkspaceSnapshot,
  mockGetWorkspaceWebhookDeliveries,
  mockCanManageWorkspace,
  mockIsGithubWebhookConfigured
} = vi.hoisted(() => {
  class MockWorkspaceDataUnavailableError extends Error {
    constructor(message = "Workspace data is unavailable.") {
      super(message);
      this.name = "WorkspaceDataUnavailableError";
    }
  }

  return {
    MockWorkspaceDataUnavailableError,
    mockGetPageWorkspaceContext: vi.fn(),
    mockGetWorkspaceRepositories: vi.fn(),
    mockGetWorkspaceSnapshot: vi.fn(),
    mockGetWorkspaceWebhookDeliveries: vi.fn(),
    mockCanManageWorkspace: vi.fn(() => true),
    mockIsGithubWebhookConfigured: vi.fn(() => true)
  };
});

vi.mock("@/components/app-shell", () => ({
  AppShell: ({ children }: { children?: ReactNode }) => children ?? null
}));

vi.mock("@/components/activity-feed", () => ({
  ActivityFeed: () => null
}));

vi.mock("@/components/docs-list", () => ({
  DocsList: () => null
}));

vi.mock("@/components/metrics-grid", () => ({
  MetricsGrid: () => null
}));

vi.mock("@/components/service-cards", () => ({
  ServiceCards: () => null
}));

vi.mock("@/components/workspace-overview", () => ({
  WorkspaceOverview: () => null
}));

vi.mock("@/components/admin/github-repo-management", () => ({
  GithubRepoManagement: () => null
}));

vi.mock("@/server/access", () => ({
  getPageWorkspaceContext: mockGetPageWorkspaceContext
}));

vi.mock("@/server/workspace", () => ({
  WorkspaceDataUnavailableError: MockWorkspaceDataUnavailableError,
  getWorkspaceRepositories: mockGetWorkspaceRepositories,
  getWorkspaceSnapshot: mockGetWorkspaceSnapshot,
  getWorkspaceWebhookDeliveries: mockGetWorkspaceWebhookDeliveries
}));

vi.mock("@/lib/permissions", () => ({
  canManageWorkspace: mockCanManageWorkspace
}));

vi.mock("@/lib/env", () => ({
  env: {
    appBaseUrl: "http://localhost:3000"
  },
  isGithubWebhookConfigured: mockIsGithubWebhookConfigured
}));

async function collectText(node: ReactNode): Promise<string[]> {
  if (typeof node === "string" || typeof node === "number") {
    return [String(node)];
  }

  if (Array.isArray(node)) {
    const nested = await Promise.all(node.map((item) => collectText(item)));
    return nested.flat();
  }

  if (isValidElement(node)) {
    const element = node as React.ReactElement<{ children?: ReactNode }>;

    if (typeof element.type === "function") {
      const component = element.type as (props: Record<string, unknown>) => ReactNode | Promise<ReactNode>;
      return collectText(await component(element.props));
    }

    return collectText(element.props.children);
  }

  return [];
}

describe("workspace unavailable pages", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetPageWorkspaceContext.mockResolvedValue({
      workspaceId: "ws_1",
      workspaceName: "Foundry Labs",
      role: "owner",
      userId: "user_1",
      userName: "Casey Reviewer",
      userEmail: "casey@foundry.dev",
      accessToken: "token"
    });
    mockGetWorkspaceSnapshot.mockResolvedValue({
      workspace: {
        id: "ws_1",
        name: "Foundry Labs"
      }
    });
    mockGetWorkspaceRepositories.mockResolvedValue([]);
    mockGetWorkspaceWebhookDeliveries.mockResolvedValue([]);
    mockCanManageWorkspace.mockReturnValue(true);
    mockIsGithubWebhookConfigured.mockReturnValue(true);
  });

  it("renders the shared unavailable state on the dashboard when the snapshot read fails", async () => {
    mockGetWorkspaceSnapshot.mockRejectedValue(new MockWorkspaceDataUnavailableError());

    const { default: DashboardPage } = await import("./dashboard/page");
    const page = await DashboardPage();
    const text = (await collectText(page)).join(" ");

    expect(text).toContain("Workspace unavailable");
    expect(text).toContain("Check the workspace data source");
    expect(mockGetWorkspaceSnapshot).toHaveBeenCalledTimes(1);
  });

  it("renders the shared unavailable state on integrations when a later workspace read fails", async () => {
    mockGetWorkspaceRepositories.mockRejectedValue(new MockWorkspaceDataUnavailableError());

    const { default: IntegrationsPage } = await import("./admin/integrations/page");
    const page = await IntegrationsPage();
    const text = (await collectText(page)).join(" ");

    expect(text).toContain("Workspace unavailable");
    expect(text).toContain("Check the workspace data source");
    expect(mockGetWorkspaceSnapshot).toHaveBeenCalledTimes(1);
    expect(mockGetWorkspaceRepositories).toHaveBeenCalledTimes(1);
  });
});

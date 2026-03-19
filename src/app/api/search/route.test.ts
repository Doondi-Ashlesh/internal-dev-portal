import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { MockWorkspaceDataUnavailableError, mockSearchWorkspace } = vi.hoisted(() => {
  class MockWorkspaceDataUnavailableError extends Error {
    constructor(message = "Workspace data is unavailable.") {
      super(message);
      this.name = "WorkspaceDataUnavailableError";
    }
  }

  return {
    MockWorkspaceDataUnavailableError,
    mockSearchWorkspace: vi.fn()
  };
});

vi.mock("@/lib/search", () => ({
  searchWorkspace: mockSearchWorkspace
}));

vi.mock("@/server/workspace", () => ({
  WorkspaceDataUnavailableError: MockWorkspaceDataUnavailableError
}));

describe("search route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 503 when workspace data is unavailable", async () => {
    mockSearchWorkspace.mockRejectedValue(new MockWorkspaceDataUnavailableError());
    const { GET } = await import("./route");

    const response = await GET(new NextRequest("http://localhost:3000/api/search?q=billing"));

    expect(response.status).toBe(503);
    expect(await response.json()).toEqual({
      error: "workspace_data_unavailable"
    });
  });

  it("returns search results on success", async () => {
    mockSearchWorkspace.mockResolvedValue({
      query: "billing",
      services: [],
      documents: [],
      teams: [],
      shortcuts: [],
      total: 0
    });
    const { GET } = await import("./route");

    const response = await GET(new NextRequest("http://localhost:3000/api/search?q=billing"));

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      query: "billing",
      services: [],
      documents: [],
      teams: [],
      shortcuts: [],
      total: 0
    });
  });
});

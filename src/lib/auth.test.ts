import { afterEach, describe, expect, it, vi } from "vitest";

const originalEnv = { ...process.env };

describe("demo auth hardening", () => {
  afterEach(() => {
    process.env = { ...originalEnv };
    vi.resetModules();
  });

  it("rejects demo credentials when ENABLE_DEMO_AUTH is off", async () => {
    process.env = {
      ...originalEnv,
      NODE_ENV: "test",
      DATABASE_URL: "postgresql://postgres:postgres@localhost:5432/internal_dev_portal?schema=public",
      AUTH_SECRET: "test-secret"
    };
    delete process.env.ENABLE_DEMO_AUTH;

    const { authConfig } = await import("@/lib/auth");
    const demoProvider = authConfig.providers.find(
      (provider: any) => provider.id === "demo" || provider.options?.id === "demo"
    ) as any;
    const authorize = demoProvider?.authorize ?? demoProvider?.options?.authorize;

    expect(authorize).toBeTypeOf("function");

    const result = await authorize({
      name: "Foundry Demo",
      email: "demo@foundry.dev"
    });

    expect(result).toBeNull();
  });
});

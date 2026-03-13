import { describe, expect, it } from "vitest";

import { parseEnvironment, validateEnvironmentConfig } from "@/lib/env";

describe("environment configuration", () => {
  it("parses and trims runtime values", () => {
    const parsed = parseEnvironment({
      NODE_ENV: "development",
      DATABASE_URL: " postgresql://postgres:postgres@localhost:5432/internal_dev_portal?schema=public ",
      AUTH_SECRET: " test-secret ",
      GITHUB_CLIENT_ID: " client-id ",
      GITHUB_CLIENT_SECRET: " client-secret ",
      GITHUB_WEBHOOK_SECRET: " webhook-secret ",
      NEXT_PUBLIC_APP_URL: " https://example.com/ "
    });

    expect(parsed.databaseUrl).toBe("postgresql://postgres:postgres@localhost:5432/internal_dev_portal?schema=public");
    expect(parsed.authSecret).toBe("test-secret");
    expect(parsed.githubClientId).toBe("client-id");
    expect(parsed.githubClientSecret).toBe("client-secret");
    expect(parsed.githubWebhookSecret).toBe("webhook-secret");
    expect(parsed.appBaseUrl).toBe("https://example.com");
  });

  it("uses hosted provider URLs when an explicit app URL is not set", () => {
    const renderParsed = parseEnvironment({
      NODE_ENV: "production",
      DATABASE_URL: "postgresql://postgres:postgres@localhost:5432/internal_dev_portal?schema=public",
      AUTH_SECRET: "render-secret",
      RENDER_EXTERNAL_URL: "https://internal-dev-portal.onrender.com/"
    });

    const vercelParsed = parseEnvironment({
      NODE_ENV: "production",
      DATABASE_URL: "postgresql://postgres:postgres@localhost:5432/internal_dev_portal?schema=public",
      AUTH_SECRET: "vercel-secret",
      VERCEL_URL: "internal-dev-portal.vercel.app"
    });

    expect(renderParsed.appBaseUrl).toBe("https://internal-dev-portal.onrender.com");
    expect(vercelParsed.appBaseUrl).toBe("https://internal-dev-portal.vercel.app");
  });

  it("requires AUTH_SECRET in production", () => {
    const parsed = parseEnvironment({
      NODE_ENV: "production",
      DATABASE_URL: "postgresql://postgres:postgres@localhost:5432/internal_dev_portal?schema=public",
      NEXT_PUBLIC_APP_URL: "https://portal.example.com"
    });

    expect(() => validateEnvironmentConfig(parsed)).toThrow("AUTH_SECRET is required");
  });

  it("requires GitHub OAuth credentials to be configured together", () => {
    const parsed = parseEnvironment({
      NODE_ENV: "development",
      DATABASE_URL: "postgresql://postgres:postgres@localhost:5432/internal_dev_portal?schema=public",
      GITHUB_CLIENT_ID: "client-only",
      NEXT_PUBLIC_APP_URL: "http://localhost:3000"
    });

    expect(() => validateEnvironmentConfig(parsed)).toThrow("GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET must be configured together");
  });
});
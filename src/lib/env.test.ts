import { describe, expect, it } from "vitest";

import { parseEnvironment, validateEnvironmentConfig } from "@/lib/env";

describe("environment configuration", () => {
  it("parses and trims runtime values", () => {
    const parsed = parseEnvironment({
      NODE_ENV: "development",
      DATABASE_URL: " file:./test.db ",
      AUTH_SECRET: " test-secret ",
      GITHUB_CLIENT_ID: " client-id ",
      GITHUB_CLIENT_SECRET: " client-secret ",
      GITHUB_WEBHOOK_SECRET: " webhook-secret ",
      NEXT_PUBLIC_APP_URL: " https://example.com "
    });

    expect(parsed.databaseUrl).toBe("file:./test.db");
    expect(parsed.authSecret).toBe("test-secret");
    expect(parsed.githubClientId).toBe("client-id");
    expect(parsed.githubClientSecret).toBe("client-secret");
    expect(parsed.githubWebhookSecret).toBe("webhook-secret");
    expect(parsed.appBaseUrl).toBe("https://example.com");
  });

  it("requires AUTH_SECRET in production", () => {
    const parsed = parseEnvironment({
      NODE_ENV: "production",
      DATABASE_URL: "file:./prod.db",
      NEXT_PUBLIC_APP_URL: "https://portal.example.com"
    });

    expect(() => validateEnvironmentConfig(parsed)).toThrow("AUTH_SECRET is required");
  });

  it("requires GitHub OAuth credentials to be configured together", () => {
    const parsed = parseEnvironment({
      NODE_ENV: "development",
      DATABASE_URL: "file:./dev.db",
      GITHUB_CLIENT_ID: "client-only",
      NEXT_PUBLIC_APP_URL: "http://localhost:3000"
    });

    expect(() => validateEnvironmentConfig(parsed)).toThrow("GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET must be configured together");
  });
});
import { createHmac } from "node:crypto";

import { describe, expect, it } from "vitest";

import { normalizeGithubEvent, verifyGithubWebhookWithSecret } from "@/lib/github-webhooks";

describe("GitHub webhook helpers", () => {
  it("verifies a valid webhook signature", () => {
    const secret = "super-secret";
    const payload = JSON.stringify({ hello: "world" });
    const signature = `sha256=${createHmac("sha256", secret).update(payload).digest("hex")}`;

    expect(verifyGithubWebhookWithSecret(secret, signature, payload)).toBe(true);
    expect(verifyGithubWebhookWithSecret(secret, "sha256=bad", payload)).toBe(false);
  });

  it("normalizes push events into activity-ready records", () => {
    const normalized = normalizeGithubEvent(
      "push",
      {
        ref: "refs/heads/main",
        after: "abc123",
        compare: "https://github.com/acme/api/compare",
        commits: [{ id: "1" }, { id: "2" }],
        head_commit: {
          message: "Ship search polish\n\nwith extra detail",
          timestamp: "2026-03-10T12:00:00.000Z"
        },
        pusher: {
          name: "anaya"
        }
      },
      "billing-api"
    );

    expect(normalized).not.toBeNull();
    expect(normalized?.type).toBe("github.push");
    expect(normalized?.title).toContain("billing-api received 2 commits on main");
    expect(normalized?.body).toContain("anaya pushed to main");
    expect(normalized?.metadata).toMatchObject({ branch: "main", commitCount: 2, headSha: "abc123" });
  });

  it("only normalizes published releases", () => {
    const published = normalizeGithubEvent(
      "release",
      {
        action: "published",
        sender: { login: "mina" },
        release: {
          tag_name: "v1.4.0",
          name: "Search Release",
          published_at: "2026-03-10T15:00:00.000Z"
        }
      },
      "docs-web"
    );

    const draft = normalizeGithubEvent(
      "release",
      {
        action: "created",
        release: {
          tag_name: "v1.4.0"
        }
      },
      "docs-web"
    );

    expect(published?.type).toBe("github.release.published");
    expect(published?.body).toContain("mina published v1.4.0");
    expect(draft).toBeNull();
  });

  it("normalizes completed workflow runs with CI status", () => {
    const normalized = normalizeGithubEvent(
      "workflow_run",
      {
        action: "completed",
        sender: { login: "github-actions" },
        workflow_run: {
          name: "deploy",
          html_url: "https://github.com/acme/api/actions/runs/1",
          conclusion: "success",
          head_branch: "main",
          updated_at: "2026-03-10T16:00:00.000Z",
          actor: { login: "marco" }
        }
      },
      "edge-gateway"
    );

    expect(normalized).not.toBeNull();
    expect(normalized?.source).toBe("ci");
    expect(normalized?.type).toBe("ci.workflow.succeeded");
    expect(normalized?.title).toContain("edge-gateway workflow deploy succeeded");
    expect(normalized?.metadata).toMatchObject({ branch: "main", workflowName: "deploy", conclusion: "success" });
  });
});
import { createHmac, timingSafeEqual } from "node:crypto";

export interface GithubWebhookPayload {
  repository?: {
    full_name?: string;
    name?: string;
    default_branch?: string;
  };
  ref?: string;
  after?: string;
  compare?: string;
  commits?: Array<{ id?: string; message?: string }>;
  head_commit?: {
    id?: string;
    message?: string;
    timestamp?: string;
  };
  pusher?: {
    name?: string;
  };
  sender?: {
    login?: string;
  };
  action?: string;
  release?: {
    tag_name?: string;
    name?: string;
    published_at?: string;
  };
  workflow_run?: {
    name?: string;
    html_url?: string;
    conclusion?: string | null;
    head_branch?: string;
    updated_at?: string;
    actor?: {
      login?: string;
    };
  };
}

export interface NormalizedGithubEvent {
  source: "github" | "ci";
  type: string;
  title: string;
  body: string;
  occurredAt: Date;
  metadata: Record<string, unknown>;
}

function parseDate(value?: string | null) {
  if (!value) {
    return new Date();
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
}

function getRefName(ref?: string) {
  return ref?.split("/").pop() ?? "unknown";
}

function normalizePushEvent(repositoryName: string, payload: GithubWebhookPayload): NormalizedGithubEvent {
  const branch = getRefName(payload.ref);
  const commits = Array.isArray(payload.commits) ? payload.commits.length : 0;
  const actor = payload.pusher?.name ?? payload.sender?.login ?? "GitHub";
  const headMessage = payload.head_commit?.message?.split("\n")[0] ?? "New commits received.";

  return {
    source: "github",
    type: "github.push",
    title: `${repositoryName} received ${commits} ${commits === 1 ? "commit" : "commits"} on ${branch}`,
    body: `${actor} pushed to ${branch}. ${headMessage}`,
    occurredAt: parseDate(payload.head_commit?.timestamp),
    metadata: {
      branch,
      compareUrl: payload.compare,
      commitCount: commits,
      headSha: payload.after
    }
  };
}

function normalizeReleaseEvent(repositoryName: string, payload: GithubWebhookPayload) {
  if (payload.action !== "published") {
    return null;
  }

  const actor = payload.sender?.login ?? "GitHub";
  const tag = payload.release?.tag_name ?? "new release";
  const releaseName = payload.release?.name && payload.release.name !== tag ? ` (${payload.release.name})` : "";

  return {
    source: "github",
    type: "github.release.published",
    title: `${repositoryName} published ${tag}`,
    body: `${actor} published ${tag}${releaseName}.`,
    occurredAt: parseDate(payload.release?.published_at),
    metadata: {
      action: payload.action,
      tag,
      releaseName: payload.release?.name
    }
  } satisfies NormalizedGithubEvent;
}

function normalizeWorkflowEvent(repositoryName: string, payload: GithubWebhookPayload) {
  if (payload.action !== "completed" || !payload.workflow_run) {
    return null;
  }

  const workflowName = payload.workflow_run.name ?? "workflow";
  const branch = payload.workflow_run.head_branch ?? "unknown branch";
  const conclusion = payload.workflow_run.conclusion ?? "completed";
  const actor = payload.workflow_run.actor?.login ?? payload.sender?.login ?? "GitHub Actions";
  const success = conclusion === "success";

  return {
    source: "ci",
    type: success ? "ci.workflow.succeeded" : "ci.workflow.completed",
    title: `${repositoryName} workflow ${workflowName} ${success ? "succeeded" : conclusion}`,
    body: `${actor} ran ${workflowName} on ${branch}. Conclusion: ${conclusion}.`,
    occurredAt: parseDate(payload.workflow_run.updated_at),
    metadata: {
      branch,
      conclusion,
      workflowName,
      runUrl: payload.workflow_run.html_url
    }
  } satisfies NormalizedGithubEvent;
}

export function normalizeGithubEvent(eventName: string, payload: GithubWebhookPayload, repositoryName: string) {
  switch (eventName) {
    case "push":
      return normalizePushEvent(repositoryName, payload);
    case "release":
      return normalizeReleaseEvent(repositoryName, payload);
    case "workflow_run":
      return normalizeWorkflowEvent(repositoryName, payload);
    default:
      return null;
  }
}

export function verifyGithubWebhookWithSecret(secret: string | undefined, signature: string | null, payload: string) {
  if (!secret || !signature || !signature.startsWith("sha256=")) {
    return false;
  }

  const expected = createHmac("sha256", secret).update(payload).digest("hex");
  const expectedBuffer = Buffer.from(`sha256=${expected}`);
  const actualBuffer = Buffer.from(signature);

  if (expectedBuffer.length !== actualBuffer.length) {
    return false;
  }

  return timingSafeEqual(expectedBuffer, actualBuffer);
}
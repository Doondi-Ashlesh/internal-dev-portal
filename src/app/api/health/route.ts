import { NextResponse } from "next/server";

import { db } from "@/lib/db";
import { env, isGithubAuthConfigured, isGithubWebhookConfigured, validateEnvironment } from "@/lib/env";

export async function GET() {
  let databaseOk = true;
  let databaseError: string | undefined;
  let configurationOk = true;
  let configurationError: string | undefined;

  try {
    await db.$queryRawUnsafe("SELECT 1");
  } catch (error) {
    databaseOk = false;
    databaseError = error instanceof Error ? error.message : "Database connectivity check failed.";
  }

  try {
    validateEnvironment();
  } catch (error) {
    configurationOk = false;
    configurationError = error instanceof Error ? error.message : "Environment validation failed.";
  }

  const ok = databaseOk && configurationOk;

  return NextResponse.json(
    {
      ok,
      service: "internal-dev-portal",
      timestamp: new Date().toISOString(),
      checks: {
        database: databaseOk ? "ok" : "error",
        configuration: configurationOk ? "ok" : "error"
      },
      config: {
        nodeEnv: env.nodeEnv,
        githubAuthConfigured: isGithubAuthConfigured(),
        githubWebhookConfigured: isGithubWebhookConfigured(),
        appBaseUrl: env.appBaseUrl
      },
      errors: [databaseError, configurationError].filter(Boolean)
    },
    { status: ok ? 200 : 503 }
  );
}
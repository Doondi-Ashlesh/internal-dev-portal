import { z } from "zod";

const trim = (value?: string) => {
  const normalized = value?.trim();
  return normalized ? normalized : undefined;
};

const postgresUrlSchema = z.string().min(1).refine((value) => /^postgres(ql)?:\/\//i.test(value), {
  message: "DATABASE_URL must be a PostgreSQL connection string."
});

const normalizeBaseUrl = (value?: string) => {
  const normalized = trim(value);

  if (!normalized) {
    return undefined;
  }

  const withScheme = /^https?:\/\//i.test(normalized) ? normalized : `https://${normalized}`;

  return withScheme.replace(/\/$/, "");
};

const resolveAppBaseUrl = (input: NodeJS.ProcessEnv | Record<string, string | undefined>) => {
  return (
    normalizeBaseUrl(input.NEXT_PUBLIC_APP_URL) ??
    normalizeBaseUrl(input.RENDER_EXTERNAL_URL) ??
    normalizeBaseUrl(input.VERCEL_PROJECT_PRODUCTION_URL) ??
    normalizeBaseUrl(input.VERCEL_URL) ??
    "http://localhost:3000"
  );
};

export const envSchema = z.object({
  nodeEnv: z.enum(["development", "test", "production"]).default("development"),
  databaseUrl: postgresUrlSchema.default("postgresql://postgres:postgres@localhost:5432/internal_dev_portal?schema=public"),
  authSecret: z.string().optional(),
  githubClientId: z.string().optional(),
  githubClientSecret: z.string().optional(),
  githubWebhookSecret: z.string().optional(),
  appBaseUrl: z.string().url().optional()
});

export type RuntimeEnv = z.infer<typeof envSchema>;

export function parseEnvironment(input: NodeJS.ProcessEnv | Record<string, string | undefined>): RuntimeEnv {
  return envSchema.parse({
    nodeEnv: input.NODE_ENV,
    databaseUrl: trim(input.DATABASE_URL),
    authSecret: trim(input.AUTH_SECRET),
    githubClientId: trim(input.GITHUB_CLIENT_ID),
    githubClientSecret: trim(input.GITHUB_CLIENT_SECRET),
    githubWebhookSecret: trim(input.GITHUB_WEBHOOK_SECRET),
    appBaseUrl: resolveAppBaseUrl(input)
  });
}

export function validateEnvironmentConfig(config: RuntimeEnv) {
  if (config.nodeEnv === "production" && !config.authSecret) {
    throw new Error("AUTH_SECRET is required when running in production mode.");
  }

  if (Boolean(config.githubClientId) !== Boolean(config.githubClientSecret)) {
    throw new Error("GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET must be configured together.");
  }

  return config;
}

export const env = validateEnvironmentConfig(parseEnvironment(process.env));

export function validateEnvironment() {
  return validateEnvironmentConfig(env);
}

export function isGithubAuthConfigured() {
  return Boolean(env.githubClientId && env.githubClientSecret);
}

export function isGithubWebhookConfigured() {
  return Boolean(env.githubWebhookSecret);
}
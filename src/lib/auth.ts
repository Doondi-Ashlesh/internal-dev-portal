import Credentials from "next-auth/providers/credentials";
import GitHub from "next-auth/providers/github";
import type { NextAuthConfig } from "next-auth";
import { z } from "zod";

import { db } from "@/lib/db";
import { env, isGithubAuthConfigured } from "@/lib/env";
import { WorkspaceRole } from "@/lib/types";

const demoSchema = z.object({
  name: z.string().min(2).default("Demo User"),
  email: z.string().email().default("demo@foundry.dev")
});

const workspaceRoles: WorkspaceRole[] = ["owner", "admin", "editor", "viewer"];

export function isWorkspaceRole(value: string | null | undefined): value is WorkspaceRole {
  return typeof value === "string" && workspaceRoles.includes(value as WorkspaceRole);
}

export function getDefaultGithubWorkspaceRole(): WorkspaceRole {
  return process.env.NODE_ENV === "production" ? "viewer" : "admin";
}

export async function loadMembershipContext(userId: string) {
  const membership = await db.workspaceMember.findFirst({
    where: { userId },
    include: { workspace: true },
    orderBy: { createdAt: "asc" }
  });

  if (!membership) {
    return null;
  }

  return {
    role: membership.role as WorkspaceRole,
    workspaceId: membership.workspaceId,
    workspaceSlug: membership.workspace.slug
  };
}

export async function upsertWorkspaceUser(input: {
  githubId?: string;
  email?: string | null;
  name?: string | null;
  image?: string | null;
  defaultRole: WorkspaceRole;
}) {
  const email = input.email ?? undefined;
  const name = input.name ?? undefined;
  const image = input.image ?? undefined;

  if (!email && !input.githubId) {
    return null;
  }

  const existingWorkspace = await db.workspace.findFirst({ orderBy: { createdAt: "asc" } });
  const user = await db.user.upsert({
    where: input.githubId ? { githubId: input.githubId } : { email: email ?? `placeholder-${Date.now()}@local.dev` },
    update: {
      email,
      name,
      image,
      githubId: input.githubId
    },
    create: {
      email,
      name,
      image,
      githubId: input.githubId
    }
  });

  if (existingWorkspace) {
    await db.workspaceMember.upsert({
      where: {
        workspaceId_userId: {
          workspaceId: existingWorkspace.id,
          userId: user.id
        }
      },
      update: {},
      create: {
        workspaceId: existingWorkspace.id,
        userId: user.id,
        role: input.defaultRole
      }
    });
  }

  return user;
}

async function syncTokenFromIdentity(token: Record<string, unknown>, input: { id?: string; email?: string | null; githubId?: string | null }) {
  let user = input.id ? await db.user.findUnique({ where: { id: input.id } }) : null;

  if (!user && input.githubId) {
    user = await db.user.findUnique({ where: { githubId: input.githubId } });
  }

  if (!user && input.email) {
    user = await db.user.findUnique({ where: { email: input.email } });
  }

  if (!user) {
    return token;
  }

  const membership = await loadMembershipContext(user.id);

  token.userId = user.id;
  token.githubId = user.githubId ?? token.githubId;

  if (membership) {
    token.role = membership.role;
    token.workspaceId = membership.workspaceId;
    token.workspaceSlug = membership.workspaceSlug;
  }

  return token;
}

const providers = [
  ...(isGithubAuthConfigured()
    ? [
        GitHub({
          clientId: env.githubClientId ?? "",
          clientSecret: env.githubClientSecret ?? "",
          authorization: {
            params: {
              scope: "read:user user:email repo read:org"
            }
          }
        })
      ]
    : []),
  Credentials({
    id: "demo",
    name: "Demo access",
    credentials: {
      name: { label: "Name", type: "text" },
      email: { label: "Email", type: "email" }
    },
    authorize: async (credentials) => {
      const parsed = demoSchema.safeParse({
        name: credentials?.name,
        email: credentials?.email
      });

      if (!parsed.success) {
        return null;
      }

      const user = await upsertWorkspaceUser({
        email: parsed.data.email,
        name: parsed.data.name,
        image: null,
        defaultRole: "owner"
      });

      if (!user) {
        return null;
      }

      const membership = await loadMembershipContext(user.id);

      return {
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
        githubId: user.githubId ?? undefined,
        role: membership?.role ?? "owner",
        workspaceId: membership?.workspaceId,
        workspaceSlug: membership?.workspaceSlug
      };
    }
  })
];

export const authConfig: NextAuthConfig = {
  secret: env.authSecret,
  trustHost: true,
  providers,
  session: {
    strategy: "jwt"
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === "github") {
        await upsertWorkspaceUser({
          githubId: profile?.id ? String(profile.id) : undefined,
          email: user.email,
          name: user.name,
          image: user.image,
          defaultRole: getDefaultGithubWorkspaceRole()
        });
      }

      return true;
    },
    async jwt({ token, user, profile, account }) {
      if (account?.provider === "github") {
        const localUser = await upsertWorkspaceUser({
          githubId: profile?.id ? String(profile.id) : typeof token.githubId === "string" ? token.githubId : undefined,
          email: user?.email ?? (typeof token.email === "string" ? token.email : undefined),
          name: user?.name ?? (typeof token.name === "string" ? token.name : undefined),
          image: user?.image ?? null,
          defaultRole: getDefaultGithubWorkspaceRole()
        });

        if (localUser) {
          await syncTokenFromIdentity(token, {
            id: localUser.id,
            email: localUser.email,
            githubId: localUser.githubId
          });
        }
      } else if (user) {
        await syncTokenFromIdentity(token, {
          id: user.id,
          email: user.email,
          githubId: typeof user.githubId === "string" ? user.githubId : undefined
        });
      } else if (!token.userId) {
        await syncTokenFromIdentity(token, {
          email: typeof token.email === "string" ? token.email : undefined,
          githubId: typeof token.githubId === "string" ? token.githubId : undefined
        });
      }

      if (profile?.id) {
        token.githubId = String(profile.id);
      }

      if (account?.provider === "github" && typeof account.access_token === "string") {
        token.accessToken = account.access_token;
      }

      if (user?.name) {
        token.name = user.name;
      }

      if (user?.email) {
        token.email = user.email;
      }

      if (typeof user?.role === "string") {
        token.role = user.role;
      }

      if (typeof user?.workspaceId === "string") {
        token.workspaceId = user.workspaceId;
      }

      if (typeof user?.workspaceSlug === "string") {
        token.workspaceSlug = user.workspaceSlug;
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        if (typeof token.userId === "string") {
          session.user.id = token.userId;
        }
        if (typeof token.githubId === "string") {
          session.user.githubId = token.githubId;
        }
        if (typeof token.role === "string") {
          session.user.role = token.role;
        }
        if (typeof token.accessToken === "string") {
          session.user.accessToken = token.accessToken;
        }
        if (typeof token.workspaceId === "string") {
          session.user.workspaceId = token.workspaceId;
        }
        if (typeof token.workspaceSlug === "string") {
          session.user.workspaceSlug = token.workspaceSlug;
        }
      }

      return session;
    }
  },
  pages: {
    signIn: "/login"
  }
};

declare module "next-auth" {
  interface Session {
    user?: {
      id?: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      githubId?: string;
      role?: string;
      accessToken?: string;
      workspaceId?: string;
      workspaceSlug?: string;
    };
  }

  interface User {
    githubId?: string;
    role?: string;
    workspaceId?: string;
    workspaceSlug?: string;
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    userId?: string;
    githubId?: string;
    role?: string;
    accessToken?: string;
    workspaceId?: string;
    workspaceSlug?: string;
  }
}
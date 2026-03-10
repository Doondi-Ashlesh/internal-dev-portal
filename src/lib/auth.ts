import Credentials from "next-auth/providers/credentials";
import GitHub from "next-auth/providers/github";
import type { NextAuthConfig } from "next-auth";
import { z } from "zod";

import { db } from "@/lib/db";

const demoSchema = z.object({
  name: z.string().min(2).default("Demo User"),
  email: z.string().email().default("demo@foundry.dev")
});

async function upsertWorkspaceUser(input: { githubId?: string; email?: string | null; name?: string | null; image?: string | null }) {
  const email = input.email ?? undefined;
  const name = input.name ?? undefined;
  const image = input.image ?? undefined;

  if (!email && !input.githubId) {
    return null;
  }

  const existingWorkspace = await db.workspace.findFirst();
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
        role: "viewer"
      }
    });
  }

  return user;
}

export const authConfig: NextAuthConfig = {
  providers: [
    GitHub({
      clientId: process.env.GITHUB_CLIENT_ID ?? "",
      clientSecret: process.env.GITHUB_CLIENT_SECRET ?? "",
      authorization: {
        params: {
          scope: "read:user user:email repo read:org"
        }
      }
    }),
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
          image: null
        });

        if (!user) {
          return null;
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
          githubId: user.githubId ?? undefined,
          role: "owner"
        };
      }
    })
  ],
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
          image: user.image
        });
      }

      return true;
    },
    async jwt({ token, user, profile, account }) {
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

      if (typeof user?.githubId === "string") {
        token.githubId = user.githubId;
      }

      if (typeof user?.role === "string") {
        token.role = user.role;
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        if (typeof token.sub === "string") {
          session.user.id = token.sub;
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
    };
  }

  interface User {
    githubId?: string;
    role?: string;
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    githubId?: string;
    role?: string;
    accessToken?: string;
  }
}

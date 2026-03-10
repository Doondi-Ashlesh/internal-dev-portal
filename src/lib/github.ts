import { db } from "@/lib/db";
import { GithubRepositorySummary } from "@/lib/types";

interface GithubApiRepository {
  id: number;
  name: string;
  full_name: string;
  html_url: string;
  private: boolean;
  description: string | null;
  default_branch: string;
  pushed_at: string | null;
  owner: {
    login: string;
  };
}

export interface GithubRepoSyncInput {
  workspaceId: string;
  accessToken: string;
}

export async function fetchGithubRepositories(accessToken: string): Promise<GithubRepositorySummary[]> {
  const response = await fetch("https://api.github.com/user/repos?per_page=100&sort=updated&affiliation=owner,organization_member,collaborator", {
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${accessToken}`,
      "User-Agent": "internal-dev-portal"
    },
    cache: "no-store"
  });

  if (!response.ok) {
    throw new Error(`GitHub repository request failed with status ${response.status}`);
  }

  const repositories = (await response.json()) as GithubApiRepository[];

  return repositories.map((repository) => ({
    id: String(repository.id),
    externalId: String(repository.id),
    owner: repository.owner.login,
    name: repository.name,
    fullName: repository.full_name,
    defaultBranch: repository.default_branch,
    url: repository.html_url,
    isPrivate: repository.private,
    description: repository.description ?? undefined,
    pushedAt: repository.pushed_at ?? undefined,
    links: []
  }));
}

export async function importGithubRepositories(input: GithubRepoSyncInput) {
  const repositories = await fetchGithubRepositories(input.accessToken);

  for (const repository of repositories) {
    const existing = await db.repository.findFirst({
      where: {
        workspaceId: input.workspaceId,
        fullName: repository.fullName
      }
    });

    if (existing) {
      await db.repository.update({
        where: { id: existing.id },
        data: {
          externalId: repository.externalId,
          owner: repository.owner,
          name: repository.name,
          fullName: repository.fullName,
          defaultBranch: repository.defaultBranch,
          url: repository.url,
          isPrivate: repository.isPrivate,
          workspaceId: input.workspaceId
        }
      });
    } else {
      await db.repository.create({
        data: {
          workspaceId: input.workspaceId,
          externalId: repository.externalId,
          owner: repository.owner,
          name: repository.name,
          fullName: repository.fullName,
          defaultBranch: repository.defaultBranch,
          url: repository.url,
          isPrivate: repository.isPrivate,
          provider: "github"
        }
      });
    }
  }

  return {
    synced: true,
    count: repositories.length
  };
}

export async function verifyGithubWebhook(signature: string | null, payload: string) {
  return Boolean(signature && payload.length > 0);
}

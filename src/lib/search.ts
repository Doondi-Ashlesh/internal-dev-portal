import { appNavigation } from "@/lib/navigation";
import { SearchResultItem, SearchResultsPayload } from "@/lib/types";
import { getWorkspaceSnapshot } from "@/server/workspace";

function scoreField(field: string, query: string) {
  const normalized = field.trim().toLowerCase();

  if (!normalized) {
    return 0;
  }

  if (normalized === query) {
    return 140;
  }

  if (normalized.startsWith(query)) {
    return 110;
  }

  if (normalized.split(/\s+/).some((part) => part.startsWith(query))) {
    return 90;
  }

  if (normalized.includes(query)) {
    return 70;
  }

  return 0;
}

function scoreFields(fields: string[], query: string) {
  return fields.reduce((best, field) => Math.max(best, scoreField(field, query)), 0);
}

function rankResults<T extends SearchResultItem>(items: Array<T & { score: number }>) {
  return items.sort((left, right) => {
    if (right.score !== left.score) {
      return right.score - left.score;
    }

    return left.title.localeCompare(right.title);
  });
}

export async function searchWorkspace(query: string): Promise<SearchResultsPayload> {
  const snapshot = await getWorkspaceSnapshot();
  const normalized = query.trim().toLowerCase();

  const shortcutHints: Record<string, string> = {
    "/dashboard": "Workspace overview and health",
    "/catalog": "Services, ownership, and environments",
    "/docs": "Runbooks, references, announcements",
    "/activity": "GitHub and portal timeline",
    "/admin/integrations": "Repos, links, webhook deliveries",
    "/admin/members": "Roles, invites, teams"
  };

  const shortcuts: SearchResultItem[] = appNavigation.slice(0, 6).map((item) => ({
    id: item.href,
    kind: "shortcut",
    title: item.label,
    description: shortcutHints[item.href] ?? `Open ${item.label}.`,
    href: item.href,
    meta: "Page",
    badge: "Go"
  }));

  if (!normalized) {
    const defaultServices = snapshot.services.slice(0, 5).map((service) => ({
      id: service.id,
      kind: "service" as const,
      title: service.name,
      description: service.description,
      href: `/services/${service.slug}`,
      meta: `${service.team} • ${service.owner}`,
      badge: service.status
    }));

    const defaultDocuments = snapshot.documents.slice(0, 5).map((document) => ({
      id: document.id,
      kind: "document" as const,
      title: document.title,
      description: document.excerpt,
      href: `/docs#doc-${document.slug}`,
      meta: document.serviceSlug ? `${document.type} • ${document.serviceSlug}` : document.type,
      badge: document.type
    }));

    const defaultTeams = snapshot.teams.slice(0, 4).map((team) => ({
      id: team.id,
      kind: "team" as const,
      title: team.name,
      description: team.description ?? `${team.memberCount} services mapped to this team.`,
      href: `/admin/members#team-${team.slug}`,
      meta: `${team.memberCount} services`,
      badge: "team"
    }));

    const total = shortcuts.length + defaultServices.length + defaultDocuments.length + defaultTeams.length;

    return {
      query,
      shortcuts,
      services: defaultServices,
      documents: defaultDocuments,
      teams: defaultTeams,
      total
    };
  }

  const rankedServices = rankResults(
    snapshot.services
      .map((service) => ({
        id: service.id,
        kind: "service" as const,
        title: service.name,
        description: service.description,
        href: `/services/${service.slug}`,
        meta: `${service.team} • ${service.owner}`,
        badge: service.status,
        score: scoreFields(
          [service.name, service.description, service.team, service.owner, service.repo, ...service.tags],
          normalized
        )
      }))
      .filter((item) => item.score > 0)
  ).slice(0, 6);

  const rankedDocuments = rankResults(
    snapshot.documents
      .map((document) => ({
        id: document.id,
        kind: "document" as const,
        title: document.title,
        description: document.excerpt,
        href: `/docs#doc-${document.slug}`,
        meta: document.serviceSlug ? `${document.type} • ${document.serviceSlug}` : document.type,
        badge: document.type,
        score: scoreFields(
          [document.title, document.excerpt, document.type, document.serviceSlug ?? ""],
          normalized
        )
      }))
      .filter((item) => item.score > 0)
  ).slice(0, 6);

  const rankedTeams = rankResults(
    snapshot.teams
      .map((team) => ({
        id: team.id,
        kind: "team" as const,
        title: team.name,
        description: team.description ?? `${team.memberCount} services mapped to this team.`,
        href: `/admin/members#team-${team.slug}`,
        meta: `${team.memberCount} services`,
        badge: "team",
        score: scoreFields([team.name, team.slug, team.description ?? ""], normalized)
      }))
      .filter((item) => item.score > 0)
  ).slice(0, 4);

  const rankedShortcuts = rankResults(
    shortcuts
      .map((item) => ({
        ...item,
        score: scoreFields([item.title, item.description], normalized)
      }))
      .filter((item) => item.score > 0)
  ).slice(0, 4);

  const total = rankedServices.length + rankedDocuments.length + rankedTeams.length + rankedShortcuts.length;

  return {
    query,
    services: rankedServices,
    documents: rankedDocuments,
    teams: rankedTeams,
    shortcuts: rankedShortcuts,
    total
  };
}
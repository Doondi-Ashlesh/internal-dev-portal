export type WorkspaceRole = "owner" | "admin" | "editor" | "viewer";
export type ServiceStatus = "healthy" | "degraded" | "down" | "unknown";
export type RepositoryRelationship = "primary" | "worker" | "docs" | "infra" | "library" | "other";

export interface WorkspaceSummary {
  id: string;
  name: string;
  slug: string;
  memberCount: number;
}

export interface TeamSummary {
  id: string;
  name: string;
  slug: string;
  memberCount: number;
  description?: string;
}

export interface ServiceRepositoryLinkSummary {
  repositoryId: string;
  fullName: string;
  url: string;
  relationshipType: RepositoryRelationship;
}

export interface ServiceSummary {
  id: string;
  slug: string;
  name: string;
  description: string;
  team: string;
  teamId?: string;
  owner: string;
  status: ServiceStatus;
  tier: "critical" | "high" | "medium" | "low";
  lifecycle: "experimental" | "active" | "deprecated";
  repo: string;
  primaryRepositoryUrl?: string;
  repositories: ServiceRepositoryLinkSummary[];
  environments: string[];
  tags: string[];
  lastChange: string;
}

export interface DocumentSummary {
  id: string;
  title: string;
  slug: string;
  type: "doc" | "runbook" | "announcement";
  serviceSlug?: string;
  serviceId?: string;
  excerpt: string;
  contentMarkdown?: string;
  updatedAt: string;
}

export interface ActivityItem {
  id: string;
  source: "github" | "ci" | "manual" | "system";
  title: string;
  body: string;
  occurredAt: string;
  serviceSlug?: string;
}

export interface GithubRepositoryLinkSummary {
  serviceId: string;
  serviceName: string;
  relationshipType: RepositoryRelationship;
}

export interface GithubRepositorySummary {
  id: string;
  externalId?: string;
  owner: string;
  name: string;
  fullName: string;
  defaultBranch?: string;
  url: string;
  isPrivate: boolean;
  description?: string;
  pushedAt?: string;
  links: GithubRepositoryLinkSummary[];
}

export interface DashboardMetrics {
  services: number;
  healthy: number;
  degraded: number;
  docs: number;
}

export interface WorkspaceSnapshot {
  workspace: WorkspaceSummary;
  teams: TeamSummary[];
  services: ServiceSummary[];
  documents: DocumentSummary[];
  activity: ActivityItem[];
  metrics: DashboardMetrics;
}

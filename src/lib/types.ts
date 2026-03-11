export type WorkspaceRole = "owner" | "admin" | "editor" | "viewer";
export type ServiceStatus = "healthy" | "degraded" | "down" | "unknown";
export type RepositoryRelationship = "primary" | "worker" | "docs" | "infra" | "library" | "other";
export type WebhookDeliveryStatus = "pending" | "processed" | "ignored" | "failed";
export type SearchResultKind = "service" | "document" | "team" | "shortcut";

export interface WorkspaceSummary {
  id: string;
  name: string;
  slug: string;
  memberCount: number;
}

export interface WorkspaceMemberSummary {
  id: string;
  userId: string;
  name: string;
  email: string;
  role: WorkspaceRole;
  avatarUrl?: string;
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
  lifecycle: "experimental" | "active" | "deprecated" | "retired";
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

export interface AuditLogItem {
  id: string;
  action: string;
  entityType: string;
  entityId?: string;
  actorName: string;
  summary: string;
  createdAt: string;
}

export interface WebhookDeliverySummary {
  id: string;
  deliveryId: string;
  eventName: string;
  repositoryFullName?: string;
  status: WebhookDeliveryStatus;
  signatureValid: boolean;
  createdAt: string;
  processedAt?: string;
  errorMessage?: string;
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

export interface SearchResultItem {
  id: string;
  kind: SearchResultKind;
  title: string;
  description: string;
  href: string;
  meta?: string;
  badge?: string;
}

export interface SearchResultsPayload {
  query: string;
  services: SearchResultItem[];
  documents: SearchResultItem[];
  teams: SearchResultItem[];
  shortcuts: SearchResultItem[];
  total: number;
}

export interface DashboardMetrics {
  services: number;
  healthy: number;
  degraded: number;
  docs: number;
}

export interface WorkspaceSnapshot {
  workspace: WorkspaceSummary;
  members: WorkspaceMemberSummary[];
  teams: TeamSummary[];
  services: ServiceSummary[];
  documents: DocumentSummary[];
  activity: ActivityItem[];
  metrics: DashboardMetrics;
}
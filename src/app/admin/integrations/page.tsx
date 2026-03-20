import { AppShell } from "@/components/app-shell";
import { GithubRepoManagement } from "@/components/admin/github-repo-management";
import { WorkspaceUnavailableState } from "@/components/workspace-unavailable-state";
import { env, isGithubWebhookConfigured } from "@/lib/env";
import { canManageWorkspace } from "@/lib/permissions";
import { getPageWorkspaceContext } from "@/server/access";
import {
  getWorkspaceRepositories,
  getWorkspaceSnapshot,
  getWorkspaceWebhookDeliveries,
  WorkspaceDataUnavailableError
} from "@/server/workspace";

export default async function IntegrationsPage() {
  const access = await getPageWorkspaceContext();
  const canManage = canManageWorkspace(access.role);
  const hasGithubAccess = Boolean(access.accessToken);
  const webhookConfigured = isGithubWebhookConfigured();
  const webhookEndpoint = `${env.appBaseUrl}/api/webhooks/github`;

  const integrationCards = [
    {
      title: "GitHub (OAuth)",
      status: hasGithubAccess ? "Connected" : "Sign in with GitHub",
      description: "Login, import repos, and link them to services in this workspace."
    },
    {
      title: "Webhooks",
      status: webhookConfigured ? "Ready" : "Set GITHUB_WEBHOOK_SECRET",
      description: "Verify signed delivery payloads and show them in Activity."
    },
    {
      title: "RBAC & audit",
      status: "On",
      description: "Server actions check workspace role; changes are audit-logged."
    }
  ];

  try {
    const snapshot = await getWorkspaceSnapshot();
    const repositories = await getWorkspaceRepositories();
    const deliveries = await getWorkspaceWebhookDeliveries();

    return (
      <AppShell workspaceName={snapshot.workspace.name} currentPath="/admin/integrations">
        <section className="card card-pad hero">
          <div className="hero-split">
            <div className="stack-lg hero-copy" style={{ position: "relative", zIndex: 1 }}>
              <div>
                <div className="section-label">Admin</div>
                <h1 className="page-title" style={{ fontSize: "2.5rem" }}>GitHub &amp; webhooks</h1>
                <p className="muted" style={{ maxWidth: 720 }}>
                  Connect GitHub, import repositories, map them to services, and monitor webhook deliveries.
                </p>
              </div>
              <div className="row" style={{ justifyContent: "flex-start" }}>
                <span className="pill">{repositories.length} repositories</span>
                <span className="pill">{deliveries.length} recent deliveries</span>
                <span className="pill">RBAC enforced</span>
              </div>
            </div>
            <aside className="hero-sidebar">
              <article className="surface-panel stack">
                <div className="section-label">Status</div>
                <div className="compact-list">
                  <div className="compact-item">
                    <strong>GitHub token</strong>
                    <span className="pill">{hasGithubAccess ? "Available" : "Missing — re-auth with GitHub"}</span>
                  </div>
                  <div className="compact-item">
                    <strong>Webhook secret</strong>
                    <span className="pill">{webhookConfigured ? "Configured" : "Not set"}</span>
                  </div>
                  <div className="compact-item">
                    <strong>Your permissions</strong>
                    <span className="pill">{canManage ? "Can manage integrations" : "View only"}</span>
                  </div>
                </div>
              </article>
            </aside>
          </div>
        </section>

        <section className="card card-pad stack-lg">
          <div className="doc-grid">
            {integrationCards.map((card) => (
              <article key={card.title} className="info-card stack admin-card">
                <div className="row"><strong>{card.title}</strong><span className="pill">{card.status}</span></div>
                <span className="muted tiny">{card.description}</span>
              </article>
            ))}
          </div>
          <article className="info-card stack admin-card">
            <strong>GitHub webhook endpoint</strong>
            <code>{webhookEndpoint}</code>
            <span className="muted tiny">
              Configure this as the GitHub webhook URL and set `GITHUB_WEBHOOK_SECRET` so deliveries can be verified.
            </span>
          </article>
        </section>

        <section className="card card-pad stack-lg">
          <div className="section-copy">
            <div className="section-label">GitHub Sync</div>
            <h2 className="section-title" style={{ marginTop: 8 }}>Import and link repositories</h2>
            <p className="muted" style={{ maxWidth: 720 }}>
              Pull repositories from GitHub, keep them in the local catalog, and map them to internal services so webhook events
              land in the right activity feeds.
            </p>
          </div>
          <GithubRepoManagement
            workspaceId={snapshot.workspace.id}
            services={snapshot.services}
            repositories={repositories}
            canImport={hasGithubAccess && canManage}
            canManage={canManage}
          />
        </section>

        <section className="card card-pad stack-lg">
          <div className="section-copy">
            <div className="section-label">Recent Deliveries</div>
            <h2 className="section-title" style={{ marginTop: 8 }}>Webhook processing log</h2>
          </div>
          {deliveries.length ? (
            <div className="stack">
              {deliveries.map((delivery) => (
                <article key={delivery.id} className="info-card stack admin-card">
                  <div className="row">
                    <strong>{delivery.eventName}</strong>
                    <span className="pill">{delivery.status}</span>
                  </div>
                  <div className="meta-board">
                    <div className="meta-panel">
                      <span className="tiny muted">Repository</span>
                      <strong>{delivery.repositoryFullName ?? "Unmapped repository"}</strong>
                    </div>
                    <div className="meta-panel">
                      <span className="tiny muted">Delivery</span>
                      <strong>{delivery.deliveryId}</strong>
                    </div>
                    <div className="meta-panel">
                      <span className="tiny muted">Received</span>
                      <strong>{delivery.createdAt}</strong>
                    </div>
                    <div className="meta-panel">
                      <span className="tiny muted">Signature valid</span>
                      <strong>{String(delivery.signatureValid)}</strong>
                    </div>
                  </div>
                  <span className="muted tiny">
                    {delivery.processedAt ? `Processed ${delivery.processedAt}` : "Pending processing"}
                  </span>
                  {delivery.errorMessage ? <span className="muted tiny">{delivery.errorMessage}</span> : null}
                </article>
              ))}
            </div>
          ) : (
            <article className="empty-state stack">
              <strong>No webhook deliveries yet</strong>
              <span className="muted tiny">
                Send a signed GitHub webhook to this environment and recent deliveries will appear here.
              </span>
            </article>
          )}
        </section>
      </AppShell>
    );
  } catch (error) {
    if (error instanceof WorkspaceDataUnavailableError) {
      return <WorkspaceUnavailableState workspaceName={access.workspaceName} currentPath="/admin/integrations" />;
    }

    throw error;
  }
}

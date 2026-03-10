import { auth } from "@/auth";
import { AppShell } from "@/components/app-shell";
import { GithubRepoManagement } from "@/components/admin/github-repo-management";
import { getWorkspaceRepositories, getWorkspaceSnapshot } from "@/server/workspace";

const integrationCards = [
  {
    title: "GitHub OAuth",
    status: "Live",
    description: "Use GitHub for login, repository import, and CODEOWNERS-driven ownership mapping."
  },
  {
    title: "Webhook ingestion",
    status: "Next",
    description: "Receive push, release, and workflow events and normalize them into the activity feed."
  },
  {
    title: "Health checks",
    status: "Planned",
    description: "Attach manual, HTTP, or observability-backed sources to each service."
  }
];

export default async function IntegrationsPage() {
  const session = await auth();
  const snapshot = await getWorkspaceSnapshot();
  const repositories = await getWorkspaceRepositories();
  const hasGithubAccess = Boolean(session?.user?.accessToken);

  return (
    <AppShell workspaceName={snapshot.workspace.name} currentPath="/admin/integrations">
      <section className="card card-pad stack-lg">
        <div>
          <div className="section-label">Admin</div>
          <h1 className="page-title" style={{ fontSize: "2.5rem" }}>Integrations</h1>
          <p className="muted" style={{ maxWidth: 720 }}>
            This area is where GitHub app setup, webhook verification, CI provider connections, and service health
            providers will live as we wire the backend.
          </p>
        </div>
        <div className="doc-grid">
          {integrationCards.map((card) => (
            <article key={card.title} className="info-card stack">
              <div className="row"><strong>{card.title}</strong><span className="pill">{card.status}</span></div>
              <span className="muted tiny">{card.description}</span>
            </article>
          ))}
        </div>
      </section>

      <section className="card card-pad stack-lg">
        <div>
          <div className="section-label">GitHub Sync</div>
          <h2 className="section-title" style={{ marginTop: 8 }}>Import and link repositories</h2>
          <p className="muted" style={{ maxWidth: 720 }}>
            Pull repositories from GitHub, keep them in the local catalog, and map them to internal services so later webhook events
            can land in the right activity feeds.
          </p>
        </div>
        <GithubRepoManagement
          workspaceId={snapshot.workspace.id}
          services={snapshot.services}
          repositories={repositories}
          canImport={hasGithubAccess}
        />
      </section>
    </AppShell>
  );
}

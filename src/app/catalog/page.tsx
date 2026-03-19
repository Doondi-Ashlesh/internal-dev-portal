import { AppShell } from "@/components/app-shell";
import { ServiceManagement } from "@/components/admin/service-management";
import { ServiceCards } from "@/components/service-cards";
import { WorkspaceUnavailableState } from "@/components/workspace-unavailable-state";
import { canEditCatalog } from "@/lib/permissions";
import { getPageWorkspaceContext } from "@/server/access";
import { getWorkspaceSnapshot, WorkspaceDataUnavailableError } from "@/server/workspace";

export default async function CatalogPage() {
  const access = await getPageWorkspaceContext();
  const canManageCatalog = canEditCatalog(access.role);

  try {
    const snapshot = await getWorkspaceSnapshot();

    return (
      <AppShell workspaceName={snapshot.workspace.name} currentPath="/catalog">
        <section className="card card-pad hero">
          <div className="hero-split">
            <div className="stack-lg hero-copy" style={{ position: "relative", zIndex: 1 }}>
              <div>
                <div className="section-label">Catalog</div>
                <h1 className="page-title" style={{ fontSize: "2.5rem" }}>Service map</h1>
                <p className="muted" style={{ maxWidth: 720 }}>
                  The catalog is the center of the portal. Each service ties together ownership, environments, runbooks,
                  repository metadata, deploy links, and recent activity.
                </p>
              </div>
              <div className="row" style={{ justifyContent: "flex-start" }}>
                <span className="pill">{snapshot.services.length} services</span>
                <span className="pill">{snapshot.teams.length} teams</span>
                <span className="pill">Role-aware edits</span>
              </div>
            </div>
            <aside className="hero-sidebar">
              <article className="surface-panel stack">
                <div className="section-label">Catalog posture</div>
                <div className="stat-grid stat-grid-compact">
                  <div className="stat-panel">
                    <span className="tiny muted">Healthy</span>
                    <strong className="stat-value">{snapshot.metrics.healthy}</strong>
                    <span className="tiny muted">Services reporting green</span>
                  </div>
                  <div className="stat-panel">
                    <span className="tiny muted">Degraded</span>
                    <strong className="stat-value">{snapshot.metrics.degraded}</strong>
                    <span className="tiny muted">Services needing follow-up</span>
                  </div>
                </div>
              </article>
            </aside>
          </div>
        </section>

        <section className="card card-pad stack-lg">
          <div className="section-copy">
            <div className="section-label">Service Coverage</div>
            <h2 className="section-title" style={{ marginTop: 8 }}>Operational hotspots</h2>
            <p className="muted tiny" style={{ maxWidth: 620 }}>
              Each service card balances ownership, status, repositories, and environment coverage so teams can navigate the platform quickly.
            </p>
          </div>
          <ServiceCards services={snapshot.services} />
        </section>

        <section className="card card-pad stack-lg">
          <div className="section-copy">
            <div className="section-label">Catalog Admin</div>
            <h2 className="section-title" style={{ marginTop: 8 }}>Manage services</h2>
            <p className="muted tiny" style={{ maxWidth: 680 }}>
              Mutations are protected by workspace roles and recorded in the audit trail, so the product behaves like an
              actual internal platform instead of a loose demo CRUD screen.
            </p>
          </div>
          <ServiceManagement
            workspaceId={snapshot.workspace.id}
            teams={snapshot.teams}
            services={snapshot.services}
            canManage={canManageCatalog}
          />
        </section>
      </AppShell>
    );
  } catch (error) {
    if (error instanceof WorkspaceDataUnavailableError) {
      return <WorkspaceUnavailableState workspaceName={access.workspaceName} currentPath="/catalog" />;
    }

    throw error;
  }
}

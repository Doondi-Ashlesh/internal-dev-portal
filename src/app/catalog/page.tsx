import { AppShell } from "@/components/app-shell";
import { ServiceCards } from "@/components/service-cards";
import { ServiceManagement } from "@/components/admin/service-management";
import { getWorkspaceSnapshot } from "@/server/workspace";

export default async function CatalogPage() {
  const snapshot = await getWorkspaceSnapshot();

  return (
    <AppShell workspaceName={snapshot.workspace.name} currentPath="/catalog">
      <section className="card card-pad stack-lg">
        <div className="row">
          <div>
            <div className="section-label">Catalog</div>
            <h1 className="page-title" style={{ fontSize: "2.5rem" }}>Service map</h1>
            <p className="muted" style={{ maxWidth: 720 }}>
              The catalog is the center of the portal. Each service can connect ownership, environments, runbooks,
              repository metadata, deploy links, and recent activity.
            </p>
          </div>
          <span className="pill">{snapshot.services.length} services</span>
        </div>
        <ServiceCards services={snapshot.services} />
      </section>

      <section className="card card-pad stack-lg">
        <div>
          <div className="section-label">Catalog Admin</div>
          <h2 className="section-title" style={{ marginTop: 8 }}>Manage services</h2>
        </div>
        <ServiceManagement workspaceId={snapshot.workspace.id} teams={snapshot.teams} services={snapshot.services} />
      </section>
    </AppShell>
  );
}

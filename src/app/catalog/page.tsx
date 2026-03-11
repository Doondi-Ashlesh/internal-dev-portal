import { AppShell } from "@/components/app-shell";
import { ServiceManagement } from "@/components/admin/service-management";
import { ServiceCards } from "@/components/service-cards";
import { canEditCatalog } from "@/lib/permissions";
import { getPageWorkspaceContext } from "@/server/access";
import { getWorkspaceSnapshot } from "@/server/workspace";

export default async function CatalogPage() {
  const access = await getPageWorkspaceContext();
  const snapshot = await getWorkspaceSnapshot();
  const canManageCatalog = canEditCatalog(access.role);

  return (
    <AppShell workspaceName={snapshot.workspace.name} currentPath="/catalog">
      <section className="card card-pad stack-lg">
        <div className="row">
          <div>
            <div className="section-label">Catalog</div>
            <h1 className="page-title" style={{ fontSize: "2.5rem" }}>Service map</h1>
            <p className="muted" style={{ maxWidth: 720 }}>
              The catalog is the center of the portal. Each service ties together ownership, environments, runbooks,
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
}
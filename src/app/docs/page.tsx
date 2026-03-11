import { AppShell } from "@/components/app-shell";
import { DocumentManagement } from "@/components/admin/document-management";
import { DocsList } from "@/components/docs-list";
import { canEditCatalog } from "@/lib/permissions";
import { getPageWorkspaceContext } from "@/server/access";
import { getWorkspaceSnapshot } from "@/server/workspace";

export default async function DocsPage() {
  const access = await getPageWorkspaceContext();
  const snapshot = await getWorkspaceSnapshot();
  const canManageDocs = canEditCatalog(access.role);

  return (
    <AppShell workspaceName={snapshot.workspace.name} currentPath="/docs">
      <section className="card card-pad stack-lg">
        <div>
          <div className="section-label">Knowledge Base</div>
          <h1 className="page-title" style={{ fontSize: "2.5rem" }}>Docs, runbooks, and announcements</h1>
          <p className="muted" style={{ maxWidth: 720 }}>
            Markdown content is already stored in the workspace, searchable from the backend, and tied into the same
            audit and activity flow as the service catalog.
          </p>
        </div>
        <DocsList documents={snapshot.documents} />
      </section>

      <section className="card card-pad stack-lg">
        <div>
          <div className="section-label">Knowledge Admin</div>
          <h2 className="section-title" style={{ marginTop: 8 }}>Manage documents</h2>
        </div>
        <DocumentManagement
          workspaceId={snapshot.workspace.id}
          services={snapshot.services}
          documents={snapshot.documents}
          canManage={canManageDocs}
        />
      </section>
    </AppShell>
  );
}
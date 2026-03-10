import { AppShell } from "@/components/app-shell";
import { DocsList } from "@/components/docs-list";
import { DocumentManagement } from "@/components/admin/document-management";
import { getWorkspaceSnapshot } from "@/server/workspace";

export default async function DocsPage() {
  const snapshot = await getWorkspaceSnapshot();

  return (
    <AppShell workspaceName={snapshot.workspace.name} currentPath="/docs">
      <section className="card card-pad stack-lg">
        <div>
          <div className="section-label">Knowledge Base</div>
          <h1 className="page-title" style={{ fontSize: "2.5rem" }}>Docs, runbooks, and announcements</h1>
          <p className="muted" style={{ maxWidth: 720 }}>
            Markdown-backed content will eventually be editable in the product, linkable to services,
            and searchable from the unified command surface.
          </p>
        </div>
        <DocsList documents={snapshot.documents} />
      </section>

      <section className="card card-pad stack-lg">
        <div>
          <div className="section-label">Knowledge Admin</div>
          <h2 className="section-title" style={{ marginTop: 8 }}>Manage documents</h2>
        </div>
        <DocumentManagement workspaceId={snapshot.workspace.id} services={snapshot.services} documents={snapshot.documents} />
      </section>
    </AppShell>
  );
}

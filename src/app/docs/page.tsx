import { AppShell } from "@/components/app-shell";
import { DocumentManagement } from "@/components/admin/document-management";
import { DocsList } from "@/components/docs-list";
import { WorkspaceUnavailableState } from "@/components/workspace-unavailable-state";
import { canEditCatalog } from "@/lib/permissions";
import { getPageWorkspaceContext } from "@/server/access";
import { getWorkspaceSnapshot, WorkspaceDataUnavailableError } from "@/server/workspace";

export default async function DocsPage() {
  const access = await getPageWorkspaceContext();
  const canManageDocs = canEditCatalog(access.role);

  try {
    const snapshot = await getWorkspaceSnapshot();
    const runbookCount = snapshot.documents.filter((document) => document.type === "runbook").length;
    const announcementCount = snapshot.documents.filter((document) => document.type === "announcement").length;

    return (
      <AppShell workspaceName={snapshot.workspace.name} currentPath="/docs">
        <section className="card card-pad hero">
          <div className="hero-split">
            <div className="stack-lg hero-copy" style={{ position: "relative", zIndex: 1 }}>
              <div>
                <div className="section-label">Knowledge Base</div>
                <h1 className="page-title" style={{ fontSize: "2.5rem" }}>Docs, runbooks, and announcements</h1>
                <p className="muted" style={{ maxWidth: 720 }}>
                  Markdown content is already stored in the workspace, searchable from the backend, and tied into the same
                  audit and activity flow as the service catalog.
                </p>
              </div>
              <div className="row" style={{ justifyContent: "flex-start" }}>
                <span className="pill">{snapshot.documents.length} documents</span>
                <span className="pill">{runbookCount} runbooks</span>
                <span className="pill">{announcementCount} announcements</span>
              </div>
            </div>
            <aside className="hero-sidebar">
              <article className="surface-panel stack">
                <div className="section-label">Knowledge posture</div>
                <div className="compact-list">
                  <div className="compact-item">
                    <strong>Searchable by default</strong>
                    <span className="tiny muted">Docs participate in the global search and workspace activity model.</span>
                  </div>
                  <div className="compact-item">
                    <strong>Service-linked when needed</strong>
                    <span className="tiny muted">Runbooks can stay attached to individual services for faster response.</span>
                  </div>
                </div>
              </article>
            </aside>
          </div>
        </section>

        <section className="card card-pad stack-lg">
          <div className="section-copy">
            <div className="section-label">Recent Content</div>
            <h2 className="section-title" style={{ marginTop: 8 }}>Fresh updates</h2>
          </div>
          <DocsList documents={snapshot.documents} />
        </section>

        <section className="card card-pad stack-lg">
          <div className="section-copy">
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
  } catch (error) {
    if (error instanceof WorkspaceDataUnavailableError) {
      return <WorkspaceUnavailableState workspaceName={access.workspaceName} currentPath="/docs" />;
    }

    throw error;
  }
}

import { AppShell } from "@/components/app-shell";

export function WorkspaceUnavailableState({
  workspaceName,
  currentPath
}: {
  workspaceName: string;
  currentPath: string;
}) {
  return (
    <AppShell workspaceName={workspaceName} currentPath={currentPath}>
      <section className="card card-pad hero">
        <div className="stack-lg">
          <div>
            <div className="section-label">Workspace unavailable</div>
            <h1 className="page-title" style={{ fontSize: "2.5rem" }}>Live workspace data is temporarily unavailable</h1>
            <p className="muted" style={{ maxWidth: 760 }}>
              This page could not load the current workspace data from the server, so the portal is not showing placeholder content.
            </p>
          </div>
          <article className="empty-state stack">
            <strong>Check the workspace data source</strong>
            <span className="muted tiny">
              Verify database connectivity, workspace membership data, and supporting services, then refresh the page.
            </span>
          </article>
        </div>
      </section>
    </AppShell>
  );
}

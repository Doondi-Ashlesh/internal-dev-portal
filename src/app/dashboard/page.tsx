import { ActivityFeed } from "@/components/activity-feed";
import { DocsList } from "@/components/docs-list";
import { MetricsGrid } from "@/components/metrics-grid";
import { ServiceCards } from "@/components/service-cards";
import { AppShell } from "@/components/app-shell";
import { WorkspaceUnavailableState } from "@/components/workspace-unavailable-state";
import { WorkspaceOverview } from "@/components/workspace-overview";
import { getPageWorkspaceContext } from "@/server/access";
import { getWorkspaceSnapshot, WorkspaceDataUnavailableError } from "@/server/workspace";

export default async function DashboardPage() {
  const access = await getPageWorkspaceContext();

  try {
    const snapshot = await getWorkspaceSnapshot();

    return (
      <AppShell workspaceName={snapshot.workspace.name} currentPath="/dashboard">
        <WorkspaceOverview workspace={snapshot.workspace} metrics={snapshot.metrics} />
        <MetricsGrid metrics={snapshot.metrics} />
        <section className="panel-grid">
          <div className="card card-pad stack-lg">
            <div className="section-copy">
              <div className="section-label">Services</div>
              <h2 className="section-title" style={{ marginTop: 8 }}>Operational hotspots</h2>
              <p className="muted tiny" style={{ maxWidth: 560 }}>
                Ownership, tier, health, and repo context for each system your team runs.
              </p>
            </div>
            <ServiceCards services={snapshot.services} />
          </div>
          <div className="card card-pad stack-lg">
            <div className="section-copy">
              <div className="section-label">Documentation</div>
              <h2 className="section-title" style={{ marginTop: 8 }}>Recent updates</h2>
              <p className="muted tiny" style={{ maxWidth: 520 }}>
                Latest runbooks and docs linked to your services.
              </p>
            </div>
            <DocsList documents={snapshot.documents} />
          </div>
        </section>
        <div className="card card-pad">
          <ActivityFeed activity={snapshot.activity} />
        </div>
      </AppShell>
    );
  } catch (error) {
    if (error instanceof WorkspaceDataUnavailableError) {
      return <WorkspaceUnavailableState workspaceName={access.workspaceName} currentPath="/dashboard" />;
    }

    throw error;
  }
}

import { ActivityFeed } from "@/components/activity-feed";
import { DocsList } from "@/components/docs-list";
import { MetricsGrid } from "@/components/metrics-grid";
import { ServiceCards } from "@/components/service-cards";
import { AppShell } from "@/components/app-shell";
import { WorkspaceOverview } from "@/components/workspace-overview";
import { getPageWorkspaceContext } from "@/server/access";
import { getWorkspaceSnapshot } from "@/server/workspace";

export default async function DashboardPage() {
  await getPageWorkspaceContext();
  const snapshot = await getWorkspaceSnapshot();

  return (
    <AppShell workspaceName={snapshot.workspace.name} currentPath="/dashboard">
      <WorkspaceOverview workspace={snapshot.workspace} />
      <MetricsGrid metrics={snapshot.metrics} />
      <section className="panel-grid">
        <div className="card card-pad stack-lg">
          <div>
            <div className="section-label">Priority Services</div>
            <h2 className="section-title" style={{ marginTop: 8 }}>Operational hotspots</h2>
          </div>
          <ServiceCards services={snapshot.services} />
        </div>
        <div className="card card-pad stack-lg">
          <div>
            <div className="section-label">Docs & Runbooks</div>
            <h2 className="section-title" style={{ marginTop: 8 }}>Fresh updates</h2>
          </div>
          <DocsList documents={snapshot.documents} />
        </div>
      </section>
      <div className="card card-pad"><ActivityFeed activity={snapshot.activity} /></div>
    </AppShell>
  );
}
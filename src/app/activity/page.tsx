import { ActivityFeed } from "@/components/activity-feed";
import { AppShell } from "@/components/app-shell";
import { getPageWorkspaceContext } from "@/server/access";
import { getWorkspaceSnapshot } from "@/server/workspace";

export default async function ActivityPage() {
  await getPageWorkspaceContext();
  const snapshot = await getWorkspaceSnapshot();

  return (
    <AppShell workspaceName={snapshot.workspace.name} currentPath="/activity">
      <section className="card card-pad stack-lg">
        <div>
          <div className="section-label">Activity</div>
          <h1 className="page-title" style={{ fontSize: "2.5rem" }}>Engineering changelog</h1>
          <p className="muted" style={{ maxWidth: 720 }}>
            This feed is designed to absorb GitHub pushes, deploy completions, workflow failures,
            runbook edits, and manual team announcements into one operational timeline.
          </p>
        </div>
        <ActivityFeed activity={snapshot.activity} />
      </section>
    </AppShell>
  );
}
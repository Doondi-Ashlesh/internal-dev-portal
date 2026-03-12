import { ActivityFeed } from "@/components/activity-feed";
import { AppShell } from "@/components/app-shell";
import { getPageWorkspaceContext } from "@/server/access";
import { getWorkspaceSnapshot } from "@/server/workspace";

export default async function ActivityPage() {
  await getPageWorkspaceContext();
  const snapshot = await getWorkspaceSnapshot();
  const githubEvents = snapshot.activity.filter((item) => item.source === "github").length;

  return (
    <AppShell workspaceName={snapshot.workspace.name} currentPath="/activity">
      <section className="card card-pad hero">
        <div className="hero-split">
          <div className="stack-lg hero-copy" style={{ position: "relative", zIndex: 1 }}>
            <div>
              <div className="section-label">Activity</div>
              <h1 className="page-title" style={{ fontSize: "2.5rem" }}>Engineering changelog</h1>
              <p className="muted" style={{ maxWidth: 720 }}>
                This feed is designed to absorb GitHub pushes, deploy completions, workflow failures,
                runbook edits, and manual team announcements into one operational timeline.
              </p>
            </div>
            <div className="row" style={{ justifyContent: "flex-start" }}>
              <span className="pill">{snapshot.activity.length} recent events</span>
              <span className="pill">{githubEvents} GitHub sourced</span>
            </div>
          </div>
          <aside className="hero-sidebar">
            <article className="surface-panel stack">
              <div className="section-label">Feed behavior</div>
              <div className="compact-list">
                <div className="compact-item">
                  <strong>Normalized events</strong>
                  <span className="tiny muted">Webhook, system, and manual updates share one timeline model.</span>
                </div>
                <div className="compact-item">
                  <strong>Service-aware routing</strong>
                  <span className="tiny muted">Mapped repositories push context into the right service feeds.</span>
                </div>
              </div>
            </article>
          </aside>
        </div>
      </section>

      <section className="card card-pad stack-lg">
        <ActivityFeed activity={snapshot.activity} />
      </section>
    </AppShell>
  );
}
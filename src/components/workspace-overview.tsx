import Link from "next/link";
import { ArrowRight, Layers3 } from "lucide-react";

import { DashboardMetrics, WorkspaceSummary } from "@/lib/types";

export function WorkspaceOverview({
  workspace,
  metrics
}: {
  workspace: WorkspaceSummary;
  metrics: DashboardMetrics;
}) {
  const signalCards = [
    {
      label: "Services healthy",
      value: `${metrics.healthy}/${metrics.services}`,
      detail: "Health signals in catalog"
    },
    {
      label: "Docs",
      value: String(metrics.docs),
      detail: "Runbooks & references"
    },
    {
      label: "Members",
      value: String(workspace.memberCount),
      detail: "Workspace access"
    }
  ];

  return (
    <section className="card card-pad hero">
      <div className="hero-split">
        <div className="stack-lg hero-copy" style={{ position: "relative", zIndex: 1 }}>
          <div className="row" style={{ justifyContent: "flex-start" }}>
            <span className="pill">{workspace.memberCount} members</span>
            <span className="pill">{metrics.services} services</span>
          </div>
          <div>
            <div className="eyebrow">Overview</div>
            <h1 className="page-title">Your internal developer platform</h1>
            <p className="muted" style={{ maxWidth: 640, margin: "0 auto 0 0" }}>
              Live service catalog, ownership, documentation, and GitHub-backed activity—what most teams need before heavier
              platform tooling.
            </p>
          </div>
          <div className="row" style={{ justifyContent: "flex-start", alignItems: "center" }}>
            <Link href="/catalog" className="button-link">
              Open catalog
              <ArrowRight size={16} />
            </Link>
            <Link href="/admin/integrations" className="button-link secondary">
              GitHub &amp; webhooks
            </Link>
          </div>
        </div>

        <aside className="hero-sidebar" aria-label="Workspace snapshot">
          <article className="surface-panel stack">
            <div className="section-label">Snapshot</div>
            <div className="stat-grid stat-grid-compact">
              {signalCards.map((card) => (
                <div key={card.label} className="stat-panel">
                  <span className="tiny muted">{card.label}</span>
                  <strong className="stat-value">{card.value}</strong>
                  <span className="tiny muted">{card.detail}</span>
                </div>
              ))}
            </div>
            <p className="muted tiny" style={{ margin: "4px 0 0", display: "flex", alignItems: "center", gap: 8 }}>
              <Layers3 size={14} aria-hidden />
              <span>
                Press <strong>Ctrl K</strong> for global search.
              </span>
            </p>
          </article>
        </aside>
      </div>
    </section>
  );
}
import Link from "next/link";
import { ArrowRight, GitBranch, ShieldCheck, Siren, Sparkles } from "lucide-react";

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
      label: "Healthy coverage",
      value: `${metrics.healthy}/${metrics.services}`,
      detail: "Services reporting healthy status"
    },
    {
      label: "Docs indexed",
      value: String(metrics.docs),
      detail: "Runbooks, docs, and announcements"
    },
    {
      label: "Workspace members",
      value: String(workspace.memberCount),
      detail: "People operating from one home"
    }
  ];

  return (
    <section className="card card-pad hero">
      <div className="hero-split">
        <div className="stack-lg hero-copy" style={{ position: "relative", zIndex: 1 }}>
          <div className="row" style={{ justifyContent: "flex-start" }}>
            <span className="pill">{workspace.memberCount} members</span>
            <span className="pill">GitHub sync ready</span>
            <span className="pill">Role-based access</span>
          </div>
          <div>
            <div className="eyebrow">Engineering Home</div>
            <h1 className="page-title">One place for service ownership, deploy links, docs, and what changed.</h1>
            <p className="muted" style={{ maxWidth: 760, margin: "0 auto 0 0" }}>
              This starter focuses on the core portal loop: catalog services, surface operational context, sync with GitHub,
              and make docs plus activity easy to search.
            </p>
          </div>
          <div className="row" style={{ justifyContent: "flex-start" }}>
            <Link href="/catalog" className="button-link">
              Explore catalog
              <ArrowRight size={16} />
            </Link>
            <Link href="/admin/integrations" className="button-link secondary">Connect GitHub</Link>
          </div>
          <div className="row" style={{ justifyContent: "flex-start" }}>
            <span className="badge" data-tone="success"><ShieldCheck size={14} />Centralized access</span>
            <span className="badge"><GitBranch size={14} />Webhook-driven feed</span>
            <span className="badge" data-tone="warning"><Siren size={14} />Runbook-ready incident context</span>
          </div>
        </div>

        <aside className="hero-sidebar" aria-label="Workspace posture">
          <article className="surface-panel stack">
            <div className="row" style={{ alignItems: "flex-start" }}>
              <div>
                <div className="section-label">Portal posture</div>
                <strong className="surface-title">Operational coverage</strong>
              </div>
              <span className="badge"><Sparkles size={14} />Live</span>
            </div>
            <div className="stat-grid stat-grid-compact">
              {signalCards.map((card) => (
                <div key={card.label} className="stat-panel">
                  <span className="tiny muted">{card.label}</span>
                  <strong className="stat-value">{card.value}</strong>
                  <span className="tiny muted">{card.detail}</span>
                </div>
              ))}
            </div>
          </article>

          <article className="surface-panel stack">
            <div className="section-label">Operating pulse</div>
            <div className="compact-list">
              <div className="compact-item">
                <strong>Catalog backbone</strong>
                <span className="tiny muted">Services, docs, ownership, and activity tied together.</span>
              </div>
              <div className="compact-item">
                <strong>Integration ready</strong>
                <span className="tiny muted">GitHub auth, repo import, and webhook ingestion are active foundations.</span>
              </div>
              <div className="compact-item">
                <strong>Search-first workflow</strong>
                <span className="tiny muted">Command palette and service detail flows are ready for daily use.</span>
              </div>
            </div>
          </article>
        </aside>
      </div>
    </section>
  );
}
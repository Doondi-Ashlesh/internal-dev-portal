import Link from "next/link";
import { ArrowRight, BookOpenText, Layers3, ShieldCheck } from "lucide-react";

export default function HomePage() {
  return (
    <main className="shell marketing-shell">
      <div className="container">
        <section className="card card-pad hero landing-hero">
          <div className="hero-grid">
            <div className="stack-lg" style={{ position: "relative", zIndex: 1 }}>
              <div className="row" style={{ justifyContent: "flex-start" }}>
                <span className="pill pill-strong">Backstage-lite for startups</span>
                <span className="pill">PostgreSQL-backed</span>
              </div>
              <div>
                <div className="eyebrow">Internal Tooling SaaS</div>
                <h1 className="page-title">Bring service ownership, deploy links, docs, and engineering context into one portal.</h1>
                <p className="muted" style={{ maxWidth: 780 }}>
                  A developer portal for fast-moving teams that need a service catalog, runbooks, health widgets,
                  changelog visibility, and searchable internal docs without adopting heavyweight platform tooling.
                </p>
              </div>
              <div className="row" style={{ justifyContent: "flex-start" }}>
                <Link href="/dashboard" className="button-link">
                  Open product starter
                  <ArrowRight size={16} />
                </Link>
                <Link href="/login" className="button-link secondary">
                  GitHub sign in
                </Link>
              </div>
              <div className="stat-strip">
                <article className="stat-chip">
                  <div className="section-label">Catalog</div>
                  <strong>Services, owners, environments</strong>
                  <span className="muted tiny">Map operational context to real teams and repos.</span>
                </article>
                <article className="stat-chip">
                  <div className="section-label">Docs</div>
                  <strong>Runbooks close to the work</strong>
                  <span className="muted tiny">Keep markdown guidance attached to services and incidents.</span>
                </article>
                <article className="stat-chip">
                  <div className="section-label">Activity</div>
                  <strong>One engineering changelog</strong>
                  <span className="muted tiny">GitHub events, updates, and ops notes in one timeline.</span>
                </article>
              </div>
              <div className="panel-grid">
                <article className="info-card stack">
                  <Layers3 size={20} className="strong" />
                  <strong>Service catalog</strong>
                  <span className="muted tiny">Teams can track service owners, repos, environments, and operational links.</span>
                </article>
                <article className="info-card stack">
                  <BookOpenText size={20} className="strong" />
                  <strong>Markdown docs</strong>
                  <span className="muted tiny">Runbooks, API references, and announcements stay discoverable and close to the service.</span>
                </article>
              </div>
            </div>

            <div className="preview-stack">
              <article className="preview-card primary stack">
                <div className="row">
                  <span className="pill">Live surface</span>
                  <span className="badge" data-tone="warning">1 degraded</span>
                </div>
                <div>
                  <div className="section-label">Ops board</div>
                  <h2 className="section-title" style={{ marginTop: 10, color: "inherit" }}>Operational context at a glance</h2>
                </div>
                <ul className="preview-list">
                  <li className="preview-item">
                    <div>
                      <strong>Billing API</strong>
                      <div className="muted tiny">Primary owner: Anaya Patel</div>
                    </div>
                    <span className="pill">healthy</span>
                  </li>
                  <li className="preview-item">
                    <div>
                      <strong>Edge Gateway</strong>
                      <div className="muted tiny">Recent latency annotation linked to runbook</div>
                    </div>
                    <span className="badge" data-tone="warning">degraded</span>
                  </li>
                  <li className="preview-item">
                    <div>
                      <strong>Docs Web</strong>
                      <div className="muted tiny">Fresh publish and search index update</div>
                    </div>
                    <span className="pill">healthy</span>
                  </li>
                </ul>
              </article>

              <article className="preview-card accent stack">
                <div className="row">
                  <div>
                    <div className="section-label">Portal posture</div>
                    <h2 className="section-title" style={{ marginTop: 10 }}>Professional platform foundation</h2>
                  </div>
                  <ShieldCheck size={20} className="strong" />
                </div>
                <div className="preview-meta">
                  <span className="pill">GitHub auth</span>
                  <span className="pill">RBAC</span>
                  <span className="pill">Audit log</span>
                  <span className="pill">Webhook feed</span>
                </div>
                <ul className="preview-list">
                  <li className="preview-item">
                    <strong>Repository import</strong>
                    <span className="muted tiny">Many-to-many repo links</span>
                  </li>
                  <li className="preview-item">
                    <strong>Search</strong>
                    <span className="muted tiny">Command-style global palette</span>
                  </li>
                  <li className="preview-item">
                    <strong>Testing</strong>
                    <span className="muted tiny">Vitest plus Playwright smoke coverage</span>
                  </li>
                </ul>
              </article>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
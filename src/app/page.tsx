import Link from "next/link";
import { ArrowRight, BookOpenText, Layers3, ShieldCheck } from "lucide-react";

export default function HomePage() {
  return (
    <main className="shell">
      <div className="container" style={{ padding: "48px 0" }}>
        <section className="card card-pad hero">
          <div className="stack-lg" style={{ position: "relative", zIndex: 1 }}>
            <span className="pill">Backstage-lite for startups</span>
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
              <article className="info-card stack">
                <ShieldCheck size={20} className="strong" />
                <strong>Role-based access</strong>
                <span className="muted tiny">Workspace roles keep editing, member access, and integrations manageable.</span>
              </article>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

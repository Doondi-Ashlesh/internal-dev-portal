import { ActivityItem, DocumentSummary, ServiceSummary } from "@/lib/types";
import { notFound } from "next/navigation";

export function ServiceDetail({
  service,
  documents,
  activity
}: {
  service: ServiceSummary | null;
  documents: DocumentSummary[];
  activity: ActivityItem[];
}) {
  if (!service) {
    notFound();
  }

  const primaryRepo = service.repositories.find((repository) => repository.relationshipType === "primary") ?? service.repositories[0];

  return (
    <div className="stack-lg">
      <section className="card card-pad hero">
        <div className="stack-lg" style={{ position: "relative", zIndex: 1 }}>
          <div className="row" style={{ justifyContent: "flex-start" }}>
            <span className="pill">{service.team}</span>
            <span className="badge">{service.status}</span>
            <span className="pill">{service.lifecycle}</span>
          </div>
          <div>
            <div className="eyebrow">Service</div>
            <h1 className="page-title">{service.name}</h1>
            <p className="muted" style={{ maxWidth: 720, margin: 0 }}>{service.description}</p>
          </div>
          <div className="row" style={{ justifyContent: "flex-start" }}>
            {primaryRepo ? <a className="button-link" href={primaryRepo.url} target="_blank" rel="noreferrer">Open primary repository</a> : null}
            <a className="button-link secondary" href="/admin/integrations">Manage repository links</a>
          </div>
        </div>
      </section>

      <section className="detail-grid">
        <article className="card card-pad stack-lg">
          <div>
            <div className="section-label">Ownership & Context</div>
            <h2 className="section-title" style={{ marginTop: 8 }}>Operating view</h2>
          </div>
          <ul className="meta-list">
            <li className="meta-item"><span className="muted">Primary owner</span><strong>{service.owner}</strong></li>
            <li className="meta-item"><span className="muted">Primary repo</span><strong>{service.repo}</strong></li>
            <li className="meta-item"><span className="muted">Tier</span><strong>{service.tier}</strong></li>
            <li className="meta-item"><span className="muted">Environments</span><strong>{service.environments.join(", ")}</strong></li>
          </ul>

          <div className="stack">
            <div className="section-label">Linked Repositories</div>
            {service.repositories.length ? service.repositories.map((repository) => (
              <div key={`${repository.repositoryId}-${repository.relationshipType}`} className="info-card stack">
                <div className="row"><strong>{repository.fullName}</strong><span className="pill">{repository.relationshipType}</span></div>
                <a href={repository.url} target="_blank" rel="noreferrer" className="muted tiny">{repository.url}</a>
              </div>
            )) : <div className="muted tiny">No repositories linked yet.</div>}
          </div>

          <div className="stack">
            <div className="section-label">Tags</div>
            <div className="row" style={{ justifyContent: "flex-start" }}>
              {service.tags.map((tag) => <span className="pill" key={tag}>{tag}</span>)}
            </div>
          </div>

          <div className="markdown">
            <div className="section-label">Runbook Preview</div>
            <p>Use this space for rollback instructions, dashboards, escalation policy, and common issue handling.</p>
            <pre>{`# First response\n- Confirm current deploy and recent changes\n- Check service health widget and linked dashboards\n- Review error rate, latency, and queue depth\n- If customer impact is confirmed, post internal announcement`}</pre>
          </div>
        </article>

        <article className="stack-lg">
          <div className="card card-pad stack">
            <div className="section-label">Linked Docs</div>
            {documents.length ? documents.map((doc) => (
              <div key={doc.id} className="info-card stack">
                <strong>{doc.title}</strong>
                <span className="tiny muted">{doc.excerpt}</span>
              </div>
            )) : <div className="muted tiny">No service docs attached yet.</div>}
          </div>

          <div className="card card-pad stack">
            <div className="section-label">Recent Activity</div>
            {activity.length ? activity.map((item) => (
              <div key={item.id} className="info-card stack">
                <div className="row"><strong>{item.title}</strong><span className="tiny muted">{item.occurredAt}</span></div>
                <span className="tiny muted">{item.body}</span>
              </div>
            )) : <div className="muted tiny">No activity yet.</div>}
          </div>
        </article>
      </section>
    </div>
  );
}

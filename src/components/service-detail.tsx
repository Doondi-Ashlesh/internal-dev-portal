import { ActivitySquare, BookOpenText, HeartPulse, Layers3, ShieldCheck } from "lucide-react";
import { notFound } from "next/navigation";

import { ActivityItem, DocumentSummary, ServiceSummary } from "@/lib/types";

const toneByStatus = {
  healthy: "success",
  degraded: "warning",
  down: "danger",
  unknown: undefined
} as const;

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
  const runbook = documents.find((document) => document.type === "runbook");

  return (
    <div className="stack-lg">
      <section className="card card-pad hero">
        <div className="hero-split">
          <div className="stack-lg hero-copy" style={{ position: "relative", zIndex: 1 }}>
            <div className="row" style={{ justifyContent: "flex-start" }}>
              <span className="pill">{service.team}</span>
              <span className="badge" data-tone={toneByStatus[service.status]}>{service.status}</span>
              <span className="pill">{service.lifecycle}</span>
              <span className="pill">{service.tier} tier</span>
            </div>
            <div>
              <div className="eyebrow">Service</div>
              <h1 className="page-title">{service.name}</h1>
              <p className="muted" style={{ maxWidth: 720, margin: 0 }}>{service.description}</p>
            </div>
            <div className="row" style={{ justifyContent: "flex-start" }}>
              {primaryRepo ? (
                <a className="button-link" href={primaryRepo.url} target="_blank" rel="noreferrer">
                  Open primary repository
                </a>
              ) : null}
              <a className="button-link secondary" href="/admin/integrations">Manage repository links</a>
            </div>
            <div className="row" style={{ justifyContent: "flex-start" }}>
              {service.tags.map((tag) => <span className="badge" key={tag}>{tag}</span>)}
            </div>
          </div>

          <aside className="hero-sidebar" aria-label="Service posture">
            <article className="surface-panel stack">
              <div className="section-label">Service posture</div>
              <div className="stat-grid stat-grid-compact">
                <div className="stat-panel">
                  <span className="tiny muted">Repositories</span>
                  <strong className="stat-value">{service.repositories.length}</strong>
                  <span className="tiny muted">Linked sources of truth</span>
                </div>
                <div className="stat-panel">
                  <span className="tiny muted">Environments</span>
                  <strong className="stat-value">{service.environments.length}</strong>
                  <span className="tiny muted">Mapped deploy surfaces</span>
                </div>
                <div className="stat-panel">
                  <span className="tiny muted">Attached docs</span>
                  <strong className="stat-value">{documents.length}</strong>
                  <span className="tiny muted">Runbooks and guides</span>
                </div>
                <div className="stat-panel">
                  <span className="tiny muted">Recent activity</span>
                  <strong className="stat-value">{activity.length}</strong>
                  <span className="tiny muted">Operational timeline items</span>
                </div>
              </div>
            </article>

            <article className="surface-panel stack">
              <div className="section-label">Last signal</div>
              <div className="compact-list">
                <div className="compact-item">
                  <strong>{service.lastChange}</strong>
                  <span className="tiny muted">Latest known operational change tied to this service.</span>
                </div>
                <div className="compact-item">
                  <strong>{runbook ? runbook.title : "Runbook placeholder ready"}</strong>
                  <span className="tiny muted">Use the attached runbook area for rollback, escalation, and diagnostics.</span>
                </div>
              </div>
            </article>
          </aside>
        </div>
      </section>

      <section className="detail-grid">
        <article className="card card-pad stack-lg">
          <div className="section-copy">
            <div className="section-label">Ownership & Context</div>
            <h2 className="section-title" style={{ marginTop: 8 }}>Operating view</h2>
            <p className="muted tiny" style={{ maxWidth: 640 }}>
              This section is designed to answer the first-response questions quickly: who owns the service, what repo is authoritative, how critical it is, and which environments need attention.
            </p>
          </div>

          <div className="meta-board">
            <div className="meta-panel meta-panel-strong">
              <span className="tiny muted">Primary owner</span>
              <strong>{service.owner}</strong>
              <span className="tiny muted">Accountable operator</span>
            </div>
            <div className="meta-panel">
              <span className="tiny muted">Primary repo</span>
              <strong>{service.repo}</strong>
              <span className="tiny muted">Source-linked service definition</span>
            </div>
            <div className="meta-panel">
              <span className="tiny muted">Tier</span>
              <strong>{service.tier}</strong>
              <span className="tiny muted">Business criticality</span>
            </div>
            <div className="meta-panel">
              <span className="tiny muted">Environments</span>
              <strong>{service.environments.join(", ") || "Not mapped"}</strong>
              <span className="tiny muted">Deployment surfaces tracked in portal</span>
            </div>
          </div>

          <div className="stack-lg">
            <div className="section-copy">
              <div className="section-label">Linked Repositories</div>
              <p className="muted tiny" style={{ maxWidth: 620 }}>
                Multiple repositories can now support one service so monorepos, infra repos, docs repos, and workers can all be represented cleanly.
              </p>
            </div>
            {service.repositories.length ? (
              <div className="stack">
                {service.repositories.map((repository) => (
                  <div key={`${repository.repositoryId}-${repository.relationshipType}`} className="info-card stack">
                    <div className="row">
                      <div>
                        <strong>{repository.fullName}</strong>
                        <div className="tiny muted" style={{ marginTop: 6 }}>{repository.relationshipType}</div>
                      </div>
                      <span className="pill">{repository.relationshipType}</span>
                    </div>
                    <a href={repository.url} target="_blank" rel="noreferrer" className="muted tiny">{repository.url}</a>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state stack">
                <strong>No repositories linked yet</strong>
                <span className="muted tiny">Link a repository from the integrations area to start routing activity and ownership context.</span>
              </div>
            )}
          </div>

          <div className="stack-lg">
            <div className="section-copy">
              <div className="section-label">Runbook Preview</div>
              <p className="muted tiny" style={{ maxWidth: 620 }}>
                Keep the first ten minutes of incident response close to the service itself so operators can stabilize before context-switching.
              </p>
            </div>
            <div className="markdown">
              <div className="markdown-callout">
                <span className="badge" data-tone="success"><ShieldCheck size={14} /> First response</span>
                <span className="tiny muted">Use this block for rollback steps, dashboards, escalation policy, and customer-impact checkpoints.</span>
              </div>
              <pre>{`# First response\n- Confirm current deploy and recent changes\n- Check service health widget and linked dashboards\n- Review error rate, latency, and queue depth\n- If customer impact is confirmed, post internal announcement`}</pre>
            </div>
          </div>
        </article>

        <article className="stack-lg">
          <div className="card card-pad stack-lg">
            <div className="section-copy">
              <div className="section-label">Service Signals</div>
              <h2 className="section-title" style={{ marginTop: 8 }}>At-a-glance context</h2>
            </div>
            <div className="compact-list">
              <div className="compact-item compact-item-icon">
                <span className="badge" data-tone={toneByStatus[service.status]}><HeartPulse size={14} /></span>
                <div>
                  <strong>Health posture</strong>
                  <div className="tiny muted">Current state: {service.status}</div>
                </div>
              </div>
              <div className="compact-item compact-item-icon">
                <span className="badge"><Layers3 size={14} /></span>
                <div>
                  <strong>Environment coverage</strong>
                  <div className="tiny muted">{service.environments.join(", ") || "No environments mapped yet"}</div>
                </div>
              </div>
              <div className="compact-item compact-item-icon">
                <span className="badge"><BookOpenText size={14} /></span>
                <div>
                  <strong>Knowledge base</strong>
                  <div className="tiny muted">{documents.length} linked docs available for this service.</div>
                </div>
              </div>
              <div className="compact-item compact-item-icon">
                <span className="badge"><ActivitySquare size={14} /></span>
                <div>
                  <strong>Change activity</strong>
                  <div className="tiny muted">{activity.length} recent timeline entries associated with this service.</div>
                </div>
              </div>
            </div>
          </div>

          <div className="card card-pad stack-lg">
            <div className="section-copy">
              <div className="section-label">Linked Docs</div>
              <h2 className="section-title" style={{ marginTop: 8 }}>Reference material</h2>
            </div>
            {documents.length ? (
              <div className="stack">
                {documents.map((doc) => (
                  <div key={doc.id} className="info-card stack">
                    <div className="row">
                      <strong>{doc.title}</strong>
                      <span className="pill">{doc.type}</span>
                    </div>
                    <span className="tiny muted">{doc.excerpt}</span>
                    <span className="tiny strong">Updated {doc.updatedAt}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state stack">
                <strong>No service docs attached yet</strong>
                <span className="muted tiny">Attach docs or runbooks to this service to make incident handling and ownership clearer.</span>
              </div>
            )}
          </div>

          <div className="card card-pad stack-lg">
            <div className="section-copy">
              <div className="section-label">Recent Activity</div>
              <h2 className="section-title" style={{ marginTop: 8 }}>Service timeline</h2>
            </div>
            {activity.length ? (
              <ul className="timeline">
                {activity.map((item) => (
                  <li key={item.id} className="timeline-item stack">
                    <div className="row">
                      <strong>{item.title}</strong>
                      <span className="tiny muted">{item.occurredAt}</span>
                    </div>
                    <span className="tiny muted">{item.body}</span>
                    <span className="badge">{item.source}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="empty-state stack">
                <strong>No activity yet</strong>
                <span className="muted tiny">GitHub and manual events tied to this service will appear here as activity lands.</span>
              </div>
            )}
          </div>
        </article>
      </section>
    </div>
  );
}
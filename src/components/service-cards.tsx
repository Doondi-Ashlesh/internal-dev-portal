import Link from "next/link";
import { ArrowUpRight, HeartPulse, Layers3 } from "lucide-react";

import { ServiceSummary } from "@/lib/types";

const toneByStatus = {
  healthy: "success",
  degraded: "warning",
  down: "danger",
  unknown: undefined
} as const;

export function ServiceCards({ services }: { services: ServiceSummary[] }) {
  return (
    <section className="service-grid">
      {services.map((service) => (
        <article className="service-card stack" key={service.id}>
          <div className="service-header">
            <div className="stack">
              <div className="row" style={{ justifyContent: "flex-start" }}>
                <span className="badge" data-tone={toneByStatus[service.status]}>
                  <HeartPulse size={14} />
                  {service.status}
                </span>
                <span className="pill">{service.tier}</span>
                {service.repositories.length > 1 ? <span className="pill">{service.repositories.length} repos</span> : null}
              </div>
              <div>
                <h3 className="service-name">{service.name}</h3>
                <p className="muted" style={{ margin: 0 }}>
                  {service.description}
                </p>
              </div>
            </div>
            <Link href={`/services/${service.slug}`} className="button-link secondary">
              Open
              <ArrowUpRight size={16} />
            </Link>
          </div>

          <div className="meta-board">
            <div className="meta-panel">
              <span className="tiny muted">Owner</span>
              <strong>{service.owner}</strong>
            </div>
            <div className="meta-panel">
              <span className="tiny muted">Team</span>
              <strong>{service.team}</strong>
            </div>
            <div className="meta-panel">
              <span className="tiny muted">Primary repo</span>
              <strong>{service.repo}</strong>
            </div>
            <div className="meta-panel">
              <span className="tiny muted">Environments</span>
              <strong>{service.environments.length}</strong>
            </div>
          </div>

          <div className="row" style={{ justifyContent: "flex-start" }}>
            {service.tags.map((tag) => <span key={tag} className="pill">{tag}</span>)}
          </div>

          <div className="service-footer">
            <span className="tiny muted">Lifecycle: {service.lifecycle}</span>
            <span className="tiny strong"><Layers3 size={13} /> {service.lastChange}</span>
          </div>
        </article>
      ))}
    </section>
  );
}
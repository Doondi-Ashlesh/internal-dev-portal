import Link from "next/link";
import { ArrowUpRight, HeartPulse } from "lucide-react";

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
            <div>
              <div className="row" style={{ justifyContent: "flex-start" }}>
                <span className="badge" data-tone={toneByStatus[service.status]}>
                  <HeartPulse size={14} />
                  {service.status}
                </span>
                <span className="pill">{service.tier}</span>
                {service.repositories.length > 1 ? <span className="pill">{service.repositories.length} repos</span> : null}
              </div>
              <h3 className="service-name" style={{ marginTop: 14 }}>
                {service.name}
              </h3>
              <p className="muted" style={{ margin: 0 }}>
                {service.description}
              </p>
            </div>
            <Link href={`/services/${service.slug}`} className="button-link secondary">
              Open
              <ArrowUpRight size={16} />
            </Link>
          </div>

          <ul className="meta-list">
            <li className="meta-item"><span className="muted">Owner</span><strong>{service.owner}</strong></li>
            <li className="meta-item"><span className="muted">Team</span><strong>{service.team}</strong></li>
            <li className="meta-item"><span className="muted">Primary repo</span><strong>{service.repo}</strong></li>
          </ul>

          <div className="row" style={{ justifyContent: "flex-start" }}>
            {service.tags.map((tag) => <span key={tag} className="pill">{tag}</span>)}
          </div>

          <p className="tiny muted" style={{ margin: 0 }}>{service.lastChange}</p>
        </article>
      ))}
    </section>
  );
}

import { DashboardMetrics } from "@/lib/types";
import { Activity, BookOpen, HeartPulse, Layers3 } from "lucide-react";

export function MetricsGrid({ metrics }: { metrics: DashboardMetrics }) {
  const metricCards = [
    { label: "Services", value: metrics.services, note: "Tracked in the portal", icon: Layers3 },
    { label: "Healthy", value: metrics.healthy, note: "Current green services", icon: HeartPulse },
    { label: "Degraded", value: metrics.degraded, note: "Needs follow-up", icon: Activity },
    { label: "Docs", value: metrics.docs, note: "Runbooks and guides", icon: BookOpen }
  ];

  return (
    <section className="metric-grid">
      {metricCards.map((metric) => {
        const Icon = metric.icon;

        return (
          <article className="card metric" key={metric.label}>
            <div className="row">
              <span className="section-label">{metric.label}</span>
              <span className="badge"><Icon size={16} /></span>
            </div>
            <div className="metric-value">{metric.value}</div>
            <div className="muted tiny">{metric.note}</div>
          </article>
        );
      })}
    </section>
  );
}

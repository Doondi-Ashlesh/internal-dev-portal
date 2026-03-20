import { Activity, BookOpen, HeartPulse, Layers3 } from "lucide-react";

import { DashboardMetrics } from "@/lib/types";

export function MetricsGrid({ metrics }: { metrics: DashboardMetrics }) {
  const metricCards = [
    {
      label: "Catalog",
      value: metrics.services,
      note: "Registered services",
      emphasis: "In workspace",
      icon: Layers3,
      tone: undefined
    },
    {
      label: "Healthy",
      value: metrics.healthy,
      note: "Passing health checks",
      emphasis: "Stable",
      icon: HeartPulse,
      tone: "success" as const
    },
    {
      label: "Degraded",
      value: metrics.degraded,
      note: "Needs attention",
      emphasis: metrics.degraded > 0 ? "Review" : "None",
      icon: Activity,
      tone: metrics.degraded > 0 ? ("warning" as const) : undefined
    },
    {
      label: "Docs",
      value: metrics.docs,
      note: "Published docs",
      emphasis: "Runbooks & refs",
      icon: BookOpen,
      tone: undefined
    }
  ];

  return (
    <section className="metric-grid">
      {metricCards.map((metric) => {
        const Icon = metric.icon;

        return (
          <article className="card metric metric-shell" key={metric.label}>
            <div className="row">
              <span className="section-label">{metric.label}</span>
              <span className="badge" data-tone={metric.tone}><Icon size={16} /></span>
            </div>
            <div className="metric-value-row">
              <div className="metric-value">{metric.value}</div>
              <span className="metric-emphasis">{metric.emphasis}</span>
            </div>
            <div className="metric-footer">
              <span className="muted tiny">{metric.note}</span>
            </div>
          </article>
        );
      })}
    </section>
  );
}
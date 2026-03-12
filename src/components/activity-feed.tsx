import { ArrowUpRight, ActivitySquare } from "lucide-react";

import { ActivityItem } from "@/lib/types";

export function ActivityFeed({ activity }: { activity: ActivityItem[] }) {
  return (
    <section className="stack-lg">
      <div className="row">
        <div className="section-copy">
          <div className="section-label">Changelog Feed</div>
          <h2 className="section-title" style={{ marginTop: 8 }}>
            Recent engineering activity
          </h2>
          <p className="muted tiny" style={{ maxWidth: 620 }}>
            Normalized system, GitHub, CI, and manual events appear here in one timeline so operators can scan what changed without hopping tools.
          </p>
        </div>
        <span className="pill">{activity.length} recent events</span>
      </div>
      <ul className="timeline">
        {activity.map((item) => (
          <li key={item.id} className="timeline-item stack">
            <div className="row">
              <span className="pill">{item.source}</span>
              <span className="tiny muted">{item.occurredAt}</span>
            </div>
            <div className="stack" style={{ gap: 8 }}>
              <h3 className="service-name">{item.title}</h3>
              <p className="muted" style={{ margin: 0 }}>{item.body}</p>
            </div>
            <div className="activity-footer">
              {item.serviceSlug ? <span className="badge">{item.serviceSlug}</span> : <span className="pill">workspace event</span>}
              <span className="tiny strong"><ActivitySquare size={13} /> Feed normalized <ArrowUpRight size={13} /></span>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
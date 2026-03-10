import { ActivityItem } from "@/lib/types";

export function ActivityFeed({ activity }: { activity: ActivityItem[] }) {
  return (
    <section className="stack-lg">
      <div className="row">
        <div>
          <div className="section-label">Changelog Feed</div>
          <h2 className="section-title" style={{ marginTop: 8 }}>
            Recent engineering activity
          </h2>
        </div>
      </div>
      <ul className="timeline">
        {activity.map((item) => (
          <li key={item.id} className="timeline-item">
            <div className="row">
              <span className="pill">{item.source}</span>
              <span className="tiny muted">{item.occurredAt}</span>
            </div>
            <h3 className="service-name" style={{ marginTop: 12 }}>{item.title}</h3>
            <p className="muted" style={{ margin: "0 0 10px" }}>{item.body}</p>
            {item.serviceSlug ? <span className="badge">{item.serviceSlug}</span> : null}
          </li>
        ))}
      </ul>
    </section>
  );
}

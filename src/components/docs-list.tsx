import { ArrowUpRight } from "lucide-react";

import { DocumentSummary } from "@/lib/types";

export function DocsList({ documents }: { documents: DocumentSummary[] }) {
  return (
    <section className="doc-grid">
      {documents.map((document) => (
        <article key={document.id} id={`doc-${document.slug}`} className="doc-card stack" style={{ scrollMarginTop: 112 }}>
          <div className="row" style={{ justifyContent: "flex-start" }}>
            <span className="pill">{document.type}</span>
            <span className="tiny muted">Updated {document.updatedAt}</span>
          </div>
          <div className="stack" style={{ gap: 8 }}>
            <h3 className="service-name">{document.title}</h3>
            <p className="muted" style={{ margin: 0 }}>{document.excerpt}</p>
          </div>
          <div className="doc-footer">
            {document.serviceSlug ? <span className="badge">{document.serviceSlug}</span> : <span className="pill">workspace-wide</span>}
            <span className="tiny strong"><ArrowUpRight size={13} /> Knowledge ready</span>
          </div>
        </article>
      ))}
    </section>
  );
}
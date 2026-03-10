import { DocumentSummary } from "@/lib/types";

export function DocsList({ documents }: { documents: DocumentSummary[] }) {
  return (
    <section className="doc-grid">
      {documents.map((document) => (
        <article key={document.id} className="doc-card stack">
          <div className="row" style={{ justifyContent: "flex-start" }}>
            <span className="pill">{document.type}</span>
            <span className="tiny muted">{document.updatedAt}</span>
          </div>
          <h3 className="service-name">{document.title}</h3>
          <p className="muted" style={{ margin: 0 }}>{document.excerpt}</p>
          {document.serviceSlug ? <span className="badge">{document.serviceSlug}</span> : null}
        </article>
      ))}
    </section>
  );
}

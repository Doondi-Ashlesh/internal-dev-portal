import { DocumentSummary, ServiceSummary } from "@/lib/types";
import { createDocument, deleteDocument, updateDocument } from "@/server/actions";

export function DocumentManagement({
  workspaceId,
  services,
  documents,
  canManage
}: {
  workspaceId: string;
  services: ServiceSummary[];
  documents: DocumentSummary[];
  canManage: boolean;
}) {
  if (!canManage) {
    return (
      <article className="empty-state stack">
        <strong>Docs editing is restricted</strong>
        <span className="muted tiny">
          Your current role can read docs and runbooks, but only editors and above can publish or update them.
        </span>
      </article>
    );
  }

  return (
    <div className="stack-lg">
      <article className="info-card stack-lg admin-card">
        <div className="section-copy">
          <div className="section-label">Create document</div>
          <p className="muted tiny" style={{ maxWidth: 620 }}>
            Publish service-linked runbooks, workspace-wide docs, and internal announcements from the same editorial surface.
          </p>
        </div>
        <form action={createDocument} className="stack-lg">
          <input type="hidden" name="workspaceId" value={workspaceId} />
          <div className="form-grid form-grid-two">
            <label className="field-stack">
              <span className="field-label">Title</span>
              <input name="title" placeholder="Document title" required />
            </label>
            <label className="field-stack">
              <span className="field-label">Slug</span>
              <input name="slug" placeholder="document-slug" required />
            </label>
          </div>
          <div className="form-grid form-grid-two">
            <label className="field-stack">
              <span className="field-label">Type</span>
              <select name="type" defaultValue="doc">
                <option value="doc">doc</option>
                <option value="runbook">runbook</option>
                <option value="announcement">announcement</option>
              </select>
            </label>
            <label className="field-stack">
              <span className="field-label">Attached service</span>
              <select name="serviceId" defaultValue="">
                <option value="">Workspace-wide</option>
                {services.map((service) => <option key={service.id} value={service.id}>{service.name}</option>)}
              </select>
            </label>
          </div>
          <label className="field-stack">
            <span className="field-label">Markdown content</span>
            <textarea name="contentMarkdown" rows={8} placeholder="# Title" required />
          </label>
          <div className="row" style={{ justifyContent: "flex-start" }}>
            <button className="button-link" type="submit">Create document</button>
          </div>
        </form>
      </article>

      {documents.map((document) => (
        <article key={document.id} className="info-card stack-lg admin-card">
          <div className="row">
            <div>
              <strong>{document.title}</strong>
              <div className="tiny muted" style={{ marginTop: 6 }}>
                {document.serviceSlug ? `Attached to ${document.serviceSlug}` : "Workspace-wide knowledge item"}
              </div>
            </div>
            <span className="pill">{document.type}</span>
          </div>
          <form action={updateDocument} className="stack-lg">
            <input type="hidden" name="id" value={document.id} />
            <input type="hidden" name="workspaceId" value={workspaceId} />
            <div className="form-grid form-grid-two">
              <label className="field-stack">
                <span className="field-label">Title</span>
                <input name="title" defaultValue={document.title} required />
              </label>
              <label className="field-stack">
                <span className="field-label">Slug</span>
                <input name="slug" defaultValue={document.slug} required />
              </label>
            </div>
            <div className="form-grid form-grid-two">
              <label className="field-stack">
                <span className="field-label">Type</span>
                <select name="type" defaultValue={document.type}>
                  <option value="doc">doc</option>
                  <option value="runbook">runbook</option>
                  <option value="announcement">announcement</option>
                </select>
              </label>
              <label className="field-stack">
                <span className="field-label">Attached service</span>
                <select name="serviceId" defaultValue={document.serviceId ?? ""}>
                  <option value="">Workspace-wide</option>
                  {services.map((service) => <option key={service.id} value={service.id}>{service.name}</option>)}
                </select>
              </label>
            </div>
            <label className="field-stack">
              <span className="field-label">Markdown content</span>
              <textarea name="contentMarkdown" defaultValue={document.contentMarkdown ?? ""} rows={8} required />
            </label>
            <div className="row" style={{ justifyContent: "flex-start" }}>
              <button className="button-link" type="submit">Save document</button>
            </div>
          </form>
          <form action={deleteDocument}>
            <input type="hidden" name="id" value={document.id} />
            <button className="button-link secondary" type="submit">Delete document</button>
          </form>
        </article>
      ))}
    </div>
  );
}
import { createDocument, deleteDocument, updateDocument } from "@/server/actions";
import { DocumentSummary, ServiceSummary } from "@/lib/types";

export function DocumentManagement({
  workspaceId,
  services,
  documents
}: {
  workspaceId: string;
  services: ServiceSummary[];
  documents: DocumentSummary[];
}) {
  return (
    <div className="stack-lg">
      <article className="info-card stack">
        <strong>Create document</strong>
        <form action={createDocument} className="stack">
          <input type="hidden" name="workspaceId" value={workspaceId} />
          <input name="title" placeholder="Document title" required />
          <input name="slug" placeholder="document-slug" required />
          <div className="row">
            <select name="type" defaultValue="doc">
              <option value="doc">doc</option>
              <option value="runbook">runbook</option>
              <option value="announcement">announcement</option>
            </select>
            <select name="serviceId" defaultValue="">
              <option value="">Workspace-wide</option>
              {services.map((service) => <option key={service.id} value={service.id}>{service.name}</option>)}
            </select>
          </div>
          <textarea name="contentMarkdown" rows={8} placeholder="# Title" required />
          <button className="button-link" type="submit">Create document</button>
        </form>
      </article>

      {documents.map((document) => (
        <article key={document.id} className="info-card stack">
          <div className="row">
            <strong>{document.title}</strong>
            <span className="pill">{document.type}</span>
          </div>
          <form action={updateDocument} className="stack">
            <input type="hidden" name="id" value={document.id} />
            <input type="hidden" name="workspaceId" value={workspaceId} />
            <input name="title" defaultValue={document.title} required />
            <input name="slug" defaultValue={document.slug} required />
            <div className="row">
              <select name="type" defaultValue={document.type}>
                <option value="doc">doc</option>
                <option value="runbook">runbook</option>
                <option value="announcement">announcement</option>
              </select>
              <select name="serviceId" defaultValue={document.serviceId ?? ""}>
                <option value="">Workspace-wide</option>
                {services.map((service) => <option key={service.id} value={service.id}>{service.name}</option>)}
              </select>
            </div>
            <textarea name="contentMarkdown" defaultValue={document.contentMarkdown ?? ""} rows={8} required />
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

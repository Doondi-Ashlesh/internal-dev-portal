import { ServiceSummary, TeamSummary } from "@/lib/types";
import { createService, deleteService, updateService } from "@/server/actions";

export function ServiceManagement({
  workspaceId,
  teams,
  services,
  canManage
}: {
  workspaceId: string;
  teams: TeamSummary[];
  services: ServiceSummary[];
  canManage: boolean;
}) {
  if (!canManage) {
    return (
      <article className="empty-state stack">
        <strong>Catalog editing is restricted</strong>
        <span className="muted tiny">
          Your current role can browse services, but only editors and above can change the service catalog.
        </span>
      </article>
    );
  }

  return (
    <div className="stack-lg">
      <article className="info-card stack-lg admin-card">
        <div className="section-copy">
          <div className="section-label">Create service</div>
          <p className="muted tiny" style={{ maxWidth: 620 }}>
            Start with the service identity and operating metadata, then layer in repos, docs, ownership, and runtime signals.
          </p>
        </div>
        <form action={createService} className="stack-lg">
          <input type="hidden" name="workspaceId" value={workspaceId} />
          <div className="form-grid form-grid-two">
            <label className="field-stack">
              <span className="field-label">Service name</span>
              <input name="name" placeholder="Service name" required />
            </label>
            <label className="field-stack">
              <span className="field-label">Slug</span>
              <input name="slug" placeholder="service-slug" required />
            </label>
          </div>
          <label className="field-stack">
            <span className="field-label">Description</span>
            <textarea name="description" placeholder="Short description" rows={3} required />
          </label>
          <div className="form-grid form-grid-three">
            <label className="field-stack">
              <span className="field-label">Team</span>
              <select name="teamId" defaultValue="">
                <option value="">No team</option>
                {teams.map((team) => <option key={team.id} value={team.id}>{team.name}</option>)}
              </select>
            </label>
            <label className="field-stack">
              <span className="field-label">Tier</span>
              <select name="tier" defaultValue="medium">
                <option value="critical">critical</option>
                <option value="high">high</option>
                <option value="medium">medium</option>
                <option value="low">low</option>
              </select>
            </label>
            <label className="field-stack">
              <span className="field-label">Lifecycle</span>
              <select name="lifecycle" defaultValue="active">
                <option value="experimental">experimental</option>
                <option value="active">active</option>
                <option value="deprecated">deprecated</option>
                <option value="retired">retired</option>
              </select>
            </label>
          </div>
          <label className="field-stack">
            <span className="field-label">Tags</span>
            <input name="tags" placeholder="comma,separated,tags" />
          </label>
          <div className="row" style={{ justifyContent: "flex-start" }}>
            <button className="button-link" type="submit">Create service</button>
          </div>
        </form>
      </article>

      {services.map((service) => (
        <article key={service.id} className="info-card stack-lg admin-card">
          <div className="row">
            <div>
              <strong>{service.name}</strong>
              <div className="tiny muted" style={{ marginTop: 6 }}>{service.description}</div>
            </div>
            <div className="row" style={{ justifyContent: "flex-end" }}>
              <span className="pill">{service.slug}</span>
              <span className="pill">{service.lifecycle}</span>
            </div>
          </div>
          <div className="meta-board">
            <div className="meta-panel">
              <span className="tiny muted">Team</span>
              <strong>{service.team}</strong>
            </div>
            <div className="meta-panel">
              <span className="tiny muted">Tier</span>
              <strong>{service.tier}</strong>
            </div>
            <div className="meta-panel">
              <span className="tiny muted">Status</span>
              <strong>{service.status}</strong>
            </div>
            <div className="meta-panel">
              <span className="tiny muted">Repositories</span>
              <strong>{service.repositories.length}</strong>
            </div>
          </div>
          <form action={updateService} className="stack-lg">
            <input type="hidden" name="id" value={service.id} />
            <input type="hidden" name="workspaceId" value={workspaceId} />
            <div className="form-grid form-grid-two">
              <label className="field-stack">
                <span className="field-label">Service name</span>
                <input name="name" defaultValue={service.name} required />
              </label>
              <label className="field-stack">
                <span className="field-label">Slug</span>
                <input name="slug" defaultValue={service.slug} required />
              </label>
            </div>
            <label className="field-stack">
              <span className="field-label">Description</span>
              <textarea name="description" defaultValue={service.description} rows={3} required />
            </label>
            <div className="form-grid form-grid-three">
              <label className="field-stack">
                <span className="field-label">Team</span>
                <select name="teamId" defaultValue={service.teamId ?? ""}>
                  <option value="">No team</option>
                  {teams.map((team) => <option key={team.id} value={team.id}>{team.name}</option>)}
                </select>
              </label>
              <label className="field-stack">
                <span className="field-label">Tier</span>
                <select name="tier" defaultValue={service.tier}>
                  <option value="critical">critical</option>
                  <option value="high">high</option>
                  <option value="medium">medium</option>
                  <option value="low">low</option>
                </select>
              </label>
              <label className="field-stack">
                <span className="field-label">Lifecycle</span>
                <select name="lifecycle" defaultValue={service.lifecycle}>
                  <option value="experimental">experimental</option>
                  <option value="active">active</option>
                  <option value="deprecated">deprecated</option>
                  <option value="retired">retired</option>
                </select>
              </label>
            </div>
            <label className="field-stack">
              <span className="field-label">Tags</span>
              <input name="tags" defaultValue={service.tags.join(", ")} />
            </label>
            <div className="row" style={{ justifyContent: "flex-start" }}>
              <button className="button-link" type="submit">Save service</button>
            </div>
          </form>
          <form action={deleteService}>
            <input type="hidden" name="id" value={service.id} />
            <button className="button-link secondary" type="submit">Delete service</button>
          </form>
        </article>
      ))}
    </div>
  );
}
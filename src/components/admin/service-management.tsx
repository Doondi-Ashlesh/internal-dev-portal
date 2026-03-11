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
      <article className="info-card stack">
        <strong>Catalog editing is restricted</strong>
        <span className="muted tiny">
          Your current role can browse services, but only editors and above can change the service catalog.
        </span>
      </article>
    );
  }

  return (
    <div className="stack-lg">
      <article className="info-card stack">
        <strong>Create service</strong>
        <form action={createService} className="stack">
          <input type="hidden" name="workspaceId" value={workspaceId} />
          <input name="name" placeholder="Service name" required />
          <input name="slug" placeholder="service-slug" required />
          <textarea name="description" placeholder="Short description" rows={3} required />
          <select name="teamId" defaultValue="">
            <option value="">No team</option>
            {teams.map((team) => <option key={team.id} value={team.id}>{team.name}</option>)}
          </select>
          <div className="row">
            <select name="tier" defaultValue="medium">
              <option value="critical">critical</option>
              <option value="high">high</option>
              <option value="medium">medium</option>
              <option value="low">low</option>
            </select>
            <select name="lifecycle" defaultValue="active">
              <option value="experimental">experimental</option>
              <option value="active">active</option>
              <option value="deprecated">deprecated</option>
              <option value="retired">retired</option>
            </select>
          </div>
          <input name="tags" placeholder="comma,separated,tags" />
          <button className="button-link" type="submit">Create service</button>
        </form>
      </article>

      {services.map((service) => (
        <article key={service.id} className="info-card stack">
          <div className="row">
            <strong>{service.name}</strong>
            <span className="pill">{service.slug}</span>
          </div>
          <form action={updateService} className="stack">
            <input type="hidden" name="id" value={service.id} />
            <input type="hidden" name="workspaceId" value={workspaceId} />
            <input name="name" defaultValue={service.name} required />
            <input name="slug" defaultValue={service.slug} required />
            <textarea name="description" defaultValue={service.description} rows={3} required />
            <select name="teamId" defaultValue={service.teamId ?? ""}>
              <option value="">No team</option>
              {teams.map((team) => <option key={team.id} value={team.id}>{team.name}</option>)}
            </select>
            <div className="row">
              <select name="tier" defaultValue={service.tier}>
                <option value="critical">critical</option>
                <option value="high">high</option>
                <option value="medium">medium</option>
                <option value="low">low</option>
              </select>
              <select name="lifecycle" defaultValue={service.lifecycle}>
                <option value="experimental">experimental</option>
                <option value="active">active</option>
                <option value="deprecated">deprecated</option>
                <option value="retired">retired</option>
              </select>
            </div>
            <input name="tags" defaultValue={service.tags.join(", ")} />
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
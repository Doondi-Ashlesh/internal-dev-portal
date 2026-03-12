import { TeamSummary } from "@/lib/types";
import { createTeam, deleteTeam, updateTeam } from "@/server/actions";

export function TeamManagement({
  workspaceId,
  teams,
  canManage
}: {
  workspaceId: string;
  teams: TeamSummary[];
  canManage: boolean;
}) {
  return (
    <div className="stack-lg">
      {canManage ? (
        <article className="info-card stack-lg admin-card">
          <div className="section-copy">
            <div className="section-label">Create team</div>
            <p className="muted tiny" style={{ maxWidth: 620 }}>
              Teams anchor ownership and routing across the catalog, so keep the naming and scope clear enough for new engineers to trust immediately.
            </p>
          </div>
          <form action={createTeam} className="stack-lg">
            <input type="hidden" name="workspaceId" value={workspaceId} />
            <div className="form-grid form-grid-two">
              <label className="field-stack">
                <span className="field-label">Team name</span>
                <input name="name" placeholder="Team name" required />
              </label>
              <label className="field-stack">
                <span className="field-label">Slug</span>
                <input name="slug" placeholder="team-slug" required />
              </label>
            </div>
            <label className="field-stack">
              <span className="field-label">Description</span>
              <textarea name="description" placeholder="What this team owns" rows={3} />
            </label>
            <div className="row" style={{ justifyContent: "flex-start" }}>
              <button className="button-link" type="submit">Create team</button>
            </div>
          </form>
        </article>
      ) : (
        <article className="empty-state stack">
          <strong>Team management is restricted</strong>
          <span className="muted tiny">
            Only workspace admins and owners can create, rename, or delete teams. Team ownership details remain visible here for everyone.
          </span>
        </article>
      )}

      {teams.map((team) => (
        <article key={team.id} id={`team-${team.slug}`} className="info-card stack-lg admin-card" style={{ scrollMarginTop: 112 }}>
          <div className="row">
            <div>
              <strong>{team.name}</strong>
              <div className="tiny muted" style={{ marginTop: 6 }}>{team.description ?? "No description yet."}</div>
            </div>
            <span className="pill">{team.memberCount} services</span>
          </div>
          {canManage ? (
            <>
              <form action={updateTeam} className="stack-lg">
                <input type="hidden" name="id" value={team.id} />
                <input type="hidden" name="workspaceId" value={workspaceId} />
                <div className="form-grid form-grid-two">
                  <label className="field-stack">
                    <span className="field-label">Team name</span>
                    <input name="name" defaultValue={team.name} required />
                  </label>
                  <label className="field-stack">
                    <span className="field-label">Slug</span>
                    <input name="slug" defaultValue={team.slug} required />
                  </label>
                </div>
                <label className="field-stack">
                  <span className="field-label">Description</span>
                  <textarea name="description" defaultValue={team.description ?? ""} rows={3} />
                </label>
                <div className="row" style={{ justifyContent: "flex-start" }}>
                  <button className="button-link" type="submit">Save team</button>
                </div>
              </form>
              <form action={deleteTeam}>
                <input type="hidden" name="id" value={team.id} />
                <button className="button-link secondary" type="submit">Delete team</button>
              </form>
            </>
          ) : null}
        </article>
      ))}
    </div>
  );
}
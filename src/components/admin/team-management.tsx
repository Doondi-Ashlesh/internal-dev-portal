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
        <article className="info-card stack">
          <strong>Create team</strong>
          <form action={createTeam} className="stack">
            <input type="hidden" name="workspaceId" value={workspaceId} />
            <input name="name" placeholder="Team name" required />
            <input name="slug" placeholder="team-slug" required />
            <textarea name="description" placeholder="What this team owns" rows={3} />
            <button className="button-link" type="submit">Create team</button>
          </form>
        </article>
      ) : (
        <article className="info-card stack">
          <strong>Team management is restricted</strong>
          <span className="muted tiny">
            Only workspace admins and owners can create, rename, or delete teams. Team ownership details remain visible here for everyone.
          </span>
        </article>
      )}

      {teams.map((team) => (
        <article key={team.id} id={`team-${team.slug}`} className="info-card stack" style={{ scrollMarginTop: 112 }}>
          <div className="row">
            <strong>{team.name}</strong>
            <span className="pill">{team.memberCount} services</span>
          </div>
          {canManage ? (
            <>
              <form action={updateTeam} className="stack">
                <input type="hidden" name="id" value={team.id} />
                <input type="hidden" name="workspaceId" value={workspaceId} />
                <input name="name" defaultValue={team.name} required />
                <input name="slug" defaultValue={team.slug} required />
                <textarea name="description" defaultValue={team.description ?? ""} rows={3} />
                <div className="row" style={{ justifyContent: "flex-start" }}>
                  <button className="button-link" type="submit">Save team</button>
                </div>
              </form>
              <form action={deleteTeam}>
                <input type="hidden" name="id" value={team.id} />
                <button className="button-link secondary" type="submit">Delete team</button>
              </form>
            </>
          ) : (
            <span className="muted tiny">{team.description ?? "No description yet."}</span>
          )}
        </article>
      ))}
    </div>
  );
}
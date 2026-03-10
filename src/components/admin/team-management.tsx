import { createTeam, deleteTeam, updateTeam } from "@/server/actions";
import { TeamSummary } from "@/lib/types";

export function TeamManagement({ workspaceId, teams }: { workspaceId: string; teams: TeamSummary[] }) {
  return (
    <div className="stack-lg">
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

      {teams.map((team) => (
        <article key={team.id} className="info-card stack">
          <div className="row">
            <strong>{team.name}</strong>
            <span className="pill">{team.memberCount} services</span>
          </div>
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
        </article>
      ))}
    </div>
  );
}

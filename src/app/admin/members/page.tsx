import { AppShell } from "@/components/app-shell";
import { TeamManagement } from "@/components/admin/team-management";
import { canInviteMembers, canManageWorkspace } from "@/lib/permissions";
import { getWorkspaceSnapshot } from "@/server/workspace";

const currentRole = "owner" as const;

export default async function MembersPage() {
  const snapshot = await getWorkspaceSnapshot();

  return (
    <AppShell workspaceName={snapshot.workspace.name} currentPath="/admin/members">
      <section className="card card-pad stack-lg">
        <div>
          <div className="section-label">Admin</div>
          <h1 className="page-title" style={{ fontSize: "2.5rem" }}>Workspace access</h1>
          <p className="muted" style={{ maxWidth: 720 }}>
            Start simple with workspace-wide roles. We can expand to team-scoped permissions once the core catalog flow is stable.
          </p>
        </div>

        <div className="panel-grid">
          <article className="info-card stack">
            <strong>Current role</strong>
            <span className="pill">{currentRole}</span>
            <span className="muted tiny">Can manage workspace: {String(canManageWorkspace(currentRole))}</span>
            <span className="muted tiny">Can invite members: {String(canInviteMembers(currentRole))}</span>
          </article>

          <article className="info-card stack">
            <strong>Planned role matrix</strong>
            <span className="muted tiny">Owner/Admin can manage integrations and membership.</span>
            <span className="muted tiny">Editors can update services and docs.</span>
            <span className="muted tiny">Viewers get read-only access to the portal.</span>
          </article>
        </div>
      </section>

      <section className="card card-pad stack-lg">
        <div>
          <div className="section-label">Team Admin</div>
          <h2 className="section-title" style={{ marginTop: 8 }}>Manage teams</h2>
        </div>
        <TeamManagement workspaceId={snapshot.workspace.id} teams={snapshot.teams} />
      </section>
    </AppShell>
  );
}

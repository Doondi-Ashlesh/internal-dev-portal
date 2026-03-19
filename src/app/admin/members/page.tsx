import { AppShell } from "@/components/app-shell";
import { InviteManagement } from "@/components/admin/invite-management";
import { TeamManagement } from "@/components/admin/team-management";
import { WorkspaceUnavailableState } from "@/components/workspace-unavailable-state";
import { canInviteMembers, canManageWorkspace } from "@/lib/permissions";
import { updateWorkspaceMemberRole } from "@/server/actions";
import { getPageWorkspaceContext } from "@/server/access";
import {
  getWorkspaceAuditLogs,
  getWorkspaceInvites,
  getWorkspaceMembers,
  getWorkspaceSnapshot,
  WorkspaceDataUnavailableError
} from "@/server/workspace";

export default async function MembersPage() {
  const access = await getPageWorkspaceContext();
  const canManage = canManageWorkspace(access.role);
  const canInvite = canInviteMembers(access.role);

  try {
    const snapshot = await getWorkspaceSnapshot();
    const members = await getWorkspaceMembers();
    const invites = await getWorkspaceInvites();
    const auditLogs = await getWorkspaceAuditLogs();

    return (
      <AppShell workspaceName={snapshot.workspace.name} currentPath="/admin/members">
        <section className="card card-pad hero">
          <div className="hero-split">
            <div className="stack-lg hero-copy" style={{ position: "relative", zIndex: 1 }}>
              <div>
                <div className="section-label">Admin</div>
                <h1 className="page-title" style={{ fontSize: "2.5rem" }}>Workspace access</h1>
                <p className="muted" style={{ maxWidth: 720 }}>
                  Roles are enforced on server actions, invites are explicit, and workspace access can now be onboarded through a proper acceptance flow instead of a loose local shortcut.
                </p>
              </div>
              <div className="row" style={{ justifyContent: "flex-start" }}>
                <span className="pill">Current role: {access.role}</span>
                <span className="pill">{members.length} members</span>
                <span className="pill">{invites.length} tracked invites</span>
              </div>
            </div>
            <aside className="hero-sidebar">
              <article className="surface-panel stack">
                <div className="section-label">Access model</div>
                <div className="compact-list">
                  <div className="compact-item">
                    <strong>Can manage workspace</strong>
                    <span className="tiny muted">{String(canManageWorkspace(access.role))}</span>
                  </div>
                  <div className="compact-item">
                    <strong>Can invite members</strong>
                    <span className="tiny muted">{String(canInvite)}</span>
                  </div>
                  <div className="compact-item">
                    <strong>Invite-based onboarding</strong>
                    <span className="tiny muted">New users can accept a role-scoped workspace invitation from a dedicated join flow.</span>
                  </div>
                </div>
              </article>
            </aside>
          </div>
        </section>

        <section className="card card-pad stack-lg">
          <div className="section-copy">
            <div className="section-label">Members</div>
            <h2 className="section-title" style={{ marginTop: 8 }}>Workspace roles</h2>
          </div>
          <div className="doc-grid">
            {members.map((member) => (
              <article key={member.id} className="info-card stack-lg admin-card">
                <div className="row">
                  <div>
                    <strong>{member.name}</strong>
                    <div className="muted tiny" style={{ marginTop: 6 }}>{member.email}</div>
                  </div>
                  <span className="pill">{member.role}</span>
                </div>
                {canManage ? (
                  <form action={updateWorkspaceMemberRole} className="form-grid form-grid-two align-end">
                    <input type="hidden" name="memberId" value={member.id} />
                    <label className="field-stack">
                      <span className="field-label">Role</span>
                      <select name="role" defaultValue={member.role}>
                        <option value="owner">owner</option>
                        <option value="admin">admin</option>
                        <option value="editor">editor</option>
                        <option value="viewer">viewer</option>
                      </select>
                    </label>
                    <div className="row" style={{ justifyContent: "flex-start" }}>
                      <button className="button-link" type="submit">Update role</button>
                    </div>
                  </form>
                ) : null}
              </article>
            ))}
          </div>
        </section>

        <section className="card card-pad stack-lg">
          <div className="section-copy">
            <div className="section-label">Invites</div>
            <h2 className="section-title" style={{ marginTop: 8 }}>Member onboarding</h2>
          </div>
          <InviteManagement workspaceId={snapshot.workspace.id} invites={invites} canInvite={canInvite} />
        </section>

        <section className="card card-pad stack-lg">
          <div className="section-copy">
            <div className="section-label">Team Admin</div>
            <h2 className="section-title" style={{ marginTop: 8 }}>Manage teams</h2>
          </div>
          <TeamManagement workspaceId={snapshot.workspace.id} teams={snapshot.teams} canManage={canManage} />
        </section>

        <section className="card card-pad stack-lg">
          <div className="section-copy">
            <div className="section-label">Audit Trail</div>
            <h2 className="section-title" style={{ marginTop: 8 }}>Recent access and configuration changes</h2>
          </div>
          {auditLogs.length ? (
            <div className="stack">
              {auditLogs.map((log) => (
                <article key={log.id} className="info-card stack admin-card">
                  <div className="row">
                    <strong>{log.summary}</strong>
                    <span className="pill">{log.action}</span>
                  </div>
                  <span className="muted tiny">{log.actorName} | {log.createdAt}</span>
                </article>
              ))}
            </div>
          ) : (
            <article className="empty-state stack">
              <strong>No audit events yet</strong>
              <span className="muted tiny">Workspace changes will appear here as members edit the catalog, access controls, and integrations.</span>
            </article>
          )}
        </section>
      </AppShell>
    );
  } catch (error) {
    if (error instanceof WorkspaceDataUnavailableError) {
      return <WorkspaceUnavailableState workspaceName={access.workspaceName} currentPath="/admin/members" />;
    }

    throw error;
  }
}

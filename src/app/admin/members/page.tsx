import { AppShell } from "@/components/app-shell";
import { TeamManagement } from "@/components/admin/team-management";
import { canInviteMembers, canManageWorkspace } from "@/lib/permissions";
import { updateWorkspaceMemberRole } from "@/server/actions";
import { getPageWorkspaceContext } from "@/server/access";
import { getWorkspaceAuditLogs, getWorkspaceMembers, getWorkspaceSnapshot } from "@/server/workspace";

export default async function MembersPage() {
  const access = await getPageWorkspaceContext();
  const snapshot = await getWorkspaceSnapshot();
  const members = await getWorkspaceMembers();
  const auditLogs = await getWorkspaceAuditLogs();
  const canManage = canManageWorkspace(access.role);

  return (
    <AppShell workspaceName={snapshot.workspace.name} currentPath="/admin/members">
      <section className="card card-pad stack-lg">
        <div>
          <div className="section-label">Admin</div>
          <h1 className="page-title" style={{ fontSize: "2.5rem" }}>Workspace access</h1>
          <p className="muted" style={{ maxWidth: 720 }}>
            Roles are now enforced on server actions, displayed in the app shell, and adjustable from this screen for a
            more production-shaped access story.
          </p>
        </div>

        <div className="panel-grid">
          <article className="info-card stack">
            <strong>Current role</strong>
            <span className="pill">{access.role}</span>
            <span className="muted tiny">Can manage workspace: {String(canManageWorkspace(access.role))}</span>
            <span className="muted tiny">Can invite members: {String(canInviteMembers(access.role))}</span>
          </article>

          <article className="info-card stack">
            <strong>Access model</strong>
            <span className="muted tiny">Owner/Admin can manage integrations and membership.</span>
            <span className="muted tiny">Editors can update services, docs, and runbooks.</span>
            <span className="muted tiny">Viewers get read-only access to the portal.</span>
          </article>
        </div>
      </section>

      <section className="card card-pad stack-lg">
        <div>
          <div className="section-label">Members</div>
          <h2 className="section-title" style={{ marginTop: 8 }}>Workspace roles</h2>
        </div>
        <div className="doc-grid">
          {members.map((member) => (
            <article key={member.id} className="info-card stack">
              <div className="row">
                <div>
                  <strong>{member.name}</strong>
                  <div className="muted tiny" style={{ marginTop: 6 }}>{member.email}</div>
                </div>
                <span className="pill">{member.role}</span>
              </div>
              {canManage ? (
                <form action={updateWorkspaceMemberRole} className="row" style={{ justifyContent: "flex-start" }}>
                  <input type="hidden" name="memberId" value={member.id} />
                  <select name="role" defaultValue={member.role}>
                    <option value="owner">owner</option>
                    <option value="admin">admin</option>
                    <option value="editor">editor</option>
                    <option value="viewer">viewer</option>
                  </select>
                  <button className="button-link" type="submit">Update role</button>
                </form>
              ) : null}
            </article>
          ))}
        </div>
      </section>

      <section className="card card-pad stack-lg">
        <div>
          <div className="section-label">Team Admin</div>
          <h2 className="section-title" style={{ marginTop: 8 }}>Manage teams</h2>
        </div>
        <TeamManagement workspaceId={snapshot.workspace.id} teams={snapshot.teams} canManage={canManage} />
      </section>

      <section className="card card-pad stack-lg">
        <div>
          <div className="section-label">Audit Trail</div>
          <h2 className="section-title" style={{ marginTop: 8 }}>Recent access and configuration changes</h2>
        </div>
        {auditLogs.length ? (
          <div className="stack">
            {auditLogs.map((log) => (
              <article key={log.id} className="info-card stack">
                <div className="row">
                  <strong>{log.summary}</strong>
                  <span className="pill">{log.action}</span>
                </div>
                <span className="muted tiny">{log.actorName} · {log.createdAt}</span>
              </article>
            ))}
          </div>
        ) : (
          <article className="info-card stack">
            <strong>No audit events yet</strong>
            <span className="muted tiny">Workspace changes will appear here as members edit the catalog and integrations.</span>
          </article>
        )}
      </section>
    </AppShell>
  );
}
import { WorkspaceInviteSummary } from "@/lib/types";
import { createWorkspaceInvite, revokeWorkspaceInvite } from "@/server/actions";

export function InviteManagement({
  workspaceId,
  invites,
  canInvite
}: {
  workspaceId: string;
  invites: WorkspaceInviteSummary[];
  canInvite: boolean;
}) {
  return (
    <div className="stack-lg">
      {canInvite ? (
        <article className="info-card stack-lg admin-card">
          <div className="section-copy">
            <div className="section-label">Invite member</div>
            <p className="muted tiny" style={{ maxWidth: 620 }}>
              Create a shareable invite link tied to a specific email and role. This keeps access explicit and makes onboarding feel production-shaped.
            </p>
          </div>
          <form action={createWorkspaceInvite} className="stack-lg">
            <input type="hidden" name="workspaceId" value={workspaceId} />
            <div className="form-grid form-grid-three">
              <label className="field-stack">
                <span className="field-label">Email</span>
                <input name="email" type="email" placeholder="engineer@company.com" required />
              </label>
              <label className="field-stack">
                <span className="field-label">Role</span>
                <select name="role" defaultValue="viewer">
                  <option value="admin">admin</option>
                  <option value="editor">editor</option>
                  <option value="viewer">viewer</option>
                </select>
              </label>
              <div className="row" style={{ justifyContent: "flex-start", alignItems: "flex-end" }}>
                <button className="button-link" type="submit">Create invite</button>
              </div>
            </div>
          </form>
        </article>
      ) : (
        <article className="empty-state stack">
          <strong>Invites are restricted</strong>
          <span className="muted tiny">Only workspace admins and owners can create or revoke member invites.</span>
        </article>
      )}

      {invites.length ? (
        invites.map((invite) => (
          <article key={invite.id} className="info-card stack-lg admin-card">
            <div className="row">
              <div>
                <strong>{invite.email}</strong>
                <div className="tiny muted" style={{ marginTop: 6 }}>
                  Invited by {invite.invitedByName} | created {invite.createdAt}
                </div>
              </div>
              <div className="row" style={{ justifyContent: "flex-end" }}>
                <span className="pill">{invite.role}</span>
                <span className="pill">{invite.status}</span>
              </div>
            </div>
            <div className="meta-board">
              <div className="meta-panel">
                <span className="tiny muted">Expires</span>
                <strong>{invite.expiresAt}</strong>
              </div>
              <div className="meta-panel">
                <span className="tiny muted">Join link</span>
                <a href={invite.inviteUrl} className="tiny strong">Open invite</a>
              </div>
            </div>
            <code>{invite.inviteUrl}</code>
            {canInvite && invite.status === "pending" ? (
              <form action={revokeWorkspaceInvite}>
                <input type="hidden" name="inviteId" value={invite.id} />
                <button className="button-link secondary" type="submit">Revoke invite</button>
              </form>
            ) : null}
          </article>
        ))
      ) : (
        <article className="empty-state stack">
          <strong>No invites yet</strong>
          <span className="muted tiny">Create an invite to onboard someone into the workspace with an explicit role and acceptance link.</span>
        </article>
      )}
    </div>
  );
}
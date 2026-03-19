import Link from "next/link";
import { redirect } from "next/navigation";
import { Github, LogIn, ShieldCheck, UserPlus } from "lucide-react";

import { signIn } from "@/auth";
import { acceptWorkspaceInvite } from "@/server/actions";
import { getOptionalCurrentUserIdentity } from "@/server/access";
import { getJoinInviteContext } from "@/server/invites";
import { isDemoAuthEnabled, isGithubAuthConfigured } from "@/lib/env";

export default async function JoinInvitePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const invite = await getJoinInviteContext(token);
  const currentUser = await getOptionalCurrentUserIdentity();
  const githubReady = isGithubAuthConfigured();
  const demoAuthEnabled = isDemoAuthEnabled();

  if (!invite) {
    return (
      <main className="shell">
        <div className="container" style={{ padding: "48px 0" }}>
          <section className="card card-pad" style={{ maxWidth: 720, margin: "0 auto" }}>
            <div className="stack-lg">
              <span className="pill">Invite</span>
              <div>
                <div className="eyebrow">Invalid Invite</div>
                <h1 className="page-title" style={{ fontSize: "2.5rem" }}>This invite link is not valid anymore.</h1>
              </div>
              <p className="muted">Ask a workspace admin for a fresh invite link or return to the landing page.</p>
              <div className="row" style={{ justifyContent: "flex-start" }}>
                <Link href="/" className="button-link secondary">Back to landing</Link>
              </div>
            </div>
          </section>
        </div>
      </main>
    );
  }

  if (invite.status === "accepted" && invite.currentUserEmail && invite.currentUserEmail.toLowerCase() === invite.email.toLowerCase()) {
    redirect("/dashboard");
  }

  const emailMatches = invite.currentUserEmail?.toLowerCase() === invite.email.toLowerCase();

  return (
    <main className="shell">
      <div className="container" style={{ padding: "48px 0" }}>
        <section className="card card-pad hero" style={{ maxWidth: 920, margin: "0 auto" }}>
          <div className="hero-split">
            <div className="stack-lg hero-copy" style={{ position: "relative", zIndex: 1 }}>
              <div className="row" style={{ justifyContent: "flex-start" }}>
                <span className="pill">Workspace invite</span>
                <span className="pill">Role: {invite.role}</span>
                <span className="pill">Status: {invite.status}</span>
              </div>
              <div>
                <div className="eyebrow">Join Workspace</div>
                <h1 className="page-title" style={{ fontSize: "2.8rem" }}>Join {invite.workspaceName}</h1>
                <p className="muted" style={{ maxWidth: 700, margin: 0 }}>
                  This invite was created for <strong>{invite.email}</strong> and grants <strong>{invite.role}</strong> access to the workspace.
                </p>
              </div>
              <div className="compact-list">
                <div className="compact-item">
                  <strong>Invited by</strong>
                  <span className="tiny muted">{invite.invitedByName}</span>
                </div>
                <div className="compact-item">
                  <strong>Expires</strong>
                  <span className="tiny muted">{invite.expiresAt}</span>
                </div>
              </div>
            </div>

            <aside className="hero-sidebar">
              <article className="surface-panel stack">
                <div className="section-label">Invite posture</div>
                <div className="compact-list">
                  <div className="compact-item compact-item-icon">
                    <span className="badge"><ShieldCheck size={14} /></span>
                    <div>
                      <strong>Role-scoped access</strong>
                      <div className="tiny muted">The invite is bound to a specific email and workspace role.</div>
                    </div>
                  </div>
                  <div className="compact-item compact-item-icon">
                    <span className="badge"><UserPlus size={14} /></span>
                    <div>
                      <strong>Explicit onboarding</strong>
                      <div className="tiny muted">Accepting the invite creates workspace membership and audit history.</div>
                    </div>
                  </div>
                </div>
              </article>
            </aside>
          </div>
        </section>

        <section className="card card-pad" style={{ maxWidth: 920, margin: "24px auto 0" }}>
          <div className="stack-lg">
            {invite.status === "expired" ? (
              <article className="empty-state stack">
                <strong>This invite has expired</strong>
                <span className="muted tiny">Ask a workspace admin to renew the invite and send you a fresh link.</span>
              </article>
            ) : invite.status === "revoked" ? (
              <article className="empty-state stack">
                <strong>This invite has been revoked</strong>
                <span className="muted tiny">The access request is no longer active. Contact a workspace admin if you still need entry.</span>
              </article>
            ) : currentUser && emailMatches ? (
              <article className="info-card stack-lg admin-card">
                <div className="row" style={{ justifyContent: "flex-start" }}>
                  <LogIn size={18} className="strong" />
                  <strong>Signed in as {invite.currentUserName ?? invite.currentUserEmail}</strong>
                </div>
                <span className="muted tiny">The signed-in account matches this invite. Accepting will add workspace membership and take you into the portal.</span>
                <form action={acceptWorkspaceInvite}>
                  <input type="hidden" name="token" value={invite.token} />
                  <button className="button-link" type="submit">Accept invite</button>
                </form>
              </article>
            ) : currentUser ? (
              <article className="empty-state stack">
                <strong>Signed in with the wrong account</strong>
                <span className="muted tiny">
                  This invite is for {invite.email}, but you are currently signed in as {invite.currentUserEmail ?? "an unknown account"}.
                </span>
                <div className="row" style={{ justifyContent: "flex-start" }}>
                  <Link href="/login" className="button-link secondary">Go to login</Link>
                </div>
              </article>
            ) : (
              <div className="panel-grid">
                <article className="info-card stack-lg admin-card">
                  <div className="row" style={{ justifyContent: "flex-start" }}>
                    <Github size={18} className="strong" />
                    <strong>GitHub sign in</strong>
                  </div>
                  <span className="muted tiny">
                    Sign in with the invited GitHub account email, then come right back here to accept access.
                  </span>
                  {githubReady ? (
                    <form
                      action={async () => {
                        "use server";
                        await signIn("github", { redirectTo: `/join/${invite.token}` });
                      }}
                    >
                      <button className="button-link" type="submit">Continue with GitHub</button>
                    </form>
                  ) : (
                    <span className="badge" data-tone="warning">GitHub OAuth is not configured yet</span>
                  )}
                </article>

                {demoAuthEnabled ? (
                  <article className="info-card stack-lg admin-card">
                    <div className="row" style={{ justifyContent: "flex-start" }}>
                      <UserPlus size={18} className="strong" />
                      <strong>Demo invite access</strong>
                    </div>
                    <span className="muted tiny">
                      Local development shortcut. This signs in with the invited email so you can test the onboarding flow without email delivery.
                    </span>
                    <form
                      action={async () => {
                        "use server";
                        await signIn("demo", {
                          name: invite.email.split("@")[0] || "Invited User",
                          email: invite.email,
                          inviteToken: invite.token,
                          redirectTo: `/join/${invite.token}`
                        });
                      }}
                    >
                      <button className="button-link secondary" type="submit">Use demo access</button>
                    </form>
                  </article>
                ) : null}
              </div>
            )}

            <div className="row" style={{ justifyContent: "flex-start" }}>
              <Link href="/" className="button-link secondary">Back to landing</Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

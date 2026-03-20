import Link from "next/link";
import { redirect } from "next/navigation";
import { Github, MonitorSmartphone, Shield } from "lucide-react";

import { signIn } from "@/auth";
import { isDemoAuthEnabled, isGithubAuthConfigured } from "@/lib/env";
import { getOptionalCurrentUserIdentity, getOptionalCurrentWorkspaceContext } from "@/server/access";

export default async function LoginPage() {
  const access = await getOptionalCurrentWorkspaceContext();
  const identity = await getOptionalCurrentUserIdentity();
  const githubReady = isGithubAuthConfigured();
  const demoAuthEnabled = isDemoAuthEnabled();

  if (access) {
    redirect("/dashboard");
  }

  return (
    <main className="shell login-page">
      <div className="container login-page-inner" style={{ padding: "48px 0" }}>
        <section className="card card-pad login-card" style={{ maxWidth: 720, margin: "0 auto" }}>
          <div className="stack-lg">
            <span className="pill login-pill">Authentication</span>
            <div>
              <div className="eyebrow">Sign In</div>
              <h1 className="page-title login-page-title" style={{ fontSize: "2.5rem" }}>
                {demoAuthEnabled
                  ? "Connect GitHub or use demo access to enter the developer portal."
                  : "Connect GitHub to enter the developer portal."}
              </h1>
            </div>
            <p className="muted login-lead">
              Members need workspace access or an invite.
              {demoAuthEnabled ? " Demo access is available in this environment." : ""}
            </p>

            {identity && !access ? (
              <article className="empty-state stack login-empty-state">
                <strong>No workspace access yet</strong>
                <span className="muted tiny">
                  Signed in as {identity.userEmail ?? identity.userName}. Ask an admin for an invite
                  {demoAuthEnabled ? " or use demo access below." : "."}
                </span>
                {githubReady ? (
                  <p className="muted tiny login-hint-inline" style={{ margin: 0 }}>
                    Wrong GitHub user?{" "}
                    <a href="/api/auth/github-web-session" className="login-subtle-link">
                      Switch GitHub account
                    </a>
                  </p>
                ) : null}
              </article>
            ) : null}

            <div className="panel-grid login-panel-grid">
              <article className="info-card stack login-github-card">
                <div className="row" style={{ justifyContent: "flex-start" }}>
                  <Github size={18} className="strong" aria-hidden />
                  <strong>GitHub sign in</strong>
                </div>
                <span className="muted tiny">
                  {githubReady
                    ? "Use an account that already has access or matches an invite."
                    : "Add GitHub OAuth credentials in .env to enable sign-in."}
                </span>
                {githubReady ? (
                  <div className="stack login-github-actions">
                    <form
                      action={async () => {
                        "use server";
                        await signIn("github", { redirectTo: "/dashboard" });
                      }}
                    >
                      <button className="button-link login-cta-primary" type="submit">
                        Continue with GitHub
                      </button>
                    </form>
                    <aside className="login-hint" aria-label="Signing out">
                      <p className="login-hint-text">
                        Portal <strong>Sign out</strong> only ends this app&apos;s session. If the same GitHub user keeps
                        appearing, end your GitHub browser session first.
                      </p>
                      <p className="login-hint-text" style={{ marginBottom: 0 }}>
                        <a href="/api/auth/github-web-session" className="login-subtle-link">
                          Open GitHub sign-out
                        </a>{" "}
                        — then return here and continue.
                      </p>
                    </aside>
                  </div>
                ) : (
                  <span className="badge" data-tone="warning">
                    GitHub OAuth is not configured yet
                  </span>
                )}
              </article>

              {demoAuthEnabled ? (
                <article className="info-card stack login-demo-card">
                  <div className="row" style={{ justifyContent: "flex-start" }}>
                    <MonitorSmartphone size={18} className="strong" aria-hidden />
                    <strong>Demo access</strong>
                  </div>
                  <span className="muted tiny">Local development: creates a demo owner session.</span>
                  <form
                    action={async () => {
                      "use server";
                      await signIn("demo", {
                        name: "Foundry Demo",
                        email: "demo@foundry.dev",
                        redirectTo: "/dashboard"
                      });
                    }}
                    className="stack"
                  >
                    <button className="button-link secondary login-cta-secondary" type="submit">
                      Enter demo workspace
                    </button>
                  </form>
                </article>
              ) : null}
            </div>

            <div className="login-footer">
              <span className="badge login-security-badge">
                <Shield size={14} aria-hidden />
                RBAC, audit log, invite onboarding
              </span>
              <Link href="/" className="button-link secondary login-back-link">
                Back to landing
              </Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

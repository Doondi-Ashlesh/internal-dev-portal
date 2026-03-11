import Link from "next/link";
import { redirect } from "next/navigation";
import { Github, MonitorSmartphone, Shield } from "lucide-react";

import { signIn } from "@/auth";
import { isGithubAuthConfigured } from "@/lib/env";
import { getOptionalCurrentWorkspaceContext } from "@/server/access";

export default async function LoginPage() {
  const access = await getOptionalCurrentWorkspaceContext();
  const githubReady = isGithubAuthConfigured();

  if (access) {
    redirect("/dashboard");
  }

  return (
    <main className="shell">
      <div className="container" style={{ padding: "48px 0" }}>
        <section className="card card-pad" style={{ maxWidth: 720, margin: "0 auto" }}>
          <div className="stack-lg">
            <span className="pill">Authentication</span>
            <div>
              <div className="eyebrow">Sign In</div>
              <h1 className="page-title" style={{ fontSize: "2.5rem" }}>
                Connect GitHub or use demo access to enter the developer portal.
              </h1>
            </div>
            <p className="muted">
              GitHub OAuth and demo access are both supported. In local development, GitHub users are auto-provisioned into
              the workspace so you can test real repository sync and webhook flows without manual setup steps.
            </p>

            <div className="panel-grid">
              <article className="info-card stack">
                <div className="row" style={{ justifyContent: "flex-start" }}>
                  <Github size={18} className="strong" />
                  <strong>GitHub sign in</strong>
                </div>
                <span className="muted tiny">
                  {githubReady ? "Use your GitHub account for real workspace login and repository sync." : "Add GitHub client credentials to .env to enable OAuth login."}
                </span>
                {githubReady ? (
                  <form
                    action={async () => {
                      "use server";
                      await signIn("github", { redirectTo: "/dashboard" });
                    }}
                  >
                    <button className="button-link" type="submit">Continue with GitHub</button>
                  </form>
                ) : (
                  <span className="badge" data-tone="warning">GitHub OAuth is not configured yet</span>
                )}
              </article>

              <article className="info-card stack">
                <div className="row" style={{ justifyContent: "flex-start" }}>
                  <MonitorSmartphone size={18} className="strong" />
                  <strong>Demo access</strong>
                </div>
                <span className="muted tiny">Creates a local owner session immediately for product development.</span>
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
                  <button className="button-link secondary" type="submit">Enter demo workspace</button>
                </form>
              </article>
            </div>

            <div className="row" style={{ justifyContent: "flex-start" }}>
              <span className="badge">
                <Shield size={14} />
                Protected routes, RBAC checks, and audit logging are enabled
              </span>
              <Link href="/" className="button-link secondary">Back to landing</Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
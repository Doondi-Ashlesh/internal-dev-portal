import Link from "next/link";
import { redirect } from "next/navigation";
import { Github, MonitorSmartphone, Shield } from "lucide-react";

import { auth, signIn } from "@/auth";

export default async function LoginPage() {
  const session = await auth();

  if (session?.user) {
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
              GitHub OAuth is wired and ready once you replace the placeholder keys in `.env`. Demo access is available so
              you can keep previewing and building locally without blocking on OAuth setup.
            </p>

            <div className="panel-grid">
              <article className="info-card stack">
                <div className="row" style={{ justifyContent: "flex-start" }}>
                  <Github size={18} className="strong" />
                  <strong>GitHub sign in</strong>
                </div>
                <span className="muted tiny">Use your GitHub account for real workspace login.</span>
                <form
                  action={async () => {
                    "use server";
                    await signIn("github", { redirectTo: "/dashboard" });
                  }}
                >
                  <button className="button-link" type="submit">Continue with GitHub</button>
                </form>
              </article>

              <article className="info-card stack">
                <div className="row" style={{ justifyContent: "flex-start" }}>
                  <MonitorSmartphone size={18} className="strong" />
                  <strong>Demo access</strong>
                </div>
                <span className="muted tiny">Creates a local session immediately for product development.</span>
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
                Protected app routes are now auth-gated
              </span>
              <Link href="/" className="button-link secondary">Back to landing</Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

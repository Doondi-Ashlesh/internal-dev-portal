import Link from "next/link";
import { Bell, ChevronRight, LogOut } from "lucide-react";

import { auth, signOut } from "@/auth";
import { GlobalSearch } from "@/components/global-search";
import { appNavigation } from "@/lib/navigation";

export async function AppShell({
  children,
  workspaceName,
  currentPath
}: {
  children: React.ReactNode;
  workspaceName: string;
  currentPath: string;
}) {
  const session = await auth();
  const userName = session?.user?.name ?? "Signed-in user";
  const userEmail = session?.user?.email ?? "No email";
  const userRole = session?.user?.role ?? "viewer";

  return (
    <div className="shell">
      <div className="app-grid">
        <aside className="sidebar">
          <div className="stack-lg">
            <div className="stack">
              <span className="pill">Developer portal</span>
              <div>
                <div className="section-label">Workspace</div>
                <h2 className="section-title" style={{ marginTop: 8 }}>
                  {workspaceName}
                </h2>
                <p className="muted tiny" style={{ margin: "8px 0 0" }}>
                  Catalog, docs, ownership, deploy links, and engineering context in one surface.
                </p>
              </div>
            </div>

            <div className="info-card stack">
              <div>
                <div className="section-label">Signed In</div>
                <strong style={{ display: "block", marginTop: 6 }}>{userName}</strong>
                <span className="muted tiny" style={{ display: "block" }}>{userEmail}</span>
                <span className="pill" style={{ marginTop: 10, display: "inline-flex" }}>{userRole}</span>
              </div>
              <form
                action={async () => {
                  "use server";
                  await signOut({ redirectTo: "/login" });
                }}
              >
                <button className="button-link secondary" type="submit">
                  <LogOut size={14} />
                  Sign out
                </button>
              </form>
            </div>

            <nav>
              <ul className="nav-list">
                {appNavigation.map((item) => {
                  const Icon = item.icon;
                  const active = currentPath === item.href || currentPath.startsWith(`${item.href}/`);

                  return (
                    <li key={item.href}>
                      <Link className="nav-link" href={item.href} data-active={active}>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
                          <Icon size={18} />
                          {item.label}
                        </span>
                        <ChevronRight size={16} />
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>

            <div className="info-card stack">
              <div className="row">
                <div>
                  <div className="section-label">Announcements</div>
                  <strong style={{ display: "block", marginTop: 6 }}>On-call refresh</strong>
                </div>
                <Bell size={18} className="strong" />
              </div>
              <p className="muted tiny" style={{ margin: 0 }}>
                Platform handoff expectations were updated yesterday. Check the docs area for the new template.
              </p>
            </div>
          </div>
        </aside>

        <main className="main-panel">
          <div className="card card-pad row">
            <div>
              <div className="section-label">Unified Search</div>
              <h1 className="section-title" style={{ marginTop: 8 }}>
                Internal developer portal
              </h1>
            </div>
            <GlobalSearch />
          </div>
          {children}
        </main>
      </div>
    </div>
  );
}
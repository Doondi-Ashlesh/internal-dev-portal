import Link from "next/link";
import { ChevronRight, LogOut, ShieldCheck } from "lucide-react";

import { auth, signOut } from "@/auth";
import { GlobalSearch } from "@/components/global-search";
import { appNavigation } from "@/lib/navigation";

function getWorkspaceInitials(name: string) {
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");

  return initials || "DP";
}

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
  const workspaceInitials = getWorkspaceInitials(workspaceName);

  return (
    <div className="shell">
      <div className="app-grid">
        <aside className="sidebar">
          <div className="sidebar-shell stack-lg">
            <div className="brand-lockup">
              <div className="brand-mark">{workspaceInitials}</div>
              <div className="workspace-panel-copy">
                <span className="section-label">Workspace</span>
                <h2 className="sidebar-title">{workspaceName}</h2>
                <p className="muted tiny" style={{ margin: 0 }}>
                  Service catalog, docs, GitHub activity, and access in one place.
                </p>
              </div>
            </div>

            <div className="info-card profile-card stack">
              <div className="profile-meta">
                <div className="section-label">Signed In</div>
                <strong>{userName}</strong>
                <span className="muted tiny">{userEmail}</span>
                <span className="pill" style={{ display: "inline-flex", width: "fit-content" }}>{userRole}</span>
              </div>
              <div className="stack" style={{ gap: 10 }}>
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
                <div className="sidebar-hint">
                  <p className="muted tiny" style={{ margin: 0 }}>
                    Signs you out of this portal only.
                  </p>
                  <p className="muted tiny" style={{ margin: 0 }}>
                    To use a different GitHub user,{" "}
                    <a href="/api/auth/github-web-session" className="sidebar-subtle-link">
                      sign out of GitHub
                    </a>{" "}
                    first.
                  </p>
                </div>
              </div>
            </div>

            <div className="nav-section stack">
              <div>
                <div className="section-label">Navigate</div>
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
            </div>

          </div>
        </aside>

        <main className="main-panel">
          <header className="card card-pad shell-toolbar">
            <div className="toolbar-head">
              <div className="toolbar-copy">
                <div className="section-label">Developer portal</div>
                <h1 className="toolbar-title">{workspaceName}</h1>
                <p className="toolbar-caption muted">
                  Catalog, documentation, and engineering activity for your org.
                </p>
              </div>
              <div className="toolbar-meta">
                <span className="pill pill-strong">
                  <ShieldCheck size={14} />
                  {userRole}
                </span>
              </div>
            </div>
            <GlobalSearch />
          </header>
          {children}
        </main>
      </div>
    </div>
  );
}
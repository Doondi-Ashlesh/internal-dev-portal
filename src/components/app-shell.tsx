import Link from "next/link";
import { Bell, ChevronRight, LogOut, ShieldCheck } from "lucide-react";

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
                <span className="section-label">Platform OS</span>
                <h2 className="sidebar-title">{workspaceName}</h2>
                <p className="muted tiny" style={{ margin: 0 }}>
                  Catalog, docs, ownership, deploy links, and engineering context in one operating surface.
                </p>
              </div>
            </div>

            <div className="info-card workspace-panel stack">
              <div className="row">
                <span className="pill pill-strong">PostgreSQL-backed</span>
                <span className="badge">
                  <ShieldCheck size={14} />
                  Audit-aware
                </span>
              </div>
              <div className="workspace-panel-copy">
                <strong>Engineering control plane</strong>
                <span className="muted tiny">
                  Service ownership, runbooks, activity, and repository context stay stitched together for daily ops.
                </span>
              </div>
            </div>

            <div className="info-card profile-card stack">
              <div className="profile-meta">
                <div className="section-label">Signed In</div>
                <strong>{userName}</strong>
                <span className="muted tiny">{userEmail}</span>
                <span className="pill" style={{ display: "inline-flex", width: "fit-content" }}>{userRole}</span>
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

            <div className="nav-section stack">
              <div>
                <div className="section-label">Navigate</div>
                <p className="nav-caption tiny" style={{ margin: "8px 0 0" }}>
                  Jump between the catalog, docs, activity, and platform administration.
                </p>
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

            <div className="info-card announcement-panel stack">
              <div className="row">
                <div>
                  <div className="section-label">Ops Bulletin</div>
                  <strong style={{ display: "block", marginTop: 8 }}>On-call refresh</strong>
                </div>
                <Bell size={18} className="strong" />
              </div>
              <p className="muted tiny" style={{ margin: 0 }}>
                Platform handoff expectations were updated yesterday. Check the docs area for the new template.
              </p>
              <div className="row" style={{ justifyContent: "flex-start" }}>
                <span className="pill">Runbooks current</span>
                <span className="pill">Escalations aligned</span>
              </div>
            </div>
          </div>
        </aside>

        <main className="main-panel">
          <header className="card card-pad shell-toolbar">
            <div className="toolbar-copy">
              <div>
                <div className="section-label">Workspace cockpit</div>
                <h1 className="toolbar-title">Internal developer portal</h1>
                <p className="toolbar-caption muted">
                  Search the catalog, inspect ownership, and move from docs to operational context without breaking the flow.
                </p>
              </div>
              <div className="toolbar-meta">
                <span className="pill">GitHub sync ready</span>
                <span className="pill">Role guards live</span>
                <span className="pill">Audit trail active</span>
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
import Link from "next/link";
import { ArrowRight, GitBranch, ShieldCheck, Siren } from "lucide-react";

import { WorkspaceSummary } from "@/lib/types";

export function WorkspaceOverview({ workspace }: { workspace: WorkspaceSummary }) {
  return (
    <section className="card card-pad hero">
      <div className="stack-lg" style={{ position: "relative", zIndex: 1 }}>
        <div className="row" style={{ justifyContent: "flex-start" }}>
          <span className="pill">{workspace.memberCount} members</span>
          <span className="pill">GitHub sync ready</span>
          <span className="pill">Role-based access</span>
        </div>
        <div>
          <div className="eyebrow">Engineering Home</div>
          <h1 className="page-title">One place for service ownership, deploy links, docs, and what changed.</h1>
          <p className="muted" style={{ maxWidth: 760, margin: "0 auto 0 0" }}>
            This starter focuses on the core portal loop: catalog services, surface operational context, sync with GitHub,
            and make docs plus activity easy to search.
          </p>
        </div>
        <div className="row" style={{ justifyContent: "flex-start" }}>
          <Link href="/catalog" className="button-link">Explore catalog<ArrowRight size={16} /></Link>
          <Link href="/admin/integrations" className="button-link secondary">Connect GitHub</Link>
        </div>
        <div className="row" style={{ justifyContent: "flex-start" }}>
          <span className="badge" data-tone="success"><ShieldCheck size={14} />Centralized access</span>
          <span className="badge"><GitBranch size={14} />Webhook-driven feed</span>
          <span className="badge" data-tone="warning"><Siren size={14} />Runbook-ready incident context</span>
        </div>
      </div>
    </section>
  );
}

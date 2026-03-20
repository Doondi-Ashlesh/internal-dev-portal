import { BookOpenText, Gauge, Layers3, PlugZap, ScrollText, ShieldCheck } from "lucide-react";

export const appNavigation = [
  { href: "/dashboard", label: "Dashboard", icon: Gauge },
  { href: "/catalog", label: "Catalog", icon: Layers3 },
  { href: "/docs", label: "Docs & runbooks", icon: BookOpenText },
  { href: "/activity", label: "Activity", icon: ScrollText },
  { href: "/admin/integrations", label: "GitHub & webhooks", icon: PlugZap },
  { href: "/admin/members", label: "Members", icon: ShieldCheck }
] as const;

import { BookOpenText, Gauge, Layers3, PlugZap, ScrollText, ShieldCheck } from "lucide-react";

export const appNavigation = [
  { href: "/dashboard", label: "Dashboard", icon: Gauge },
  { href: "/catalog", label: "Service Catalog", icon: Layers3 },
  { href: "/docs", label: "Docs", icon: BookOpenText },
  { href: "/activity", label: "Activity", icon: ScrollText },
  { href: "/admin/integrations", label: "Integrations", icon: PlugZap },
  { href: "/admin/members", label: "Access", icon: ShieldCheck }
] as const;

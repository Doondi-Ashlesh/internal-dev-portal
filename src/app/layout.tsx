import type { Metadata } from "next";

import { validateEnvironment } from "@/lib/env";

import "./globals.css";

validateEnvironment();

export const metadata: Metadata = {
  title: "Internal Developer Portal",
  description: "Backstage-lite for startups: service catalog, docs, ownership, health, and changelog context."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
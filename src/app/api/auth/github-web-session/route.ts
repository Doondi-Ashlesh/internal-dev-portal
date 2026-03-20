import { NextResponse } from "next/server";

import { env } from "@/lib/env";
import { getGithubWebLogoutUrl } from "@/lib/github-oauth";

/**
 * Ends the github.com browser session so the next OAuth authorize hop can choose another account.
 * NextAuth sign-out only clears this app's session cookie.
 */
export function GET() {
  const returnTo = `${env.appBaseUrl}/login`;
  return NextResponse.redirect(getGithubWebLogoutUrl(returnTo));
}

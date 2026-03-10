import { auth } from "@/auth";
import { NextResponse } from "next/server";

const publicPaths = new Set(["/", "/login"]);

export default auth((request) => {
  const { pathname } = request.nextUrl;
  const isLoggedIn = Boolean(request.auth);
  const isApiAuth = pathname.startsWith("/api/auth");
  const isWebhook = pathname.startsWith("/api/webhooks/github");
  const isHealth = pathname.startsWith("/api/health");
  const isPublic = publicPaths.has(pathname);

  if (isApiAuth || isWebhook || isHealth || pathname.startsWith("/_next") || pathname === "/favicon.ico") {
    return NextResponse.next();
  }

  if (!isLoggedIn && !isPublic) {
    return NextResponse.redirect(new URL("/login", request.nextUrl));
  }

  if (isLoggedIn && pathname === "/login") {
    return NextResponse.redirect(new URL("/dashboard", request.nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!.*\\..*).*)"]
};

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/lib/auth";

export default auth(async function middleware(req) {
  const { pathname } = req.nextUrl;
  const session = req.auth;

  // Resolve org from host header
  const host = req.headers.get("host") ?? "";
  const appHost = new URL(
    process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"
  ).host;

  const response = NextResponse.next();

  // Pass org resolution via header for server components
  if (host !== appHost) {
    response.headers.set("x-custom-domain", host);
  }

  // Auth guard for dashboard and org routes
  if (pathname.startsWith("/dashboard") || pathname.startsWith("/org")) {
    if (!session) {
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Attach active org and role from session for server components
    if (session.user.orgId) {
      response.headers.set("x-org-id", session.user.orgId);
    }
    if (session.user.role) {
      response.headers.set("x-user-role", session.user.role);
    }

    // Org admin routes require ADMIN role
    if (pathname.startsWith("/org/")) {
      if (session.user.role !== "ADMIN") {
        return NextResponse.redirect(new URL("/dashboard", req.url));
      }
    }
  }

  return response;
});

export const config = {
  matcher: ["/dashboard/:path*", "/org/:path*"],
};

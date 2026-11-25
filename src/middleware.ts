import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

// Auth gate off while we bootstrap SkibiriDin locally.
// Set CLARA_REQUIRE_AUTH=true (and Better Auth + DB) to enforce login again.
const requireAuth = process.env.CLARA_REQUIRE_AUTH === "true";

export async function middleware(request: NextRequest) {
  if (!requireAuth) {
    return NextResponse.next();
  }

  const sessionCookie = getSessionCookie(request);

  if (!sessionCookie) {
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard", "/dashboard/:path*"],
};

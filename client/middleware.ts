import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Role-based route prefixes. In production, resolve role from session/JWT.
const DASHBOARD_PREFIXES = ["/dashboard", "/vendor", "/shopper", "/survey", "/integrator", "/admin"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  // Optional: redirect unauthenticated users from dashboard routes to login.
  // const isAuth = request.cookies.get("auth")?.value;
  // if (DASHBOARD_PREFIXES.some((p) => pathname.startsWith(p)) && !isAuth) {
  //   return NextResponse.redirect(new URL("/login", request.url));
  // }
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};

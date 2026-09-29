// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const token = request.cookies.get("session_token");
  const { pathname } = request.nextUrl;

  // Define public routes that don't need a cookie check
  const isPublicRoute =
    pathname.startsWith("/login") || 
    pathname.startsWith("/register") || pathname.startsWith("/projects");

  if (!isPublicRoute && !token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
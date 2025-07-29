import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Get authentication tokens from cookies
  const authToken = request.cookies.get("auth_token")?.value;
  const tokenExpiry = request.cookies.get("token_expiry")?.value;
  const userInfo = request.cookies.get("user_info")?.value;

  // Check if user is authenticated
  const isAuthenticated =
    authToken &&
    tokenExpiry &&
    userInfo &&
    parseInt(tokenExpiry, 10) > Date.now();

  // Define protected routes that require authentication
  const protectedRoutes = [
    "/",
    "/surat",
    "/surat/create",
    "/surat/preview",
    "/penduduk",
    "/settings",
  ];

  // Check if the current path is a protected route
  const isProtectedRoute = protectedRoutes.some(
    (route) => pathname === route || pathname.startsWith(route + "/")
  );

  // If user is not authenticated and trying to access protected route
  if (!isAuthenticated && isProtectedRoute) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // If user is authenticated and trying to access login page
  if (isAuthenticated && pathname === "/login") {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - assets (public assets)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|assets).*)",
  ],
};

import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    // Admin routes protection
    if (path.startsWith("/admin") && token?.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    // Dashboard routes require authentication (handled by withAuth)
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const path = req.nextUrl.pathname;
        // Allow public paths
        if (
          path === "/" ||
          path.startsWith("/auth") ||
          path.startsWith("/api/auth") ||
          path.startsWith("/api/webhooks") ||
          path.startsWith("/charities") ||
          path.startsWith("/about") ||
          path.startsWith("/how-it-works")
        ) {
          return true;
        }
        return !!token;
      },
    },
  }
);

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/admin/:path*",
    "/api/scores/:path*",
    "/api/draws/:path*",
    "/api/donations/:path*",
    "/api/profile/:path*",
    "/api/admin/:path*",
  ],
};

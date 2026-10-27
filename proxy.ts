import NextAuth from "next-auth";

import authConfig from "@/auth.config";

/**
 * Next 16 proxy (formerly middleware). Optimistic gate for /admin/*.
 * Real enforcement happens server-side in the admin layout and every
 * server action (requireAdmin) — this is only the fast redirect layer.
 */
const { auth } = NextAuth(authConfig);

export default auth((request) => {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/admin")) {
    if (!request.auth) {
      const loginUrl = new URL("/login", request.nextUrl.origin);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return Response.redirect(loginUrl);
    }
  }

  if (pathname === "/login" && request.auth) {
    return Response.redirect(new URL("/admin", request.nextUrl.origin));
  }

  return undefined;
});

export const config = {
  matcher: ["/admin/:path*", "/login"],
};

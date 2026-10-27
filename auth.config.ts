import type { NextAuthConfig } from "next-auth";

/**
 * Edge-safe Auth.js config shared between the full Node runtime (auth.ts)
 * and proxy.ts. Must not import the Prisma adapter, pg, or argon2.
 */
export default {
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 60 * 60 * 8, // 8 hours
  },
  cookies: {
    sessionToken: {
      options: {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
      },
    },
  },
  providers: [], // configured in auth.ts (Node runtime only)
} satisfies NextAuthConfig;

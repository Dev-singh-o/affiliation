import { cache } from "react";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { prisma } from "@/lib/db/prisma";

export interface SessionUser {
  id: string;
  email: string;
  name: string | null;
  role: "ADMIN" | "EDITOR";
}

/**
 * Session user for the current request, or null.
 * React cache() dedupes per request.
 */
export const getSessionUser = cache(async (): Promise<SessionUser | null> => {
  const session = await auth();
  if (!session?.user?.id) return null;
  return {
    id: session.user.id,
    email: session.user.email ?? "",
    name: session.user.name ?? null,
    role: session.user.role,
  };
});

/**
 * Server-side authorization gate for admin pages and mutations.
 * Verifies the JWT session AND that the user still exists, is active,
 * and holds one of the allowed roles (fresh DB check — a deactivated
 * account loses access immediately, not when the JWT expires).
 */
export async function requireRole(
  roles: Array<"ADMIN" | "EDITOR">,
): Promise<SessionUser> {
  const sessionUser = await getSessionUser();
  if (!sessionUser || !roles.includes(sessionUser.role)) {
    redirect("/login");
  }
  const user = await prisma.user.findUnique({
    where: { id: sessionUser.id },
    select: { id: true, email: true, name: true, role: true, isActive: true },
  });
  if (!user || !user.isActive || !roles.includes(user.role)) {
    redirect("/login");
  }
  return { id: user.id, email: user.email, name: user.name, role: user.role };
}

export function requireAdmin(): Promise<SessionUser> {
  return requireRole(["ADMIN"]);
}

/** Any staff role (admin area access). */
export function requireStaff(): Promise<SessionUser> {
  return requireRole(["ADMIN", "EDITOR"]);
}

/**
 * Non-redirecting check for route handlers.
 * Returns the session user or null (respond 401/403 — never redirect an API).
 */
export async function getStaffApiUser(): Promise<SessionUser | null> {
  const sessionUser = await getSessionUser();
  if (!sessionUser || !["ADMIN", "EDITOR"].includes(sessionUser.role)) {
    return null;
  }
  return sessionUser;
}

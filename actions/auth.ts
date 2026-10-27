"use server";

import { headers } from "next/headers";
import { AuthError } from "next-auth";
import { z } from "zod";

import { signIn, signOut } from "@/auth";
import { rateLimit } from "@/lib/security/rate-limit";

const loginSchema = z.object({
  email: z.email("Enter a valid email address").max(320),
  password: z.string().min(1, "Password is required").max(200),
  callbackUrl: z.string().max(500).optional(),
});

export interface LoginFormState {
  error?: string;
  fieldErrors?: { email?: string[]; password?: string[] };
}

async function clientKey(): Promise<string> {
  const h = await headers();
  const forwarded = h.get("x-forwarded-for");
  return forwarded?.split(",")[0]?.trim() ?? "local";
}

export async function loginAction(
  _prev: LoginFormState,
  formData: FormData,
): Promise<LoginFormState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    callbackUrl: formData.get("callbackUrl") ?? undefined,
  });
  if (!parsed.success) {
    return {
      fieldErrors: {
        email: parsed.error.issues
          .filter((i) => i.path[0] === "email")
          .map((i) => i.message),
        password: parsed.error.issues
          .filter((i) => i.path[0] === "password")
          .map((i) => i.message),
      },
    };
  }

  // Brute-force protection: 5 attempts per 5 minutes per client+email.
  const key = await clientKey();
  const limited = rateLimit({
    namespace: "login",
    key: `${key}:${parsed.data.email.toLowerCase()}`,
    limit: 5,
    windowSeconds: 300,
  });
  if (!limited.ok) {
    return {
      error: `Too many attempts. Try again in ${limited.retryAfterSeconds} seconds.`,
    };
  }

  // Only allow same-site relative callback URLs (no open redirects).
  const callbackUrl =
    parsed.data.callbackUrl?.startsWith("/") &&
    !parsed.data.callbackUrl.startsWith("//")
      ? parsed.data.callbackUrl
      : "/admin";

  try {
    await signIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      redirectTo: callbackUrl,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "Invalid email or password." };
    }
    throw error; // NEXT_REDIRECT on success
  }
  return {};
}

export async function logoutAction(): Promise<void> {
  await signOut({ redirectTo: "/" });
}

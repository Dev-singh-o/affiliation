import { PrismaPg } from "@prisma/adapter-pg";

import { getEnv } from "@/lib/env";
import { PrismaClient } from "@/lib/generated/prisma/client";

/**
 * Lazily-created Prisma client singleton.
 *
 * Uses the Neon pooled connection (DATABASE_URL) through the pg driver
 * adapter. The pool is deliberately small (max 1) because this app runs on
 * serverless (Vercel), where every instance is isolated — a large pool per
 * instance exhausts Neon's connection budget and causes "connection
 * terminated" errors during parallel builds.
 *
 * keepAlive prevents the Neon pooler from silently dropping idle sockets.
 */
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function createClient(): PrismaClient {
  const adapter = new PrismaPg({
    connectionString: getEnv().DATABASE_URL,
    // Neon terminates TLS with a cert chain that node-postgres does not
    // always verify; match Prisma v6 behaviour.
    ssl: { rejectUnauthorized: false },
    max: 1,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 10_000,
    keepAlive: true,
    keepAliveInitialDelayMillis: 10_000,
  });
  return new PrismaClient({
    adapter,
    log:
      process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });
}

export function getPrisma(): PrismaClient {
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = createClient();
  }
  return globalForPrisma.prisma;
}

export const prisma: PrismaClient = new Proxy({} as PrismaClient, {
  get(_target, prop, receiver) {
    const client = getPrisma();
    const value = Reflect.get(client, prop, receiver);
    return typeof value === "function" ? value.bind(client) : value;
  },
});

/** True for transient connectivity failures worth retrying. */
function isTransientConnectionError(error: unknown): boolean {
  const message =
    error instanceof Error ? error.message : String(error ?? "");
  return (
    message.includes("Connection terminated") ||
    message.includes("connection timeout") ||
    message.includes("ETIMEDOUT") ||
    message.includes("ECONNRESET") ||
    message.includes("ENOTFOUND") ||
    message.includes("EAI_AGAIN") ||
    message.includes("Can't reach database server")
  );
}

/**
 * Run a query, retrying once on transient connection failures.
 * Used by cached storefront reads so a brief network blip does not empty a
 * section (or fail a page render).
 */
export async function withRetry<T>(
  operation: () => Promise<T>,
  retries = 2,
): Promise<T> {
  let lastError: unknown;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      if (!isTransientConnectionError(error) || attempt === retries) {
        throw error;
      }
      await new Promise((resolve) =>
        setTimeout(resolve, 250 * (attempt + 1)),
      );
    }
  }
  throw lastError;
}

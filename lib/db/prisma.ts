import { PrismaPg } from "@prisma/adapter-pg";

import { getEnv } from "@/lib/env";
import { PrismaClient } from "@/lib/generated/prisma/client";

/**
 * Lazily-created Prisma client singleton.
 * Uses the Neon pooled connection (DATABASE_URL) through the pg driver adapter.
 * Lazy so `next build` does not require a reachable database.
 */
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function createClient(): PrismaClient {
  const adapter = new PrismaPg({
    connectionString: getEnv().DATABASE_URL,
    // Neon requires TLS; sslmode=require in the URL handles it. Kept explicit
    // for providers whose poolers present valid certs (matches Prisma v6 behavior).
    ssl: { rejectUnauthorized: false },
    max: 5,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 10_000,
  });
  return new PrismaClient({ adapter });
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

/**
 * First-admin bootstrap (protected setup command — no public registration).
 *
 * Usage:
 *   npm run create-admin -- --email you@example.com --password "YourPass123" [--name "Your Name"]
 *
 * Creates the user if missing, or updates the password/role of an existing
 * account. Safe to re-run. Requires DATABASE_URL in .env.
 */
import "dotenv/config";

import { PrismaPg } from "@prisma/adapter-pg";

import { PrismaClient } from "../lib/generated/prisma/client";
import {
  hashPassword,
  validatePasswordStrength,
} from "../lib/security/passwords";

function arg(flag: string): string | undefined {
  const index = process.argv.indexOf(flag);
  return index !== -1 ? process.argv[index + 1] : undefined;
}

async function main() {
  const email = arg("--email")?.toLowerCase().trim();
  const password = arg("--password");
  const name = arg("--name")?.trim() ?? null;

  if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    console.error("Error: pass a valid --email");
    process.exit(1);
  }
  if (!password) {
    console.error("Error: pass --password");
    process.exit(1);
  }
  const weakness = validatePasswordStrength(password);
  if (weakness) {
    console.error(`Error: ${weakness}`);
    process.exit(1);
  }

  const connectionString =
    process.env.DIRECT_URL ?? process.env.DATABASE_URL;
  if (!connectionString) {
    console.error("Error: set DIRECT_URL or DATABASE_URL in .env");
    process.exit(1);
  }

  const adapter = new PrismaPg({
    connectionString,
    ssl: { rejectUnauthorized: false },
  });
  const prisma = new PrismaClient({ adapter });

  try {
    const passwordHash = await hashPassword(password);
    const user = await prisma.user.upsert({
      where: { email },
      create: {
        email,
        name,
        passwordHash,
        role: "ADMIN",
        isActive: true,
      },
      update: {
        passwordHash,
        role: "ADMIN",
        isActive: true,
        ...(name ? { name } : {}),
      },
      select: { id: true, email: true, role: true },
    });
    console.log(`Admin ready: ${user.email} (role ${user.role})`);
    console.log("Sign in at /login");
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

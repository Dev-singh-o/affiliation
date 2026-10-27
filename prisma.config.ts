import "dotenv/config";
import { defineConfig } from "prisma/config";

// Prisma CLI (migrations, db push, seed) connects here.
// Neon: use the UNPOOLED/direct endpoint for migrations (DIRECT_URL).
// Falls back to DATABASE_URL so single-URL setups still work.
const datasourceUrl = process.env.DIRECT_URL ?? process.env.DATABASE_URL;

if (!datasourceUrl) {
  throw new Error(
    "DIRECT_URL or DATABASE_URL must be set for Prisma CLI commands. See .env.example.",
  );
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    url: datasourceUrl,
  },
});

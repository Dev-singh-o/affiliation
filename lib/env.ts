import { z } from "zod";

/**
 * Central environment validation.
 * Secrets stay server-side — never expose them through NEXT_PUBLIC_*.
 * Validation is lazy (on first access) so `next build` works without a live DB.
 */

const serverEnvSchema = z.object({
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  AUTH_SECRET: z.string().min(1, "AUTH_SECRET is required"),
  AUTH_URL: z.url().optional(),
  NEXT_PUBLIC_SITE_URL: z.url().default("http://localhost:3000"),
  STORAGE_DRIVER: z.enum(["s3", "local"]).optional(),
  S3_ENDPOINT: z.string().optional(),
  S3_REGION: z.string().optional(),
  S3_BUCKET: z.string().optional(),
  S3_ACCESS_KEY_ID: z.string().optional(),
  S3_SECRET_ACCESS_KEY: z.string().optional(),
  S3_PUBLIC_URL: z.string().optional(),
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
});

export type ServerEnv = z.infer<typeof serverEnvSchema>;

let cached: ServerEnv | null = null;

/** Validated server environment. Throws with a clear message when invalid. */
export function getEnv(): ServerEnv {
  if (cached) return cached;
  const parsed = serverEnvSchema.safeParse(process.env);
  if (!parsed.success) {
    const issues = parsed.error.issues
      .map((i) => `  - ${i.path.join(".")}: ${i.message}`)
      .join("\n");
    throw new Error(
      `Invalid environment configuration:\n${issues}\nSee .env.example for the required variables.`,
    );
  }
  cached = parsed.data;
  return cached;
}

/** Resolved storage driver: explicit STORAGE_DRIVER wins; otherwise infer. */
export function getStorageDriver(): "s3" | "local" {
  const env = getEnv();
  if (env.STORAGE_DRIVER) return env.STORAGE_DRIVER;
  const hasS3 =
    env.S3_ENDPOINT &&
    env.S3_BUCKET &&
    env.S3_ACCESS_KEY_ID &&
    env.S3_SECRET_ACCESS_KEY;
  return hasS3 ? "s3" : "local";
}

/** Base URL used for canonical links, sitemap, OG tags, and absolute URLs. */
export function getSiteUrl(): string {
  return getEnv().NEXT_PUBLIC_SITE_URL.replace(/\/+$/, "");
}

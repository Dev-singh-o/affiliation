import { randomBytes } from "node:crypto";

import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

import { getEnv, getStorageDriver } from "@/lib/env";

export const UPLOAD_MAX_BYTES = 5 * 1024 * 1024; // 5 MB

const ALLOWED_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
  "image/gif": "gif",
};

export type UploadValidation =
  | { ok: true; extension: string }
  | { ok: false; error: string };

export function validateUpload(input: {
  contentType: string;
  size: number;
}): UploadValidation {
  const extension = ALLOWED_TYPES[input.contentType];
  if (!extension) {
    return {
      ok: false,
      error: `Unsupported file type "${input.contentType}". Use JPEG, PNG, WebP, AVIF, or GIF.`,
    };
  }
  if (!Number.isFinite(input.size) || input.size <= 0) {
    return { ok: false, error: "Invalid file size." };
  }
  if (input.size > UPLOAD_MAX_BYTES) {
    return {
      ok: false,
      error: `File too large. Maximum is ${UPLOAD_MAX_BYTES / 1024 / 1024} MB.`,
    };
  }
  return { ok: true, extension };
}

export function generateStorageKey(extension: string): string {
  const now = new Date();
  const rand = randomBytes(12).toString("hex");
  return `uploads/${now.getUTCFullYear()}/${String(now.getUTCMonth() + 1).padStart(2, "0")}/${rand}.${extension}`;
}

let s3Client: S3Client | null = null;

function getS3Client(): S3Client {
  if (s3Client) return s3Client;
  const env = getEnv();
  s3Client = new S3Client({
    region: env.S3_REGION ?? "auto",
    endpoint: env.S3_ENDPOINT,
    credentials: {
      accessKeyId: env.S3_ACCESS_KEY_ID ?? "",
      secretAccessKey: env.S3_SECRET_ACCESS_KEY ?? "",
    },
    forcePathStyle: true, // required by most S3-compatible providers
  });
  return s3Client;
}

export interface SignedUpload {
  driver: "s3" | "local";
  /** URL the browser PUTs the file to. */
  uploadUrl: string;
  /** Extra headers the browser must send. */
  headers: Record<string, string>;
  /** Final public URL of the object after upload. */
  publicUrl: string;
  key: string;
}

/**
 * Create a server-authorized upload target.
 * Privileged credentials never reach the browser — only a short-lived
 * presigned URL (S3) or an authenticated local endpoint (dev).
 */
export async function createSignedUpload(input: {
  contentType: string;
  size: number;
}): Promise<SignedUpload> {
  const validation = validateUpload(input);
  if (!validation.ok) throw new Error(validation.error);

  const key = generateStorageKey(validation.extension);
  const driver = getStorageDriver();

  if (driver === "local") {
    if (getEnv().NODE_ENV === "production" && getEnv().STORAGE_DRIVER !== "local") {
      throw new Error("Local storage driver is not allowed in production.");
    }
    return {
      driver: "local",
      uploadUrl: `/api/uploads/local?key=${encodeURIComponent(key)}`,
      headers: { "content-type": input.contentType },
      publicUrl: `/${key}`,
      key,
    };
  }

  const env = getEnv();
  if (!env.S3_BUCKET || !env.S3_PUBLIC_URL) {
    throw new Error("S3 storage is not configured (S3_BUCKET / S3_PUBLIC_URL).");
  }

  const command = new PutObjectCommand({
    Bucket: env.S3_BUCKET,
    Key: key,
    ContentType: input.contentType,
    ContentLength: input.size,
  });
  const uploadUrl = await getSignedUrl(getS3Client(), command, {
    expiresIn: 300,
  });

  return {
    driver: "s3",
    uploadUrl,
    headers: { "content-type": input.contentType },
    publicUrl: `${env.S3_PUBLIC_URL.replace(/\/+$/, "")}/${key}`,
    key,
  };
}

/** Whether the local dev driver handles this storage key. */
export function isLocalKey(key: string): boolean {
  return /^uploads\/\d{4}\/\d{2}\/[0-9a-f]{24}\.[a-z0-9]+$/.test(key);
}

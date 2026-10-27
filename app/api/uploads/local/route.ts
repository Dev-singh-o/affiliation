import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

import { getStaffApiUser } from "@/lib/auth/session";
import {
  UPLOAD_MAX_BYTES,
  isLocalKey,
  validateUpload,
} from "@/lib/storage";

/**
 * PUT /api/uploads/local?key=...
 * Development-only storage driver: writes the file into public/uploads.
 * Authenticated + re-validated server-side (type, size, key pattern).
 */
export async function PUT(request: Request) {
  const user = await getStaffApiUser();
  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const key = searchParams.get("key") ?? "";
  if (!isLocalKey(key)) {
    return Response.json({ error: "Invalid storage key" }, { status: 400 });
  }

  const contentType = request.headers.get("content-type") ?? "";
  const buffer = Buffer.from(await request.arrayBuffer());
  const validation = validateUpload({ contentType, size: buffer.byteLength });
  if (!validation.ok) {
    return Response.json({ error: validation.error }, { status: 400 });
  }
  if (buffer.byteLength > UPLOAD_MAX_BYTES) {
    return Response.json({ error: "File too large" }, { status: 400 });
  }

  const filePath = path.join(process.cwd(), "public", key);
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, buffer);

  return Response.json({ ok: true, publicUrl: `/${key}` });
}

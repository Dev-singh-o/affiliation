import { z } from "zod";

import { getStaffApiUser } from "@/lib/auth/session";
import { createSignedUpload } from "@/lib/storage";

const signRequestSchema = z.object({
  contentType: z.string().max(100),
  size: z.number().int().positive(),
});

/**
 * POST /api/uploads/sign
 * Server-authorized upload signing. Requires an authenticated staff session;
 * never exposes storage credentials — returns a short-lived presigned URL.
 */
export async function POST(request: Request) {
  const user = await getStaffApiUser();
  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = signRequestSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: "Invalid upload request" }, { status: 400 });
  }

  try {
    const signed = await createSignedUpload(parsed.data);
    return Response.json(signed);
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Upload rejected" },
      { status: 400 },
    );
  }
}

"use client";

/**
 * Client-side upload flow: ask the server to authorize the upload,
 * then PUT the file to the returned URL. No credentials in the browser.
 */
export async function uploadImage(file: File): Promise<{ publicUrl: string }> {
  const signResponse = await fetch("/api/uploads/sign", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ contentType: file.type, size: file.size }),
  });
  if (!signResponse.ok) {
    const body = (await signResponse.json().catch(() => null)) as {
      error?: string;
    } | null;
    throw new Error(body?.error ?? "Could not authorize the upload");
  }

  const signed = (await signResponse.json()) as {
    uploadUrl: string;
    headers: Record<string, string>;
    publicUrl: string;
  };

  const uploadResponse = await fetch(signed.uploadUrl, {
    method: "PUT",
    headers: signed.headers,
    body: file,
  });
  if (!uploadResponse.ok) {
    throw new Error("Upload failed. Please try again.");
  }

  return { publicUrl: signed.publicUrl };
}

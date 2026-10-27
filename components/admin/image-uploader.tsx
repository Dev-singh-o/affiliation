"use client";

import { useState } from "react";
import { Loader2Icon, UploadIcon } from "lucide-react";

import { uploadImage } from "@/lib/storage/upload-client";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export function ImageUploader({
  onChange,
  value,
  alt = "",
  onAltChange,
}: {
  value?: string;
  alt?: string;
  onAltChange?: (alt: string) => void;
  onChange: (url: string) => void;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState(value ?? "");

  async function handleFile(file: File) {
    setBusy(true);
    setError(null);
    try {
      const { publicUrl } = await uploadImage(file);
      setPreview(publicUrl);
      onChange(publicUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid gap-3">
      <div className="flex items-center gap-3">
        <input
          type="file"
          accept="image/*"
          id="img-upload"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) void handleFile(file);
            e.target.value = "";
          }}
        />
        <label htmlFor="img-upload">
          <Button
            type="button"
            variant="outline"
            disabled={busy}
            onClick={() => document.getElementById("img-upload")?.click()}
          >
            {busy ? (
              <Loader2Icon className="animate-spin" />
            ) : (
              <UploadIcon />
            )}
            {busy ? "Uploading…" : "Choose image"}
          </Button>
        </label>
        {preview ? (
          <div className="relative h-16 w-16 overflow-hidden rounded-md border">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={preview} alt="" className="h-full w-full object-cover" />
          </div>
        ) : null}
      </div>
      {onAltChange ? (
        <input
          type="text"
          placeholder="Alt text (optional)"
          value={alt}
          onChange={(e) => onAltChange(e.target.value)}
          className="border-input flex h-9 w-full rounded-md border bg-transparent px-3 text-sm"
        />
      ) : null}
      {error ? <p className="text-destructive text-sm">{error}</p> : null}
      {preview ? (
        <p className="text-muted-foreground truncate text-xs">{preview}</p>
      ) : null}
    </div>
  );
}

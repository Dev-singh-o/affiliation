"use client";

import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { saveSettings } from "@/actions/settings";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { brandingSchema } from "@/lib/validation/settings";
import type { BrandingSettings } from "@/lib/settings/types";
import { ImageUploader } from "@/components/admin/image-uploader";

export function BrandingSettingsForm({
  initial,
}: {
  initial: BrandingSettings;
}) {
  const [pending, startTransition] = useTransition();
  const form = useForm<BrandingSettings>({
    resolver: zodResolver(brandingSchema) as never,
    defaultValues: initial,
  });

  function onSubmit(values: BrandingSettings) {
    startTransition(async () => {
      const result = await saveSettings("branding", values);
      if (result.ok) toast.success("Branding saved");
      else toast.error(result.error);
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Branding</CardTitle>
        <CardDescription>
          Website name, creator name, tagline, logo, favicon, and brand color.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="siteName">Website name</Label>
            <Input id="siteName" {...form.register("siteName")} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="creatorName">Creator name</Label>
            <Input id="creatorName" {...form.register("creatorName")} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="tagline">Tagline</Label>
            <Input id="tagline" {...form.register("tagline")} />
          </div>
          <div className="grid gap-2">
            <Label>Logo</Label>
            <ImageUploader
              value={form.watch("logoUrl")}
              alt=""
              onChange={(url) => form.setValue("logoUrl", url)}
            />
          </div>
          <div className="grid gap-2">
            <Label>Favicon</Label>
            <ImageUploader
              value={form.watch("faviconUrl")}
              alt=""
              onChange={(url) => form.setValue("faviconUrl", url)}
            />
          </div>
          <div className="grid gap-2">
            <Label>Creator profile image</Label>
            <ImageUploader
              value={form.watch("profileImageUrl")}
              alt=""
              onChange={(url) => form.setValue("profileImageUrl", url)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="primaryColor">Brand color (hex)</Label>
            <Input id="primaryColor" {...form.register("primaryColor")} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="defaultOgImageUrl">Default OG image URL</Label>
            <Input id="defaultOgImageUrl" {...form.register("defaultOgImageUrl")} />
          </div>
          <Button type="submit" disabled={pending}>
            {pending ? "Saving…" : "Save branding"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

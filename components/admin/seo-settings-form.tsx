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
import { seoSchema } from "@/lib/validation/settings";
import type { SeoSettings } from "@/lib/settings/types";

export function SeoSettingsForm({ initial }: { initial: SeoSettings }) {
  const [pending, startTransition] = useTransition();
  const form = useForm<SeoSettings>({
    resolver: zodResolver(seoSchema) as never,
    defaultValues: initial,
  });

  function onSubmit(values: SeoSettings) {
    startTransition(async () => {
      const result = await saveSettings("seo", values);
      if (result.ok) toast.success("SEO saved");
      else toast.error(result.error);
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>SEO</CardTitle>
        <CardDescription>
          Default title, template, description, OG image, indexing preference.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="siteTitle">Site title</Label>
            <Input id="siteTitle" {...form.register("siteTitle")} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="titleTemplate">Title template</Label>
            <Input id="titleTemplate" {...form.register("titleTemplate")} />
            <p className="text-muted-foreground text-xs">
              Use {"%s"} for the page title.
            </p>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="defaultDescription">Default description</Label>
            <Textarea id="defaultDescription" rows={3} {...form.register("defaultDescription")} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="defaultOgImageUrl">Default OG image URL</Label>
            <Input id="defaultOgImageUrl" {...form.register("defaultOgImageUrl")} />
          </div>
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="allowIndexing"
              {...form.register("allowIndexing")}
            />
            <Label htmlFor="allowIndexing">Allow search engine indexing</Label>
          </div>
          <Button type="submit" disabled={pending}>
            {pending ? "Saving…" : "Save SEO"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

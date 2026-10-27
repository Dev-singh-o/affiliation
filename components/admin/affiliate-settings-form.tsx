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
import { affiliateSchema } from "@/lib/validation/settings";
import type { AffiliateSettings } from "@/lib/settings/types";

export function AffiliateSettingsForm({
  initial,
}: {
  initial: AffiliateSettings;
}) {
  const [pending, startTransition] = useTransition();
  const form = useForm<AffiliateSettings>({
    resolver: zodResolver(affiliateSchema) as never,
    defaultValues: initial,
  });

  function onSubmit(values: AffiliateSettings) {
    startTransition(async () => {
      const result = await saveSettings("affiliate", values);
      if (result.ok) toast.success("Affiliate settings saved");
      else toast.error(result.error);
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Affiliate</CardTitle>
        <CardDescription>
          Disclosure text, approved retailer domains, default CTA label,
          campaign labels.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="disclosureText">Disclosure text</Label>
            <Textarea id="disclosureText" rows={4} {...form.register("disclosureText")} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="approvedDomains">Approved retailer domains</Label>
            <Textarea
              id="approvedDomains"
              rows={3}
              value={form.watch("approvedDomains").join(", ")}
              onChange={(e) =>
                form.setValue(
                  "approvedDomains",
                  e.target.value
                    .split(",")
                    .map((v) => v.trim())
                    .filter(Boolean),
                )
              }
              placeholder="example.com, another.com"
            />
            <p className="text-muted-foreground text-xs">
              Comma-separated. Empty = allow any valid http(s) URL.
            </p>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="defaultCtaLabel">Default CTA label</Label>
            <Input id="defaultCtaLabel" {...form.register("defaultCtaLabel")} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="campaignLabels">Campaign labels</Label>
            <Input
              id="campaignLabels"
              value={form.watch("campaignLabels").join(", ")}
              onChange={(e) =>
                form.setValue(
                  "campaignLabels",
                  e.target.value
                    .split(",")
                    .map((v) => v.trim().toLowerCase())
                    .filter(Boolean),
                )
              }
            />
          </div>
          <Button type="submit" disabled={pending}>
            {pending ? "Saving…" : "Save affiliate settings"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

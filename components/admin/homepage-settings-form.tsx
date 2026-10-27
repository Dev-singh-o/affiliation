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
import { homepageSchema } from "@/lib/validation/settings";
import type { HomepageSettings } from "@/lib/settings/types";

export function HomepageSettingsForm({
  initial,
}: {
  initial: HomepageSettings;
}) {
  const [pending, startTransition] = useTransition();
  const form = useForm<HomepageSettings>({
    resolver: zodResolver(homepageSchema) as never,
    defaultValues: initial,
  });

  function onSubmit(values: HomepageSettings) {
    startTransition(async () => {
      const result = await saveSettings("homepage", values);
      if (result.ok) toast.success("Homepage saved");
      else toast.error(result.error);
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Homepage</CardTitle>
        <CardDescription>
          Hero content and homepage sections. Section ordering is controlled by
          the &quot;order&quot; field.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="hero.title">Hero title</Label>
            <Input id="hero.title" {...form.register("hero.title")} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="hero.subtitle">Hero subtitle</Label>
            <Textarea id="hero.subtitle" rows={2} {...form.register("hero.subtitle")} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="hero.intro">Hero intro</Label>
            <Textarea id="hero.intro" rows={2} {...form.register("hero.intro")} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="hero.imageUrl">Hero image URL</Label>
            <Input id="hero.imageUrl" {...form.register("hero.imageUrl")} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-2">
              <Label htmlFor="hero.primaryCtaLabel">Primary CTA label</Label>
              <Input id="hero.primaryCtaLabel" {...form.register("hero.primaryCtaLabel")} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="hero.primaryCtaHref">Primary CTA href</Label>
              <Input id="hero.primaryCtaHref" {...form.register("hero.primaryCtaHref")} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-2">
              <Label htmlFor="hero.secondaryCtaLabel">Secondary CTA label</Label>
              <Input id="hero.secondaryCtaLabel" {...form.register("hero.secondaryCtaLabel")} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="hero.secondaryCtaHref">Secondary CTA href</Label>
              <Input id="hero.secondaryCtaHref" {...form.register("hero.secondaryCtaHref")} />
            </div>
          </div>

          <div className="grid gap-2">
            <Label>Sections (JSON)</Label>
            <Textarea
              rows={12}
              className="font-mono text-xs"
              value={JSON.stringify(form.watch("sections"), null, 2)}
              onChange={(e) => {
                try {
                  form.setValue("sections", JSON.parse(e.target.value));
                } catch {
                  /* ignore parse errors while typing */
                }
              }}
            />
            <p className="text-muted-foreground text-xs">
              Edit section titles, visibility, ordering, limits, and product
              picks here. Full visual editor is a future enhancement.
            </p>
          </div>

          <Button type="submit" disabled={pending}>
            {pending ? "Saving…" : "Save homepage"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

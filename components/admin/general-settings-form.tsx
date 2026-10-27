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
import { generalSchema } from "@/lib/validation/settings";
import type { GeneralSettings } from "@/lib/settings/types";

export function GeneralSettingsForm({ initial }: { initial: GeneralSettings }) {
  const [pending, startTransition] = useTransition();
  const form = useForm<GeneralSettings>({
    resolver: zodResolver(generalSchema) as never,
    defaultValues: initial,
  });

  function onSubmit(values: GeneralSettings) {
    startTransition(async () => {
      const result = await saveSettings("general", values);
      if (result.ok) toast.success("General settings saved");
      else toast.error(result.error);
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>General</CardTitle>
        <CardDescription>
          Default currency, locale, timezone, page size, analytics retention,
          default sort.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="defaultCurrency">Default currency</Label>
            <Input id="defaultCurrency" {...form.register("defaultCurrency")} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="locale">Locale</Label>
            <Input id="locale" {...form.register("locale")} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="timezone">Timezone</Label>
            <Input id="timezone" {...form.register("timezone")} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="productsPerPage">Products per page</Label>
            <Input
              id="productsPerPage"
              type="number"
              {...form.register("productsPerPage", { valueAsNumber: true })}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="analyticsRetentionDays">
              Analytics retention (days, 0 = forever)
            </Label>
            <Input
              id="analyticsRetentionDays"
              type="number"
              {...form.register("analyticsRetentionDays", { valueAsNumber: true })}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="defaultSort">Default sort</Label>
            <select
              id="defaultSort"
              className="border-input flex h-9 rounded-md border bg-transparent px-3 text-sm"
              {...form.register("defaultSort")}
            >
              <option value="newest">Newest</option>
              <option value="name">Name</option>
              <option value="popular">Popular</option>
            </select>
          </div>
          <Button type="submit" disabled={pending}>
            {pending ? "Saving…" : "Save general settings"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

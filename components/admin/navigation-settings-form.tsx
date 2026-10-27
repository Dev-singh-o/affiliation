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
import { navigationSchema } from "@/lib/validation/settings";
import type { NavigationSettings } from "@/lib/settings/types";

export function NavigationSettingsForm({
  initial,
}: {
  initial: NavigationSettings;
}) {
  const [pending, startTransition] = useTransition();
  const form = useForm<NavigationSettings>({
    resolver: zodResolver(navigationSchema) as never,
    defaultValues: initial,
  });

  function onSubmit(values: NavigationSettings) {
    startTransition(async () => {
      const result = await saveSettings("navigation", values);
      if (result.ok) toast.success("Navigation saved");
      else toast.error(result.error);
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Navigation</CardTitle>
        <CardDescription>
          Header and footer menu items (JSON). Edit labels, hrefs, order,
          visibility, and external flags.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
          <div className="grid gap-2">
            <Label>Header items (JSON)</Label>
            <textarea
              rows={10}
              className="border-input w-full rounded-md border bg-transparent p-3 font-mono text-xs"
              value={JSON.stringify(form.watch("header"), null, 2)}
              onChange={(e) => {
                try {
                  form.setValue("header", JSON.parse(e.target.value));
                } catch {
                  /* ignore */
                }
              }}
            />
          </div>
          <div className="grid gap-2">
            <Label>Footer items (JSON)</Label>
            <textarea
              rows={10}
              className="border-input w-full rounded-md border bg-transparent p-3 font-mono text-xs"
              value={JSON.stringify(form.watch("footer"), null, 2)}
              onChange={(e) => {
                try {
                  form.setValue("footer", JSON.parse(e.target.value));
                } catch {
                  /* ignore */
                }
              }}
            />
          </div>
          <Button type="submit" disabled={pending}>
            {pending ? "Saving…" : "Save navigation"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

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
import { socialSchema } from "@/lib/validation/settings";
import type { SocialSettings } from "@/lib/settings/types";

export function SocialSettingsForm({ initial }: { initial: SocialSettings }) {
  const [pending, startTransition] = useTransition();
  const form = useForm<SocialSettings>({
    resolver: zodResolver(socialSchema) as never,
    defaultValues: initial,
  });

  function onSubmit(values: SocialSettings) {
    startTransition(async () => {
      const result = await saveSettings("social", values);
      if (result.ok) toast.success("Social links saved");
      else toast.error(result.error);
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Social links</CardTitle>
        <CardDescription>
          Social profiles shown in the header/footer (JSON).
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
          <div className="grid gap-2">
            <Label>Social links (JSON)</Label>
            <textarea
              rows={12}
              className="border-input w-full rounded-md border bg-transparent p-3 font-mono text-xs"
              value={JSON.stringify(form.watch("links"), null, 2)}
              onChange={(e) => {
                try {
                  form.setValue("links", JSON.parse(e.target.value));
                } catch {
                  /* ignore */
                }
              }}
            />
            <p className="text-muted-foreground text-xs">
              Each entry: {"{ id, platform, url, label?, enabled, order }"}.
            </p>
          </div>
          <Button type="submit" disabled={pending}>
            {pending ? "Saving…" : "Save social links"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

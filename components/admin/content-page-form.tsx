"use client";

import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Trash2Icon } from "lucide-react";

import {
  createContentPage,
  updateContentPage,
  deleteContentPage,
} from "@/actions/content";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { contentPageSchema } from "@/lib/validation/catalog";
import type { ContentPageInput } from "@/lib/validation/catalog";

const defaults: ContentPageInput = {
  title: "",
  slug: undefined,
  content: "",
  status: "DRAFT",
  seoTitle: undefined,
  seoDescription: undefined,
};

export function ContentPageForm({
  id,
  initial,
}: {
  id?: string;
  initial?: Partial<ContentPageInput>;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const form = useForm<ContentPageInput>({
    resolver: zodResolver(contentPageSchema) as never,
    defaultValues: { ...defaults, ...initial },
  });

  function onSubmit(values: ContentPageInput) {
    startTransition(async () => {
      const result = id
        ? await updateContentPage(id, values)
        : await createContentPage(values);
      if (result.ok) {
        toast.success(id ? "Page updated" : "Page created");
        router.push("/admin/content");
        router.refresh();
      } else toast.error(result.error);
    });
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
      <div className="grid gap-2">
        <Label htmlFor="title">Title</Label>
        <Input id="title" {...form.register("title")} />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="slug">Slug (optional)</Label>
        <Input id="slug" {...form.register("slug")} />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="content">Content (Markdown)</Label>
        <Textarea id="content" rows={14} {...form.register("content")} />
        <p className="text-muted-foreground text-xs">
          Markdown is supported. HTML is sanitized on render.
        </p>
      </div>
      <div className="grid gap-2">
        <Label htmlFor="status">Status</Label>
        <select
          id="status"
          className="border-input flex h-9 rounded-md border bg-transparent px-3 text-sm"
          {...form.register("status")}
        >
          <option value="DRAFT">Draft</option>
          <option value="PUBLISHED">Published</option>
          <option value="ARCHIVED">Archived</option>
        </select>
      </div>
      <div className="grid gap-2">
        <Label htmlFor="seoTitle">SEO title</Label>
        <Input id="seoTitle" {...form.register("seoTitle")} />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="seoDescription">SEO description</Label>
        <Textarea id="seoDescription" rows={2} {...form.register("seoDescription")} />
      </div>
      <div className="flex gap-2">
        <Button type="submit" disabled={pending}>
          {pending ? "Saving…" : id ? "Update page" : "Create page"}
        </Button>
        {id ? (
          <Button
            type="button"
            variant="destructive"
            disabled={pending}
            onClick={() => {
              if (!confirm("Delete this page?")) return;
              startTransition(async () => {
                const result = await deleteContentPage(id);
                if (result.ok) {
                  toast.success("Deleted");
                  router.push("/admin/content");
                  router.refresh();
                } else toast.error(result.error);
              });
            }}
          >
            <Trash2Icon />
            Delete
          </Button>
        ) : null}
      </div>
    </form>
  );
}

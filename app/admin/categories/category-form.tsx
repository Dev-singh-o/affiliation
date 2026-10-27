"use client";

import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

import { createCategory, updateCategory } from "@/actions/categories";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { categorySchema } from "@/lib/validation/catalog";
import type { CategoryInput } from "@/lib/validation/catalog";
import { ImageUploader } from "@/components/admin/image-uploader";

type CategoryFormProps = {
  id?: string;
  initial?: Partial<CategoryInput>;
};

const defaults: CategoryInput = {
  name: "",
  slug: undefined,
  description: undefined,
  imageUrl: undefined,
  status: "ACTIVE",
  featured: false,
  displayOrder: 0,
  seoTitle: undefined,
  seoDescription: undefined,
};

export function CategoryForm({ id, initial }: CategoryFormProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const form = useForm<CategoryInput>({
    resolver: zodResolver(categorySchema) as never,
    defaultValues: { ...defaults, ...initial },
  });

  function onSubmit(values: CategoryInput) {
    startTransition(async () => {
      const result = id
        ? await updateCategory(id, values)
        : await createCategory(values);
      if (result.ok) {
        toast.success(id ? "Category updated" : "Category created");
        router.push("/admin/categories");
        router.refresh();
      } else {
        toast.error(result.error);
      }
    });
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
      <div className="grid gap-2">
        <Label htmlFor="name">Name</Label>
        <Input id="name" {...form.register("name")} />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="slug">Slug (optional)</Label>
        <Input id="slug" {...form.register("slug")} />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" rows={3} {...form.register("description")} />
      </div>
      <div className="grid gap-2">
        <Label>Image</Label>
        <ImageUploader
          value={form.watch("imageUrl")}
          onChange={(url) => form.setValue("imageUrl", url)}
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="grid gap-2">
          <Label htmlFor="status">Status</Label>
          <select
            id="status"
            className="border-input flex h-9 rounded-md border bg-transparent px-3 text-sm"
            {...form.register("status")}
          >
            <option value="ACTIVE">Active</option>
            <option value="ARCHIVED">Archived</option>
          </select>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="displayOrder">Display order</Label>
          <Input
            id="displayOrder"
            type="number"
            {...form.register("displayOrder", { valueAsNumber: true })}
          />
        </div>
      </div>
      <div className="flex items-center gap-3">
        <Switch
          checked={form.watch("featured")}
          onCheckedChange={(v) => form.setValue("featured", v)}
        />
        <Label>Featured</Label>
      </div>
      <div className="grid gap-2">
        <Label htmlFor="seoTitle">SEO title</Label>
        <Input id="seoTitle" {...form.register("seoTitle")} />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="seoDescription">SEO description</Label>
        <Textarea
          id="seoDescription"
          rows={2}
          {...form.register("seoDescription")}
        />
      </div>
      <Button type="submit" disabled={pending}>
        {pending ? "Saving…" : id ? "Update category" : "Create category"}
      </Button>
    </form>
  );
}

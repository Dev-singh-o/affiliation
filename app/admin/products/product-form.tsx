"use client";

import { useTransition } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { PlusIcon, Trash2Icon } from "lucide-react";

import {
  createProduct,
  updateProduct,
  setProductStatus,
  deleteProduct,
} from "@/actions/products";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { productSchema } from "@/lib/validation/catalog";
import type { ProductInput } from "@/lib/validation/catalog";
import { ImageUploader } from "@/components/admin/image-uploader";
import { Badge } from "@/components/ui/badge";

const defaults: ProductInput = {
  name: "",
  slug: undefined,
  shortDescription: undefined,
  description: undefined,
  brand: undefined,
  status: "DRAFT",
  featured: false,
  recommended: false,
  displayOrder: 0,
  recommendationText: undefined,
  features: [],
  seoTitle: undefined,
  seoDescription: undefined,
  categoryIds: [],
  images: [],
};

export function ProductForm({
  id,
  initial,
  categories,
}: {
  id?: string;
  initial?: Partial<ProductInput> & { categoryIds?: string[]; images?: ProductInput["images"] };
  categories: { id: string; name: string }[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const form = useForm<ProductInput>({
    resolver: zodResolver(productSchema) as never,
    defaultValues: { ...defaults, ...initial },
  });
  const images = useFieldArray({ control: form.control, name: "images" });

  function onSubmit(values: ProductInput) {
    startTransition(async () => {
      const result = id
        ? await updateProduct(id, values)
        : await createProduct(values);
      if (result.ok) {
        toast.success(id ? "Product updated" : "Product created");
        const createdId =
          "id" in result.data && typeof result.data.id === "string"
            ? result.data.id
            : null;
        if (!id && createdId) router.push(`/admin/products/${createdId}`);
        router.refresh();
      } else {
        toast.error(result.error);
      }
    });
  }

  const currentStatus = form.watch("status");

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-6">
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor="name">Name</Label>
          <Input id="name" {...form.register("name")} />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="slug">Slug (optional)</Label>
          <Input id="slug" {...form.register("slug")} />
        </div>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="shortDescription">Short description</Label>
        <Input id="shortDescription" {...form.register("shortDescription")} />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" rows={5} {...form.register("description")} />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="brand">Brand</Label>
        <Input id="brand" {...form.register("brand")} />
      </div>

      <div className="grid gap-2">
        <Label>Categories</Label>
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => {
            const selected = form.watch("categoryIds").includes(category.id);
            return (
              <label
                key={category.id}
                className="flex cursor-pointer items-center gap-2 rounded-md border px-3 py-1.5 text-sm"
              >
                <input
                  type="checkbox"
                  checked={selected}
                  onChange={(e) => {
                    const current = form.getValues("categoryIds");
                    form.setValue(
                      "categoryIds",
                      e.target.checked
                        ? [...current, category.id]
                        : current.filter((v) => v !== category.id),
                    );
                  }}
                />
                {category.name}
              </label>
            );
          })}
        </div>
      </div>

      <div className="grid gap-2">
        <Label>Images</Label>
        <div className="grid gap-3">
          {images.fields.map((field, index) => (
            <div
              key={field.id}
              className="grid gap-2 rounded-lg border p-3"
            >
              <ImageUploader
                value={form.watch(`images.${index}.imageUrl`)}
                alt={form.watch(`images.${index}.altText`) ?? ""}
                onAltChange={(alt) =>
                  form.setValue(`images.${index}.altText`, alt)
                }
                onChange={(url) =>
                  form.setValue(`images.${index}.imageUrl`, url)
                }
              />
              <Input
                placeholder="Alt text"
                {...form.register(`images.${index}.altText`)}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => images.remove(index)}
              >
                <Trash2Icon />
                Remove image
              </Button>
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              images.append({ imageUrl: "", altText: undefined, displayOrder: 0 })
            }
          >
            <PlusIcon />
            Add image
          </Button>
        </div>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="recommendationText">Creator recommendation</Label>
        <Textarea
          id="recommendationText"
          rows={3}
          {...form.register("recommendationText")}
        />
      </div>

      <div className="grid gap-2">
        <Label>Features</Label>
        <Textarea
          rows={3}
          placeholder="One feature per line"
          value={form.watch("features").join("\n")}
          onChange={(e) =>
            form.setValue(
              "features",
              e.target.value
                .split("\n")
                .map((v) => v.trim())
                .filter(Boolean),
            )
          }
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
            <option value="DRAFT">Draft</option>
            <option value="PUBLISHED">Published</option>
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

      <div className="flex flex-wrap items-center gap-4">
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" {...form.register("featured")} /> Featured
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" {...form.register("recommended")} /> Recommended
        </label>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor="seoTitle">SEO title</Label>
          <Input id="seoTitle" {...form.register("seoTitle")} />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="seoDescription">SEO description</Label>
          <Input id="seoDescription" {...form.register("seoDescription")} />
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button type="submit" disabled={pending}>
          {pending ? "Saving…" : id ? "Update product" : "Create product"}
        </Button>
        {id ? (
          <>
            {currentStatus !== "PUBLISHED" ? (
              <Button
                type="button"
                variant="secondary"
                disabled={pending}
                onClick={() =>
                  startTransition(async () => {
                    const result = await setProductStatus(id, "PUBLISHED");
                    if (result.ok) {
                      toast.success("Published");
                      router.refresh();
                    } else toast.error(result.error);
                  })
                }
              >
                Publish
              </Button>
            ) : (
              <Button
                type="button"
                variant="secondary"
                disabled={pending}
                onClick={() =>
                  startTransition(async () => {
                    const result = await setProductStatus(id, "DRAFT");
                    if (result.ok) {
                      toast.success("Unpublished");
                      router.refresh();
                    } else toast.error(result.error);
                  })
                }
              >
                Unpublish
              </Button>
            )}
            <Button
              type="button"
              variant="destructive"
              disabled={pending}
              onClick={() => {
                if (!confirm("Delete this product permanently?")) return;
                startTransition(async () => {
                  const result = await deleteProduct(id);
                  if (result.ok) {
                    toast.success("Deleted");
                    router.push("/admin/products");
                    router.refresh();
                  } else toast.error(result.error);
                });
              }}
            >
              <Trash2Icon />
              Delete
            </Button>
          </>
        ) : null}
      </div>
    </form>
  );
}

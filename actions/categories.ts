"use server";

import { updateTag } from "next/cache";

import { requireStaff } from "@/lib/auth/session";
import { auditLog } from "@/lib/audit";
import { prisma } from "@/lib/db/prisma";
import { slugify } from "@/lib/slug";
import { categorySchema } from "@/lib/validation/catalog";
import type { ActionResult } from "@/actions/products";

async function ensureUniqueCategorySlug(
  base: string,
  excludeId?: string,
): Promise<string> {
  const root = slugify(base) || "category";
  let candidate = root;
  let counter = 2;
  while (true) {
    const existing = await prisma.category.findUnique({
      where: { slug: candidate },
      select: { id: true },
    });
    if (!existing || existing.id === excludeId) return candidate;
    candidate = `${root}-${counter}`;
    counter += 1;
    if (counter > 100) throw new Error("Could not generate a unique slug");
  }
}

export async function createCategory(
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  const user = await requireStaff();
  const parsed = categorySchema.safeParse(input);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    return { ok: false, error: `${issue?.path.join(".")}: ${issue?.message}` };
  }
  const data = parsed.data;
  const slug = await ensureUniqueCategorySlug(data.slug || data.name);

  const category = await prisma.category.create({
    data: {
      name: data.name,
      slug,
      description: data.description ?? null,
      imageUrl: data.imageUrl ?? null,
      status: data.status,
      featured: data.featured,
      displayOrder: data.displayOrder,
      seoTitle: data.seoTitle ?? null,
      seoDescription: data.seoDescription ?? null,
    },
  });
  await auditLog({
    actorUserId: user.id,
    action: "category.create",
    entityType: "category",
    entityId: category.id,
    metadata: { slug },
  });
  updateTag("categories");
  return { ok: true, data: { id: category.id } };
}

export async function updateCategory(
  id: string,
  input: unknown,
): Promise<ActionResult> {
  const user = await requireStaff();
  const parsed = categorySchema.safeParse(input);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    return { ok: false, error: `${issue?.path.join(".")}: ${issue?.message}` };
  }
  const existing = await prisma.category.findUnique({ where: { id } });
  if (!existing) return { ok: false, error: "Category not found." };

  const data = parsed.data;
  const slug = await ensureUniqueCategorySlug(data.slug || data.name, id);

  await prisma.category.update({
    where: { id },
    data: {
      name: data.name,
      slug,
      description: data.description ?? null,
      imageUrl: data.imageUrl ?? null,
      status: data.status,
      featured: data.featured,
      displayOrder: data.displayOrder,
      seoTitle: data.seoTitle ?? null,
      seoDescription: data.seoDescription ?? null,
    },
  });
  await auditLog({
    actorUserId: user.id,
    action: "category.update",
    entityType: "category",
    entityId: id,
    metadata: { slug },
  });
  updateTag("categories");
  return { ok: true, data: undefined };
}

export type CategoryDeleteMode = "detach" | "cancel";

/**
 * Delete a category. If it still has products, the caller must pass
 * mode "detach" (products keep their other categories) — otherwise the
 * action refuses and reports the product count.
 */
export async function deleteCategory(
  id: string,
  mode: CategoryDeleteMode,
): Promise<ActionResult<{ detachedProducts?: number }>> {
  const user = await requireStaff();
  const category = await prisma.category.findUnique({
    where: { id },
    select: { name: true, _count: { select: { products: true } } },
  });
  if (!category) return { ok: false, error: "Category not found." };

  const productCount = category._count.products;
  if (productCount > 0 && mode !== "detach") {
    return {
      ok: false,
      error: `This category is assigned to ${productCount} product(s). Confirm to remove it from those products and delete.`,
    };
  }

  await prisma.category.delete({ where: { id } }); // ProductCategory cascades
  await auditLog({
    actorUserId: user.id,
    action: "category.delete",
    entityType: "category",
    entityId: id,
    metadata: { name: category.name, detachedProducts: productCount },
  });
  updateTag("categories");
  return { ok: true, data: { detachedProducts: productCount } };
}

export async function listCategoriesForPicker(): Promise<
  { id: string; name: string; status: string }[]
> {
  await requireStaff();
  return prisma.category.findMany({
    select: { id: true, name: true, status: true },
    orderBy: [{ displayOrder: "asc" }, { name: "asc" }],
  });
}

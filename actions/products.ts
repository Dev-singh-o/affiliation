"use server";

import { updateTag } from "next/cache";

import { requireStaff } from "@/lib/auth/session";
import { auditLog } from "@/lib/audit";
import { prisma } from "@/lib/db/prisma";
import { slugify } from "@/lib/slug";
import { productSchema, type ProductInput } from "@/lib/validation/catalog";

export type ActionResult<T = undefined> =
  | { ok: true; data: T }
  | { ok: false; error: string };

function firstIssue(error: { issues: { path: PropertyKey[]; message: string }[] }): string {
  const issue = error.issues[0];
  return `${issue?.path.join(".") ?? "input"}: ${issue?.message ?? "invalid"}`;
}

/** Generate a URL-friendly slug that is unique across products. */
export async function ensureUniqueProductSlug(
  base: string,
  excludeId?: string,
): Promise<string> {
  const root = slugify(base) || "product";
  let candidate = root;
  let counter = 2;
  while (true) {
    const existing = await prisma.product.findUnique({
      where: { slug: candidate },
      select: { id: true },
    });
    if (!existing || existing.id === excludeId) return candidate;
    candidate = `${root}-${counter}`;
    counter += 1;
    if (counter > 100) throw new Error("Could not generate a unique slug");
  }
}

async function writeProductRelations(
  tx: Parameters<Parameters<typeof prisma.$transaction>[0]>[0],
  productId: string,
  input: ProductInput,
) {
  await tx.productCategory.deleteMany({ where: { productId } });
  if (input.categoryIds.length > 0) {
    await tx.productCategory.createMany({
      data: input.categoryIds.map((categoryId) => ({ productId, categoryId })),
      skipDuplicates: true,
    });
  }

  await tx.productImage.deleteMany({
    where: {
      productId,
      id: { notIn: input.images.map((i) => i.id).filter(Boolean) as string[] },
    },
  });
  for (const [index, image] of input.images.entries()) {
    const data = {
      imageUrl: image.imageUrl,
      altText: image.altText ?? null,
      displayOrder: index,
    };
    if (image.id) {
      await tx.productImage.update({ where: { id: image.id }, data });
    } else {
      await tx.productImage.create({ data: { ...data, productId } });
    }
  }
}

export async function createProduct(
  input: unknown,
): Promise<ActionResult<{ id: string; slug: string }>> {
  const user = await requireStaff();
  const parsed = productSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: firstIssue(parsed.error) };

  const data = parsed.data;
  const slug = await ensureUniqueProductSlug(data.slug || data.name);

  const product = await prisma.$transaction(async (tx) => {
    const created = await tx.product.create({
      data: {
        name: data.name,
        slug,
        shortDescription: data.shortDescription ?? null,
        description: data.description ?? null,
        brand: data.brand ?? null,
        status: data.status,
        featured: data.featured,
        recommended: data.recommended,
        displayOrder: data.displayOrder,
        recommendationText: data.recommendationText ?? null,
        features: data.features,
        seoTitle: data.seoTitle ?? null,
        seoDescription: data.seoDescription ?? null,
        publishedAt: data.status === "PUBLISHED" ? new Date() : null,
      },
    });
    await writeProductRelations(tx, created.id, data);
    return created;
  });

  await auditLog({
    actorUserId: user.id,
    action: "product.create",
    entityType: "product",
    entityId: product.id,
    metadata: { slug: product.slug, status: product.status },
  });
  updateTag("products");
  return { ok: true, data: { id: product.id, slug: product.slug } };
}

export async function updateProduct(
  id: string,
  input: unknown,
): Promise<ActionResult<{ slug: string }>> {
  const user = await requireStaff();
  const parsed = productSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: firstIssue(parsed.error) };

  const existing = await prisma.product.findUnique({ where: { id } });
  if (!existing) return { ok: false, error: "Product not found." };

  const data = parsed.data;
  const slug = await ensureUniqueProductSlug(data.slug || data.name, id);
  const slugChanged = slug !== existing.slug;
  const nowPublished =
    data.status === "PUBLISHED" && existing.status !== "PUBLISHED";

  const product = await prisma.$transaction(async (tx) => {
    const updated = await tx.product.update({
      where: { id },
      data: {
        name: data.name,
        slug,
        shortDescription: data.shortDescription ?? null,
        description: data.description ?? null,
        brand: data.brand ?? null,
        status: data.status,
        featured: data.featured,
        recommended: data.recommended,
        displayOrder: data.displayOrder,
        recommendationText: data.recommendationText ?? null,
        features: data.features,
        seoTitle: data.seoTitle ?? null,
        seoDescription: data.seoDescription ?? null,
        publishedAt: nowPublished ? new Date() : existing.publishedAt,
      },
    });
    if (slugChanged && existing.status === "PUBLISHED") {
      // Preserve old shared links -> new slug (301 on the public site).
      await tx.productRedirect.upsert({
        where: { oldSlug: existing.slug },
        create: { oldSlug: existing.slug, productId: id },
        update: { productId: id },
      });
    }
    await writeProductRelations(tx, id, data);
    return updated;
  });

  await auditLog({
    actorUserId: user.id,
    action: "product.update",
    entityType: "product",
    entityId: id,
    metadata: { slug, slugChanged, status: product.status },
  });
  updateTag("products");
  return { ok: true, data: { slug: product.slug } };
}

export async function setProductStatus(
  id: string,
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED",
): Promise<ActionResult> {
  const user = await requireStaff();
  const existing = await prisma.product.findUnique({
    where: { id },
    select: { status: true },
  });
  if (!existing) return { ok: false, error: "Product not found." };

  await prisma.product.update({
    where: { id },
    data: {
      status,
      publishedAt:
        status === "PUBLISHED" && existing.status !== "PUBLISHED"
          ? new Date()
          : undefined,
    },
  });
  await auditLog({
    actorUserId: user.id,
    action: `product.${status.toLowerCase()}`,
    entityType: "product",
    entityId: id,
  });
  updateTag("products");
  return { ok: true, data: undefined };
}

export async function deleteProduct(id: string): Promise<ActionResult> {
  const user = await requireStaff();
  const existing = await prisma.product.findUnique({
    where: { id },
    select: { slug: true },
  });
  if (!existing) return { ok: false, error: "Product not found." };

  // Cascades remove images, category links, offers, clicks, redirects.
  await prisma.product.delete({ where: { id } });
  await auditLog({
    actorUserId: user.id,
    action: "product.delete",
    entityType: "product",
    entityId: id,
    metadata: { slug: existing.slug },
  });
  updateTag("products");
  return { ok: true, data: undefined };
}

/** Product search for admin pickers (homepage sections, related, etc.). */
export async function searchProductsForPicker(
  query: string,
): Promise<{ id: string; name: string; status: string }[]> {
  await requireStaff();
  const q = query.trim().slice(0, 120);
  return prisma.product.findMany({
    where: q
      ? { name: { contains: q, mode: "insensitive" } }
      : undefined,
    select: { id: true, name: true, status: true },
    orderBy: { updatedAt: "desc" },
    take: 20,
  });
}

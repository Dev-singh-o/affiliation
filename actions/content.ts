"use server";

import { updateTag } from "next/cache";

import { requireStaff } from "@/lib/auth/session";
import { auditLog } from "@/lib/audit";
import { prisma } from "@/lib/db/prisma";
import { slugify } from "@/lib/slug";
import { contentPageSchema } from "@/lib/validation/catalog";
import type { ActionResult } from "@/actions/products";

async function ensureUniquePageSlug(
  base: string,
  excludeId?: string,
): Promise<string> {
  const root = slugify(base) || "page";
  let candidate = root;
  let counter = 2;
  while (true) {
    const existing = await prisma.contentPage.findUnique({
      where: { slug: candidate },
      select: { id: true },
    });
    if (!existing || existing.id === excludeId) return candidate;
    candidate = `${root}-${counter}`;
    counter += 1;
    if (counter > 100) throw new Error("Could not generate a unique slug");
  }
}

export async function createContentPage(
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  const user = await requireStaff();
  const parsed = contentPageSchema.safeParse(input);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    return { ok: false, error: `${issue?.path.join(".")}: ${issue?.message}` };
  }
  const data = parsed.data;
  const slug = await ensureUniquePageSlug(data.slug || data.title);

  const page = await prisma.contentPage.create({
    data: {
      title: data.title,
      slug,
      content: data.content,
      status: data.status,
      seoTitle: data.seoTitle ?? null,
      seoDescription: data.seoDescription ?? null,
      publishedAt: data.status === "PUBLISHED" ? new Date() : null,
    },
  });
  await auditLog({
    actorUserId: user.id,
    action: "content.create",
    entityType: "contentPage",
    entityId: page.id,
    metadata: { slug, status: page.status },
  });
  updateTag("content");
  return { ok: true, data: { id: page.id } };
}

export async function updateContentPage(
  id: string,
  input: unknown,
): Promise<ActionResult> {
  const user = await requireStaff();
  const parsed = contentPageSchema.safeParse(input);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    return { ok: false, error: `${issue?.path.join(".")}: ${issue?.message}` };
  }
  const existing = await prisma.contentPage.findUnique({ where: { id } });
  if (!existing) return { ok: false, error: "Page not found." };

  const data = parsed.data;
  const slug = await ensureUniquePageSlug(data.slug || data.title, id);
  const nowPublished =
    data.status === "PUBLISHED" && existing.status !== "PUBLISHED";

  await prisma.contentPage.update({
    where: { id },
    data: {
      title: data.title,
      slug,
      content: data.content,
      status: data.status,
      seoTitle: data.seoTitle ?? null,
      seoDescription: data.seoDescription ?? null,
      publishedAt: nowPublished ? new Date() : existing.publishedAt,
    },
  });
  await auditLog({
    actorUserId: user.id,
    action: "content.update",
    entityType: "contentPage",
    entityId: id,
    metadata: { slug, status: data.status },
  });
  updateTag("content");
  return { ok: true, data: undefined };
}

export async function deleteContentPage(id: string): Promise<ActionResult> {
  const user = await requireStaff();
  const existing = await prisma.contentPage.findUnique({
    where: { id },
    select: { title: true },
  });
  if (!existing) return { ok: false, error: "Page not found." };

  await prisma.contentPage.delete({ where: { id } });
  await auditLog({
    actorUserId: user.id,
    action: "content.delete",
    entityType: "contentPage",
    entityId: id,
    metadata: existing,
  });
  updateTag("content");
  return { ok: true, data: undefined };
}

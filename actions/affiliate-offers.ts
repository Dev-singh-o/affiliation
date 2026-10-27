"use server";

import { updateTag } from "next/cache";

import { requireStaff } from "@/lib/auth/session";
import { auditLog } from "@/lib/audit";
import { validateAffiliateUrl } from "@/lib/affiliate/url-policy";
import { prisma } from "@/lib/db/prisma";
import { getSettings } from "@/lib/settings";
import { affiliateOfferSchema } from "@/lib/validation/catalog";
import type { ActionResult } from "@/actions/products";

type OfferData = ReturnType<typeof affiliateOfferSchema.parse>;

async function validateOfferDestination(
  url: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const { affiliate } = await getSettings();
  const result = validateAffiliateUrl(url, affiliate.approvedDomains);
  if (!result.ok) return { ok: false, error: result.reason };
  return { ok: true };
}

function toPrismaData(data: OfferData) {
  return {
    retailerName: data.retailerName,
    affiliateNetwork: data.affiliateNetwork ?? null,
    affiliateUrl: data.affiliateUrl,
    offerLabel: data.offerLabel ?? null,
    displayedPrice: data.displayedPrice ?? null,
    originalPrice: data.originalPrice ?? null,
    currency: data.currency ?? null,
    availabilityStatus: data.availabilityStatus,
    isPrimary: data.isPrimary,
    trackingLabel: data.trackingLabel ?? null,
    status: data.status,
  };
}

/** Keep at most one primary offer per product. */
async function enforceSinglePrimary(
  tx: Parameters<Parameters<typeof prisma.$transaction>[0]>[0],
  productId: string,
  primaryOfferId: string,
) {
  await tx.affiliateOffer.updateMany({
    where: { productId, id: { not: primaryOfferId }, isPrimary: true },
    data: { isPrimary: false },
  });
}

export async function createAffiliateOffer(
  productId: string,
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  const user = await requireStaff();
  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: { id: true },
  });
  if (!product) return { ok: false, error: "Product not found." };

  const parsed = affiliateOfferSchema.safeParse(input);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    return { ok: false, error: `${issue?.path.join(".")}: ${issue?.message}` };
  }
  const destination = await validateOfferDestination(parsed.data.affiliateUrl);
  if (!destination.ok) return { ok: false, error: destination.error };

  const offer = await prisma.$transaction(async (tx) => {
    const created = await tx.affiliateOffer.create({
      data: { ...toPrismaData(parsed.data), productId },
    });
    if (created.isPrimary) await enforceSinglePrimary(tx, productId, created.id);
    return created;
  });

  await auditLog({
    actorUserId: user.id,
    action: "offer.create",
    entityType: "affiliateOffer",
    entityId: offer.id,
    metadata: { productId, retailer: offer.retailerName },
  });
  updateTag("products");
  return { ok: true, data: { id: offer.id } };
}

export async function updateAffiliateOffer(
  id: string,
  input: unknown,
): Promise<ActionResult> {
  const user = await requireStaff();
  const existing = await prisma.affiliateOffer.findUnique({ where: { id } });
  if (!existing) return { ok: false, error: "Offer not found." };

  const parsed = affiliateOfferSchema.safeParse(input);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    return { ok: false, error: `${issue?.path.join(".")}: ${issue?.message}` };
  }
  const destination = await validateOfferDestination(parsed.data.affiliateUrl);
  if (!destination.ok) return { ok: false, error: destination.error };

  await prisma.$transaction(async (tx) => {
    await tx.affiliateOffer.update({
      where: { id },
      data: toPrismaData(parsed.data),
    });
    if (parsed.data.isPrimary) {
      await enforceSinglePrimary(tx, existing.productId, id);
    }
  });

  await auditLog({
    actorUserId: user.id,
    action: "offer.update",
    entityType: "affiliateOffer",
    entityId: id,
    metadata: {
      productId: existing.productId,
      urlChanged: existing.affiliateUrl !== parsed.data.affiliateUrl,
    },
  });
  updateTag("products");
  return { ok: true, data: undefined };
}

export async function deleteAffiliateOffer(id: string): Promise<ActionResult> {
  const user = await requireStaff();
  const existing = await prisma.affiliateOffer.findUnique({
    where: { id },
    select: { productId: true, retailerName: true },
  });
  if (!existing) return { ok: false, error: "Offer not found." };

  await prisma.affiliateOffer.delete({ where: { id } });
  await auditLog({
    actorUserId: user.id,
    action: "offer.delete",
    entityType: "affiliateOffer",
    entityId: id,
    metadata: existing,
  });
  updateTag("products");
  return { ok: true, data: undefined };
}

export async function setAffiliateOfferStatus(
  id: string,
  status: "ACTIVE" | "INACTIVE",
): Promise<ActionResult> {
  const user = await requireStaff();
  const existing = await prisma.affiliateOffer.findUnique({
    where: { id },
    select: { productId: true },
  });
  if (!existing) return { ok: false, error: "Offer not found." };

  await prisma.affiliateOffer.update({ where: { id }, data: { status } });
  await auditLog({
    actorUserId: user.id,
    action: `offer.${status.toLowerCase()}`,
    entityType: "affiliateOffer",
    entityId: id,
    metadata: existing,
  });
  updateTag("products");
  return { ok: true, data: undefined };
}

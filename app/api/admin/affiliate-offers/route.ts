import { getStaffApiUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";

export async function GET(request: Request) {
  const user = await getStaffApiUser();
  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const productId = searchParams.get("productId");
  if (!productId) {
    return Response.json({ error: "Missing productId" }, { status: 400 });
  }

  const offers = await prisma.affiliateOffer.findMany({
    where: { productId },
    orderBy: [{ isPrimary: "desc" }, { createdAt: "asc" }],
  });

  return Response.json(
    offers.map((o) => ({
      id: o.id,
      retailerName: o.retailerName,
      affiliateNetwork: o.affiliateNetwork,
      affiliateUrl: o.affiliateUrl,
      offerLabel: o.offerLabel,
      displayedPrice: o.displayedPrice?.toString() ?? null,
      originalPrice: o.originalPrice?.toString() ?? null,
      currency: o.currency,
      availabilityStatus: o.availabilityStatus,
      isPrimary: o.isPrimary,
      trackingLabel: o.trackingLabel,
      status: o.status,
    })),
  );
}

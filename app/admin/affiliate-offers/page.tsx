import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { prisma } from "@/lib/db/prisma";

export const metadata: Metadata = {
  title: "Affiliate offers",
  robots: { index: false, follow: false },
};

export default function AffiliateOffersPage() {
  return (
    <Suspense fallback={<Skeleton className="h-96 w-full" />}>
      <OffersContent />
    </Suspense>
  );
}

async function OffersContent() {
  const offers = await prisma.affiliateOffer.findMany({
    orderBy: { createdAt: "desc" },
    include: { product: { select: { id: true, name: true, slug: true } } },
    take: 200,
  });

  return (
    <div className="grid gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Affiliate offers</h1>
        <p className="text-muted-foreground text-sm">
          {offers.length} offers across all products. Edit offers from the
          product page.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All offers</CardTitle>
          <CardDescription>
            Manage retailer links, prices, and availability per product.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {offers.length === 0 ? (
            <div className="text-muted-foreground p-8 text-center text-sm">
              No offers yet. Add one from a product page.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/50 text-left">
                  <tr>
                    <th className="px-4 py-2 font-medium">Product</th>
                    <th className="px-4 py-2 font-medium">Retailer</th>
                    <th className="px-4 py-2 font-medium">Label</th>
                    <th className="px-4 py-2 font-medium">Price</th>
                    <th className="px-4 py-2 font-medium">Status</th>
                    <th className="px-4 py-2 text-right font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {offers.map((offer) => (
                    <tr key={offer.id} className="border-t">
                      <td className="px-4 py-2">
                        <Link
                          href={`/admin/products/${offer.product.id}`}
                          className="text-primary hover:underline"
                        >
                          {offer.product.name}
                        </Link>
                      </td>
                      <td className="px-4 py-2 font-medium">
                        {offer.retailerName}
                        {offer.isPrimary ? (
                          <span className="text-muted-foreground ml-2 text-xs">
                            (primary)
                          </span>
                        ) : null}
                      </td>
                      <td className="px-4 py-2 text-muted-foreground">
                        {offer.offerLabel ?? "—"}
                      </td>
                      <td className="px-4 py-2">
                        {offer.displayedPrice
                          ? `${offer.currency ?? ""} ${offer.displayedPrice.toString()}`
                          : "—"}
                      </td>
                      <td className="px-4 py-2">{offer.status}</td>
                      <td className="px-4 py-2 text-right">
                        <Link
                          href={`/admin/products/${offer.product.id}`}
                          className="text-primary hover:underline"
                        >
                          Edit product
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

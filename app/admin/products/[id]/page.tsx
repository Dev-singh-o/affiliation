import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeftIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { prisma } from "@/lib/db/prisma";
import { ProductForm } from "../product-form";
import { AffiliateOffersSection } from "../affiliate-offers-section";

export const metadata: Metadata = {
  title: "Edit product",
  robots: { index: false, follow: false },
};

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [product, categories] = await Promise.all([
    prisma.product.findUnique({
      where: { id },
      include: {
        images: { orderBy: { displayOrder: "asc" } },
        categories: true,
      },
    }),
    prisma.category.findMany({
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
  ]);

  if (!product) {
    return (
      <div className="text-muted-foreground p-8 text-center">
        Product not found.
      </div>
    );
  }

  const initial = {
    name: product.name,
    slug: product.slug,
    shortDescription: product.shortDescription ?? undefined,
    description: product.description ?? undefined,
    brand: product.brand ?? undefined,
    status: product.status,
    featured: product.featured,
    recommended: product.recommended,
    displayOrder: product.displayOrder,
    recommendationText: product.recommendationText ?? undefined,
    features: product.features,
    seoTitle: product.seoTitle ?? undefined,
    seoDescription: product.seoDescription ?? undefined,
    categoryIds: product.categories.map((c) => c.categoryId),
    images: product.images.map((image) => ({
      id: image.id,
      imageUrl: image.imageUrl,
      altText: image.altText ?? undefined,
      displayOrder: image.displayOrder,
    })),
  };

  return (
    <div className="grid gap-6">
      <div className="flex items-center gap-3">
        <Button asChild variant="ghost" size="sm">
          <Link href="/admin/products">
            <ArrowLeftIcon />
            Back
          </Link>
        </Button>
        <h1 className="text-2xl font-bold tracking-tight">
          Edit: {product.name}
        </h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Product details</CardTitle>
        </CardHeader>
        <CardContent>
          <ProductForm id={id} initial={initial} categories={categories} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Affiliate offers</CardTitle>
          <CardDescription>
            Retailer choices shown on the public product page.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AffiliateOffersSection productId={id} />
        </CardContent>
      </Card>
    </div>
  );
}

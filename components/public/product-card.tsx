import Link from "next/link";
import Image from "next/image";
import { HeartIcon } from "lucide-react";

import { formatPrice, discountPercent } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { getSettings } from "@/lib/settings";
import type { Prisma } from "@/lib/generated/prisma/client";

type ProductWithRelations = Prisma.ProductGetPayload<{
  include: {
    images: true;
    categories: { include: { category: true } };
    offers: true;
  };
}>;

export function ProductCard({
  product,
  style = "default",
}: {
  product: ProductWithRelations;
  style?: "default" | "large" | "compact";
}) {
  const image = product.images[0]?.imageUrl;
  const primaryOffer = product.offers.find((o) => o.isPrimary) ?? product.offers[0];
  const price = primaryOffer?.displayedPrice?.toString();
  const original = primaryOffer?.originalPrice?.toString();
  const currency = primaryOffer?.currency;
  const discount = discountPercent(price, original);
  const ctaLabel = primaryOffer?.offerLabel;

  // We cannot await inside a sync component easily; use cached settings via a wrapper.
  // Instead, fallback CTA text from offer or a generic label.
  const ctaText = ctaLabel ?? "Check price";

  const isLarge = style === "large";
  const isCompact = style === "compact";

  return (
    <article
      className={`group flex flex-col overflow-hidden rounded-2xl border bg-card transition-shadow hover:shadow-lg ${
        isLarge ? "md:col-span-2 md:row-span-2" : ""
      }`}
    >
      <Link href={`/products/${product.slug}`} className="relative block">
        <div
          className={`relative w-full overflow-hidden bg-muted ${
            isCompact ? "aspect-square" : "aspect-[4/3]"
          }`}
        >
          {image ? (
            <Image
              src={image}
              alt={product.images[0]?.altText ?? product.name}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-muted-foreground">
              <HeartIcon className="size-8" aria-hidden />
            </div>
          )}
          {product.recommended ? (
            <span className="absolute left-3 top-3 rounded-full bg-primary px-2.5 py-1 text-xs font-semibold text-primary-foreground">
              Recommended
            </span>
          ) : null}
          {discount ? (
            <span className="absolute right-3 top-3 rounded-full bg-destructive px-2.5 py-1 text-xs font-semibold text-destructive-foreground">
              -{discount}%
            </span>
          ) : null}
        </div>
      </Link>

      <div className={`flex flex-1 flex-col gap-2 p-4 ${isCompact ? "p-3" : ""}`}>
        {product.brand ? (
          <p className="text-muted-foreground text-xs font-medium uppercase tracking-wide">
            {product.brand}
          </p>
        ) : null}
        <Link href={`/products/${product.slug}`}>
          <h3
            className={`font-semibold leading-tight tracking-tight ${
              isLarge ? "text-xl" : "text-base"
            }`}
          >
            {product.name}
          </h3>
        </Link>
        {product.shortDescription ? (
          <p className="text-muted-foreground line-clamp-2 text-sm">
            {product.shortDescription}
          </p>
        ) : null}

        <div className="mt-auto flex items-end justify-between gap-2 pt-3">
          <div>
            {price ? (
              <p className="text-lg font-bold">{formatPrice(price, currency)}</p>
            ) : null}
            {original && original !== price ? (
              <p className="text-muted-foreground text-sm line-through">
                {formatPrice(original, currency)}
              </p>
            ) : null}
            {primaryOffer?.retailerName ? (
              <p className="text-muted-foreground text-xs">
                {primaryOffer.retailerName}
              </p>
            ) : null}
          </div>
          <Button asChild size={isCompact ? "sm" : "default"}>
            <Link href={`/products/${product.slug}`}>{ctaText}</Link>
          </Button>
        </div>
      </div>
    </article>
  );
}

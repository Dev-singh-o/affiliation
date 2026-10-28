import Link from "next/link";
import Image from "next/image";
import { ArrowUpRightIcon, BadgeCheckIcon, ImageOffIcon } from "lucide-react";

import { formatPrice, discountPercent } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { ProductWithRelations } from "@/components/public/product-card";

/**
 * Editorial featured product: image and information side by side on
 * desktop, stacked on mobile. The image is deliberately proportioned so it
 * never dwarfs the product information.
 */
export function FeatureProduct({
  product,
  priority = false,
}: {
  product: ProductWithRelations;
  priority?: boolean;
}) {
  const image = product.images[0]?.imageUrl;
  const primaryOffer =
    product.offers.find((o) => o.isPrimary) ?? product.offers[0];
  const price = primaryOffer?.displayedPrice?.toString();
  const original = primaryOffer?.originalPrice?.toString();
  const currency = primaryOffer?.currency;
  const discount = discountPercent(price, original);

  return (
    <article className="group bg-card overflow-hidden rounded-3xl border border-border transition-shadow duration-300 hover:shadow-md">
      <div className="grid lg:grid-cols-[1.05fr_1fr]">
        {/* Image */}
        <Link
          href={`/products/${product.slug}`}
          className="bg-muted relative block overflow-hidden"
          tabIndex={-1}
          aria-hidden
        >
          <div className="relative aspect-[16/11] w-full sm:aspect-[16/9] lg:aspect-auto lg:h-full lg:min-h-[440px]">
            {image ? (
              <Image
                src={image}
                alt={product.images[0]?.altText ?? product.name}
                fill
                sizes="(max-width: 1024px) 100vw, 55vw"
                className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                priority={priority}
              />
            ) : (
              <div className="tile-fallback flex h-full items-center justify-center">
                <ImageOffIcon className="text-muted-foreground/50 size-10" aria-hidden />
              </div>
            )}
            {discount ? (
              <Badge
                variant="destructive"
                className="absolute left-5 top-5 shadow-sm backdrop-blur-sm"
              >
                −{discount}%
              </Badge>
            ) : null}
          </div>
        </Link>

        {/* Information */}
        <div className="flex flex-col justify-center gap-5 p-6 sm:p-8 lg:p-10">
          <div className="flex flex-wrap items-center gap-2">
            {product.recommended ? (
              <Badge variant="accent">
                <BadgeCheckIcon aria-hidden />
                Creator&apos;s pick
              </Badge>
            ) : null}
            {product.brand ? (
              <span className="text-muted-foreground text-[12px] font-semibold tracking-[0.1em] uppercase">
                {product.brand}
              </span>
            ) : null}
          </div>

          <div>
            <h3 className="font-display text-editorial-lg font-semibold text-foreground">
              <Link href={`/products/${product.slug}`} className="contents">
                {product.name}
              </Link>
            </h3>
            {product.shortDescription ? (
              <p className="text-muted-foreground mt-3 max-w-md text-[15px] leading-relaxed">
                {product.shortDescription}
              </p>
            ) : null}
          </div>

          {price ? (
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <span className="text-2xl font-semibold tracking-tight">
                {formatPrice(price, currency)}
              </span>
              {original && original !== price ? (
                <span className="text-muted-foreground text-base line-through">
                  {formatPrice(original, currency)}
                </span>
              ) : null}
            </div>
          ) : null}

          <div className="flex flex-wrap items-center gap-3">
            <Button asChild size="lg">
              <Link href={`/products/${product.slug}`}>
                {primaryOffer?.offerLabel ?? "View product"}
                <ArrowUpRightIcon />
              </Link>
            </Button>
            {primaryOffer?.retailerName ? (
              <span className="text-muted-foreground text-sm">
                Available at{" "}
                <span className="text-foreground font-medium">
                  {primaryOffer.retailerName}
                </span>
              </span>
            ) : null}
          </div>
        </div>
      </div>
    </article>
  );
}

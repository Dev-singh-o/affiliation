import Link from "next/link";
import Image from "next/image";
import { ArrowUpRightIcon, BadgeCheckIcon, ImageOffIcon } from "lucide-react";

import { formatPrice, discountPercent, cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import type { Prisma } from "@/lib/generated/prisma/client";

export type ProductWithRelations = Prisma.ProductGetPayload<{
  include: {
    images: true;
    categories: { include: { category: true } };
    offers: true;
  };
}>;

export type ProductCardVariant = "default" | "compact";

/**
 * The single product card used everywhere: home sections, search results,
 * category listings and related products. One system, consistent
 * proportions, real data only (no invented prices or discounts).
 */
export function ProductCard({
  product,
  variant = "default",
  priority = false,
  className,
}: {
  product: ProductWithRelations;
  variant?: ProductCardVariant;
  priority?: boolean;
  className?: string;
}) {
  const image = product.images[0]?.imageUrl;
  const primaryOffer =
    product.offers.find((o) => o.isPrimary) ?? product.offers[0];
  const price = primaryOffer?.displayedPrice?.toString();
  const original = primaryOffer?.originalPrice?.toString();
  const currency = primaryOffer?.currency;
  const discount = discountPercent(price, original);
  const compact = variant === "compact";

  return (
    <article
      className={cn(
        "group bg-card flex h-full flex-col overflow-hidden rounded-2xl border border-border transition-all duration-300 hover:-translate-y-0.5 hover:border-foreground/10 hover:shadow-md",
        className,
      )}
    >
      <Link
        href={`/products/${product.slug}`}
        className="relative block overflow-hidden"
        tabIndex={-1}
        aria-hidden
      >
        <div
          className={cn(
            "bg-muted relative w-full overflow-hidden",
            compact ? "aspect-square" : "aspect-[4/3]",
          )}
        >
          {image ? (
            <Image
              src={image}
              alt={product.images[0]?.altText ?? product.name}
              fill
              sizes="(max-width: 480px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
              priority={priority}
            />
          ) : (
            <div className="tile-fallback flex h-full items-center justify-center">
              <ImageOffIcon className="text-muted-foreground/50 size-7" aria-hidden />
            </div>
          )}

          {(product.recommended || discount) && (
            <div className="absolute inset-x-3 top-3 flex items-start justify-between gap-2">
              {product.recommended ? (
                <Badge className="shadow-sm backdrop-blur-sm">
                  <BadgeCheckIcon aria-hidden />
                  Pick
                </Badge>
              ) : (
                <span />
              )}
              {discount ? (
                <Badge
                  variant="destructive"
                  className="shadow-sm backdrop-blur-sm"
                >
                  −{discount}%
                </Badge>
              ) : null}
            </div>
          )}
        </div>
      </Link>

      <div
        className={cn(
          "flex flex-1 flex-col gap-2",
          compact ? "p-3.5" : "p-5",
        )}
      >
        <div className="flex items-center justify-between gap-2">
          {product.brand ? (
            <p className="text-muted-foreground truncate text-[11px] font-semibold tracking-[0.1em] uppercase">
              {product.brand}
            </p>
          ) : (
            <span />
          )}
          {primaryOffer?.retailerName ? (
            <p className="text-muted-foreground shrink-0 text-[11px] font-medium">
              {primaryOffer.retailerName}
            </p>
          ) : null}
        </div>

        <Link href={`/products/${product.slug}`} className="contents">
          <h3
            className={cn(
              "font-display font-semibold leading-snug tracking-tight transition-colors group-hover:text-primary",
              compact ? "text-[15px]" : "text-lg",
            )}
          >
            {product.name}
          </h3>
        </Link>

        {!compact && product.shortDescription ? (
          <p className="text-muted-foreground line-clamp-2 text-sm leading-relaxed">
            {product.shortDescription}
          </p>
        ) : null}

        <div className="mt-auto flex items-end justify-between gap-3 pt-3">
          <div className="min-w-0">
            {price ? (
              <div className="flex flex-wrap items-baseline gap-x-2">
                <span
                  className={cn(
                    "font-semibold tracking-tight",
                    compact ? "text-[15px]" : "text-xl",
                  )}
                >
                  {formatPrice(price, currency)}
                </span>
                {original && original !== price ? (
                  <span className="text-muted-foreground text-[13px] line-through">
                    {formatPrice(original, currency)}
                  </span>
                ) : null}
              </div>
            ) : null}
          </div>

          <span
            className={cn(
              "text-primary inline-flex shrink-0 items-center gap-1 font-semibold transition-transform duration-200 group-hover:translate-x-0.5",
              compact ? "text-[13px]" : "text-sm",
            )}
          >
            View
            <ArrowUpRightIcon
              className={compact ? "size-3.5" : "size-4"}
              aria-hidden
            />
          </span>
        </div>
      </div>
    </article>
  );
}

import Link from "next/link";
import Image from "next/image";
import { BadgeCheckIcon, HeartIcon, ArrowUpRightIcon } from "lucide-react";

import { formatPrice, discountPercent, cn } from "@/lib/utils";
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
  const primaryOffer =
    product.offers.find((o) => o.isPrimary) ?? product.offers[0];
  const price = primaryOffer?.displayedPrice?.toString();
  const original = primaryOffer?.originalPrice?.toString();
  const currency = primaryOffer?.currency;
  const discount = discountPercent(price, original);
  const ctaText = primaryOffer?.offerLabel ?? "View deal";

  const isLarge = style === "large";
  const isCompact = style === "compact";

  return (
    <article
      className={cn(
        "group bg-card relative flex flex-col overflow-hidden rounded-2xl border transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/5",
        isLarge && "md:col-span-2 md:row-span-2",
      )}
    >
      <Link href={`/products/${product.slug}`} className="relative block">
        <div
          className={cn(
            "bg-muted relative w-full overflow-hidden",
            isCompact ? "aspect-square" : isLarge ? "aspect-[16/10]" : "aspect-[4/3]",
          )}
        >
          {image ? (
            <Image
              src={image}
              alt={product.images[0]?.altText ?? product.name}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.06]"
            />
          ) : (
            <div className="text-muted-foreground flex h-full items-center justify-center">
              <HeartIcon className="size-8" aria-hidden />
            </div>
          )}
          {/* top badges */}
          <div className="absolute inset-x-3 top-3 flex items-start justify-between gap-2">
            {product.recommended ? (
              <span className="bg-primary text-primary-foreground inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold shadow-sm">
                <BadgeCheckIcon className="size-3" aria-hidden />
                Creator pick
              </span>
            ) : (
              <span />
            )}
            {discount ? (
              <span className="bg-destructive text-destructive-foreground rounded-full px-2.5 py-1 text-[11px] font-bold shadow-sm">
                -{discount}%
              </span>
            ) : null}
          </div>
          {/* hover CTA affordance */}
          <div className="bg-foreground/70 text-background absolute bottom-3 right-3 flex size-8 translate-y-1 items-center justify-center rounded-full opacity-0 backdrop-blur transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
            <ArrowUpRightIcon className="size-4" aria-hidden />
          </div>
        </div>
      </Link>

      <div className={cn("flex flex-1 flex-col gap-2 p-4", isCompact && "p-3")}>
        {product.brand ? (
          <p className="text-muted-foreground text-[11px] font-semibold uppercase tracking-wider">
            {product.brand}
          </p>
        ) : null}
        <Link href={`/products/${product.slug}`}>
          <h3
            className={cn(
              "font-display font-semibold leading-snug tracking-tight transition-colors group-hover:text-primary",
              isLarge ? "text-xl" : "text-base",
            )}
          >
            {product.name}
          </h3>
        </Link>
        {!isCompact && product.shortDescription ? (
          <p className="text-muted-foreground line-clamp-2 text-sm leading-relaxed">
            {product.shortDescription}
          </p>
        ) : null}

        <div className="mt-auto flex items-end justify-between gap-2 pt-3">
          <div className="min-w-0">
            {price ? (
              <div className="flex flex-wrap items-baseline gap-x-2">
                <span className={cn("font-bold", isCompact ? "text-base" : "text-lg")}>
                  {formatPrice(price, currency)}
                </span>
                {original && original !== price ? (
                  <span className="text-muted-foreground text-sm line-through">
                    {formatPrice(original, currency)}
                  </span>
                ) : null}
              </div>
            ) : null}
            {primaryOffer?.retailerName ? (
              <p className="text-muted-foreground mt-0.5 truncate text-xs">
                at {primaryOffer.retailerName}
              </p>
            ) : null}
          </div>
        </div>
      </div>

      {/* full-card CTA footer */}
      <div className="border-t px-4 py-3">
        <span className="text-primary inline-flex items-center gap-1 text-sm font-semibold">
          {ctaText}
          <ArrowUpRightIcon className="size-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden />
        </span>
      </div>
    </article>
  );
}

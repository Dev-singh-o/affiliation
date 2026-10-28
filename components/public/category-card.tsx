import Link from "next/link";
import Image from "next/image";
import { ArrowUpRightIcon, LayoutGridIcon } from "lucide-react";

import { cn } from "@/lib/utils";

export type CategoryTile = {
  id: string;
  name: string;
  slug: string;
  imageUrl: string | null;
  _count?: { products: number };
};

/**
 * Category tile: image-forward with a readable overlay, and a designed
 * fallback (never an empty grey box) when no image is configured.
 */
export function CategoryCard({
  category,
  className,
}: {
  category: CategoryTile;
  className?: string;
}) {
  const count = category._count?.products ?? 0;

  return (
    <Link
      href={`/categories/${category.slug}`}
      className={cn(
        "group bg-card relative flex aspect-[4/3] flex-col overflow-hidden rounded-2xl border border-border transition-all duration-300 hover:-translate-y-0.5 hover:border-foreground/10 hover:shadow-md focus-visible:ring-[3px] focus-visible:ring-ring/35 focus-visible:outline-none",
        className,
      )}
    >
      {category.imageUrl ? (
        <Image
          src={category.imageUrl}
          alt={category.name}
          fill
          sizes="(max-width: 480px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.05]"
        />
      ) : (
        <div className="tile-fallback absolute inset-0 flex items-center justify-center">
          <LayoutGridIcon
            className="text-primary/25 size-10 transition-transform duration-500 group-hover:scale-110"
            aria-hidden
          />
        </div>
      )}

      {/* Contrast overlay — stronger when an image sits underneath */}
      <div
        className={cn(
          "absolute inset-0",
          category.imageUrl
            ? "bg-gradient-to-t from-black/80 via-black/25 to-transparent"
            : "bg-gradient-to-t from-background/80 via-background/20 to-transparent",
        )}
      />

      <div className="relative mt-auto flex items-end justify-between gap-3 p-5">
        <div className="min-w-0">
          <h3
            className={cn(
              "font-display truncate text-lg font-semibold tracking-tight",
              category.imageUrl ? "text-white" : "text-foreground",
            )}
          >
            {category.name}
          </h3>
          <p
            className={cn(
              "mt-0.5 text-[13px]",
              category.imageUrl ? "text-white/75" : "text-muted-foreground",
            )}
          >
            {count} {count === 1 ? "product" : "products"}
          </p>
        </div>
        <span
          className={cn(
            "flex size-9 shrink-0 items-center justify-center rounded-full transition-all duration-300 group-hover:translate-x-0.5",
            category.imageUrl
              ? "bg-white/15 text-white backdrop-blur-sm"
              : "bg-background text-foreground border border-border",
          )}
        >
          <ArrowUpRightIcon className="size-4" aria-hidden />
        </span>
      </div>
    </Link>
  );
}

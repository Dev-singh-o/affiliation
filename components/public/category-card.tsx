import Link from "next/link";
import Image from "next/image";
import { ArrowRightIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import type { Prisma } from "@/lib/generated/prisma/client";

type CategoryWithCount = Prisma.CategoryGetPayload<{
  include: { _count: { select: { products: true } } };
}>;

export function CategoryCard({
  category,
  large = false,
}: {
  category: CategoryWithCount;
  large?: boolean;
}) {
  return (
    <Link
      href={`/categories/${category.slug}`}
      className={cn(
        "group relative block overflow-hidden rounded-2xl border transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/5",
        large ? "md:col-span-2" : "",
      )}
    >
      <div
        className={cn(
          "relative w-full overflow-hidden bg-muted",
          large ? "aspect-[16/9]" : "aspect-[4/3]",
        )}
      >
        {category.imageUrl ? (
          <Image
            src={category.imageUrl}
            alt={category.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.06]"
          />
        ) : (
          <div className="bg-gradient-to-br from-primary/20 to-accent absolute inset-0" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-5">
          <div>
            <h3 className="font-display text-xl font-semibold text-white sm:text-2xl">
              {category.name}
            </h3>
            <p className="mt-1 text-sm text-white/80">
              {category._count?.products ?? 0} products
            </p>
          </div>
          <span className="flex size-9 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur transition-transform duration-300 group-hover:translate-x-0.5">
            <ArrowRightIcon className="size-4" aria-hidden />
          </span>
        </div>
      </div>
    </Link>
  );
}

import Link from "next/link";
import Image from "next/image";

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
      className="group relative block overflow-hidden rounded-2xl border bg-card transition-shadow hover:shadow-lg"
    >
      <div className={`relative w-full overflow-hidden bg-muted ${large ? "aspect-[16/9]" : "aspect-[4/3]"}`}>
        {category.imageUrl ? (
          <Image
            src={category.imageUrl}
            alt={category.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : null}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-4">
          <h3 className="text-lg font-semibold text-white">{category.name}</h3>
          <p className="text-sm text-white/80">
            {category._count?.products ?? 0} products
          </p>
        </div>
      </div>
    </Link>
  );
}

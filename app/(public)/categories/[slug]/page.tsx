import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";

import { getCategoryBySlug } from "@/lib/categories/queries";
import { listPublishedProducts } from "@/lib/products/queries";
import { getSettings } from "@/lib/settings";
import { buildMetadata } from "@/lib/seo/metadata";
import { ProductCard } from "@/components/public/product-card";
import { Skeleton } from "@/components/ui/skeleton";

type Params = Promise<{ slug: string }>;
type Search = Promise<Record<string, string | string[] | undefined>>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) return { title: "Category not found" };
  return buildMetadata({
    title: category.seoTitle ?? category.name,
    description: category.seoDescription ?? category.description ?? undefined,
    ogImage: category.imageUrl ?? undefined,
    canonicalPath: `/categories/${category.slug}`,
  });
}

export default function CategoryPage({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: Search;
}) {
  return (
    <Suspense fallback={<CategorySkeleton />}>
      <CategoryBody params={params} searchParams={searchParams} />
    </Suspense>
  );
}

async function CategoryBody({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: Search;
}) {
  const { slug } = await params;
  const sp = await searchParams;
  const sort = (sp.sort === "name" || sp.sort === "popular" ? sp.sort : "newest") as
    | "newest"
    | "name"
    | "popular";
  const page = Math.max(1, Number(sp.page ?? 1) || 1);

  const category = await getCategoryBySlug(slug);
  if (!category || category.status !== "ACTIVE") {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 text-center">
        <h1 className="text-2xl font-bold">Category not found</h1>
        <Link href="/categories" className="text-primary mt-4 inline-block hover:underline">
          Browse categories
        </Link>
      </div>
    );
  }

  const settings = await getSettings();
  const pageSize = settings.general.productsPerPage;
  const result = await listPublishedProducts({
    category: slug,
    sort,
    page,
    pageSize,
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="mb-6 flex items-center gap-4">
        {category.imageUrl ? (
          <div className="relative h-20 w-20 overflow-hidden rounded-xl border bg-muted">
            <Image src={category.imageUrl} alt={category.name} fill className="object-cover" />
          </div>
        ) : null}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{category.name}</h1>
          {category.description ? (
            <p className="text-muted-foreground mt-1">{category.description}</p>
          ) : null}
          <p className="text-muted-foreground mt-1 text-sm">
            {result.total} product{result.total === 1 ? "" : "s"}
          </p>
        </div>
      </div>

      {result.items.length === 0 ? (
        <div className="text-muted-foreground rounded-xl border border-dashed p-12 text-center">
          No products in this category yet.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {result.items.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}

      {result.totalPages > 1 ? (
        <div className="mt-8 flex items-center justify-center gap-2">
          {Array.from({ length: result.totalPages }, (_, i) => i + 1).map((p) => {
            const params = new URLSearchParams();
            params.set("sort", sort);
            params.set("page", String(p));
            return (
              <Link
                key={p}
                href={`/categories/${slug}?${params.toString()}`}
                className={`rounded-md px-3 py-1.5 text-sm ${
                  p === result.page
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-muted"
                }`}
              >
                {p}
              </Link>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

function CategorySkeleton() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <Skeleton className="mb-6 h-10 w-48" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-80 w-full rounded-2xl" />
        ))}
      </div>
    </div>
  );
}

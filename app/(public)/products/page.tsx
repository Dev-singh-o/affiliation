import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { SearchIcon, SlidersHorizontalIcon } from "lucide-react";

import {
  listPublishedProducts,
  listAllBrands,
  listAllRetailers,
} from "@/lib/products/queries";
import { getActiveCategories } from "@/lib/categories/queries";
import { getSettings } from "@/lib/settings";
import { buildMetadata } from "@/lib/seo/metadata";
import { catalogQuerySchema } from "@/lib/validation/catalog";
import { ProductCard } from "@/components/public/product-card";
import { SectionHeader } from "@/components/public/section-header";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export async function generateMetadata(): Promise<Metadata> {
  return buildMetadata({
    title: "Products",
    description: "Browse every product I recommend.",
    canonicalPath: "/products",
  });
}

export default function ProductsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  return (
    <Suspense fallback={<ProductsSkeleton />}>
      <ProductsContent searchParams={searchParams} />
    </Suspense>
  );
}

async function ProductsContent({ searchParams }: { searchParams: SearchParams }) {
  const raw = await searchParams;
  const parsed = catalogQuerySchema.safeParse(raw);
  const query = parsed.success
    ? parsed.data
    : {
        q: undefined,
        category: undefined,
        retailer: undefined,
        brand: undefined,
        featured: undefined,
        sort: "newest" as const,
        page: 1,
      };

  const settings = await getSettings();
  const pageSize = settings.general.productsPerPage;

  const [result, categories, brands, retailers] = await Promise.all([
    listPublishedProducts({
      q: query.q,
      category: query.category,
      retailer: query.retailer,
      brand: query.brand,
      featured: query.featured,
      sort: query.sort,
      page: query.page,
      pageSize,
    }),
    getActiveCategories(),
    listAllBrands(),
    listAllRetailers(),
  ]);

  const hasFilters = Boolean(
    query.q || query.category || query.retailer || query.brand || query.featured,
  );

  const filtersForm = (
    <form method="get" className="grid gap-6">
      <div className="relative">
        <SearchIcon
          className="text-muted-foreground pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2"
          aria-hidden
        />
        <Input
          name="q"
          defaultValue={query.q ?? ""}
          placeholder="Search products or brands"
          className="pl-11"
          aria-label="Search products"
        />
      </div>

      <div className="grid gap-2">
        <label htmlFor="filter-category" className="text-sm font-medium">
          Category
        </label>
        <select
          id="filter-category"
          name="category"
          defaultValue={query.category ?? ""}
          className="border-input bg-background focus-visible:border-ring focus-visible:ring-ring/30 h-11 w-full rounded-lg border px-3.5 text-sm outline-none focus-visible:ring-[3px]"
        >
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.slug}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-2">
        <label htmlFor="filter-retailer" className="text-sm font-medium">
          Retailer
        </label>
        <select
          id="filter-retailer"
          name="retailer"
          defaultValue={query.retailer ?? ""}
          className="border-input bg-background focus-visible:border-ring focus-visible:ring-ring/30 h-11 w-full rounded-lg border px-3.5 text-sm outline-none focus-visible:ring-[3px]"
        >
          <option value="">All retailers</option>
          {retailers.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-2">
        <label htmlFor="filter-brand" className="text-sm font-medium">
          Brand
        </label>
        <select
          id="filter-brand"
          name="brand"
          defaultValue={query.brand ?? ""}
          className="border-input bg-background focus-visible:border-ring focus-visible:ring-ring/30 h-11 w-full rounded-lg border px-3.5 text-sm outline-none focus-visible:ring-[3px]"
        >
          <option value="">All brands</option>
          {brands.map((b) => (
            <option key={b} value={b}>
              {b}
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-2">
        <label htmlFor="filter-sort" className="text-sm font-medium">
          Sort by
        </label>
        <select
          id="filter-sort"
          name="sort"
          defaultValue={query.sort}
          className="border-input bg-background focus-visible:border-ring focus-visible:ring-ring/30 h-11 w-full rounded-lg border px-3.5 text-sm outline-none focus-visible:ring-[3px]"
        >
          <option value="newest">Newest first</option>
          <option value="name">Name A–Z</option>
          <option value="popular">Most popular</option>
        </select>
      </div>

      <label className="flex cursor-pointer items-center gap-2.5 text-sm font-medium">
        <input
          type="checkbox"
          name="featured"
          value="1"
          defaultChecked={query.featured === true}
          className="accent-primary size-4"
        />
        Featured only
      </label>

      <div className="flex gap-2">
        <Button type="submit" className="flex-1">
          Apply filters
        </Button>
        {hasFilters ? (
          <Button asChild variant="ghost">
            <Link href="/products">Clear</Link>
          </Button>
        ) : null}
      </div>
    </form>
  );

  return (
    <Container className="py-12 sm:py-16">
      <SectionHeader
        eyebrow="Collection"
        title="All products"
        description={`${result.total} ${result.total === 1 ? "product" : "products"} available.`}
        headingLevel="h1"
      />

      <div className="grid gap-10 lg:grid-cols-[260px_1fr] lg:gap-12">
        {/* Desktop filters */}
        <aside className="hidden lg:block">
          <div className="bg-card sticky top-28 rounded-2xl border border-border p-6">
            <div className="mb-6 flex items-center gap-2">
              <SlidersHorizontalIcon className="size-4" aria-hidden />
              <h2 className="text-sm font-semibold">Filters</h2>
            </div>
            {filtersForm}
          </div>
        </aside>

        <div>
          {/* Mobile filters */}
          <details className="bg-card mb-6 rounded-2xl border border-border lg:hidden">
            <summary className="flex cursor-pointer list-none items-center justify-between px-5 py-4 text-sm font-semibold">
              <span className="flex items-center gap-2">
                <SlidersHorizontalIcon className="size-4" aria-hidden />
                Filters
              </span>
              <span className="text-muted-foreground text-xs font-normal">
                {hasFilters ? "Active" : "None"}
              </span>
            </summary>
            <div className="border-t border-border px-5 py-5">{filtersForm}</div>
          </details>

          {result.items.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border px-6 py-20 text-center">
              <p className="font-display text-xl font-semibold">
                Nothing matches those filters
              </p>
              <p className="text-muted-foreground mx-auto mt-2 max-w-sm text-[15px] leading-relaxed">
                Try a different search term, or browse the full collection.
              </p>
              <Button asChild variant="outline" className="mt-6">
                <Link href="/products">View all products</Link>
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:gap-5 xl:grid-cols-3">
              {result.items.map((product, i) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  priority={i < 3}
                />
              ))}
            </div>
          )}

          {result.totalPages > 1 ? (
            <nav
              className="mt-12 flex items-center justify-center gap-1.5"
              aria-label="Pagination"
            >
              {Array.from({ length: result.totalPages }, (_, i) => i + 1).map(
                (page) => {
                  const params = new URLSearchParams();
                  if (query.q) params.set("q", query.q);
                  if (query.category) params.set("category", query.category);
                  if (query.retailer) params.set("retailer", query.retailer);
                  if (query.brand) params.set("brand", query.brand);
                  if (query.featured) params.set("featured", "1");
                  params.set("sort", query.sort);
                  params.set("page", String(page));
                  const isCurrent = page === result.page;
                  return (
                    <Link
                      key={page}
                      href={`/products?${params.toString()}`}
                      aria-current={isCurrent ? "page" : undefined}
                      className={
                        isCurrent
                          ? "bg-primary text-primary-foreground inline-flex size-10 items-center justify-center rounded-lg text-sm font-semibold"
                          : "hover:bg-muted inline-flex size-10 items-center justify-center rounded-lg text-sm font-medium transition-colors"
                      }
                    >
                      {page}
                    </Link>
                  );
                },
              )}
            </nav>
          ) : null}
        </div>
      </div>
    </Container>
  );
}

function ProductsSkeleton() {
  return (
    <Container className="py-12">
      <Skeleton className="mb-4 h-10 w-64" />
      <Skeleton className="mb-10 h-5 w-40" />
      <div className="grid gap-10 lg:grid-cols-[260px_1fr]">
        <Skeleton className="hidden h-96 rounded-2xl lg:block" />
        <div className="grid grid-cols-2 gap-4 sm:gap-5 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="aspect-[3/4] w-full rounded-2xl" />
          ))}
        </div>
      </div>
    </Container>
  );
}

import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { SearchIcon } from "lucide-react";

import { listPublishedProducts, listAllBrands, listAllRetailers } from "@/lib/products/queries";
import { getActiveCategories } from "@/lib/categories/queries";
import { getSettings } from "@/lib/settings";
import { buildMetadata } from "@/lib/seo/metadata";
import { catalogQuerySchema } from "@/lib/validation/catalog";
import { ProductCard } from "@/components/public/product-card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export async function generateMetadata(): Promise<Metadata> {
  return buildMetadata({
    title: "Products",
    description: "Browse all recommended products.",
    canonicalPath: "/products",
  });
}

export default function ProductsPage({ searchParams }: { searchParams: SearchParams }) {
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

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Products</h1>
        <p className="text-muted-foreground mt-1">
          {result.total} product{result.total === 1 ? "" : "s"} found
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[260px_1fr]">
        {/* Filters sidebar */}
        <aside className="space-y-6">
          <form method="get" className="grid gap-4">
            <div className="relative">
              <SearchIcon className="text-muted-foreground absolute left-3 top-1/2 size-4 -translate-y-1/2" />
              <Input
                name="q"
                defaultValue={query.q ?? ""}
                placeholder="Search products"
                className="pl-9"
              />
            </div>

            <div className="grid gap-2">
              <label className="text-sm font-medium">Category</label>
              <select
                name="category"
                defaultValue={query.category ?? ""}
                className="border-input flex h-9 rounded-md border bg-transparent px-3 text-sm"
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
              <label className="text-sm font-medium">Retailer</label>
              <select
                name="retailer"
                defaultValue={query.retailer ?? ""}
                className="border-input flex h-9 rounded-md border bg-transparent px-3 text-sm"
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
              <label className="text-sm font-medium">Brand</label>
              <select
                name="brand"
                defaultValue={query.brand ?? ""}
                className="border-input flex h-9 rounded-md border bg-transparent px-3 text-sm"
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
              <label className="text-sm font-medium">Sort</label>
              <select
                name="sort"
                defaultValue={query.sort}
                className="border-input flex h-9 rounded-md border bg-transparent px-3 text-sm"
              >
                <option value="newest">Newest</option>
                <option value="name">Name</option>
                <option value="popular">Popular</option>
              </select>
            </div>

            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                name="featured"
                value="1"
                defaultChecked={query.featured === true}
              />
              Featured only
            </label>

            <Button type="submit">Apply filters</Button>
          </form>
        </aside>

        {/* Grid */}
        <div>
          {result.items.length === 0 ? (
            <div className="text-muted-foreground rounded-xl border border-dashed p-12 text-center">
              No products match your filters.
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {result.items.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}

          {/* Pagination */}
          {result.totalPages > 1 ? (
            <div className="mt-8 flex items-center justify-center gap-2">
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
                  return (
                    <Link
                      key={page}
                      href={`/products?${params.toString()}`}
                      className={`rounded-md px-3 py-1.5 text-sm ${
                        page === result.page
                          ? "bg-primary text-primary-foreground"
                          : "hover:bg-muted"
                      }`}
                    >
                      {page}
                    </Link>
                  );
                },
              )}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function ProductsSkeleton() {
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

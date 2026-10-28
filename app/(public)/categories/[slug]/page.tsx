import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ChevronRightIcon } from "lucide-react";

import { getCategoryBySlug } from "@/lib/categories/queries";
import { listPublishedProducts } from "@/lib/products/queries";
import { getSettings } from "@/lib/settings";
import { buildMetadata } from "@/lib/seo/metadata";
import { ProductCard } from "@/components/public/product-card";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

type Params = Promise<{ slug: string }>;
type Search = Promise<Record<string, string | string[] | undefined>>;

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
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
      <Container className="py-24 text-center">
        <p className="font-display text-2xl font-semibold">Category not found</p>
        <Button asChild variant="outline" className="mt-6">
          <Link href="/categories">Browse categories</Link>
        </Button>
      </Container>
    );
  }

  const settings = await getSettings();
  const result = await listPublishedProducts({
    category: slug,
    sort,
    page,
    pageSize: settings.general.productsPerPage,
  });

  return (
    <>
      {/* Category header */}
      <div className="border-b border-border bg-card/40">
        <Container>
          <nav aria-label="Breadcrumb" className="pt-6">
            <ol className="text-muted-foreground flex items-center gap-1.5 text-[13px]">
              <li>
                <Link href="/" className="hover:text-foreground transition-colors">
                  Home
                </Link>
              </li>
              <ChevronRightIcon className="size-3.5" aria-hidden />
              <li>
                <Link
                  href="/categories"
                  className="hover:text-foreground transition-colors"
                >
                  Categories
                </Link>
              </li>
              <ChevronRightIcon className="size-3.5" aria-hidden />
              <li className="text-foreground font-medium">{category.name}</li>
            </ol>
          </nav>

          <div className="flex flex-col gap-5 py-8 sm:flex-row sm:items-center sm:gap-8 sm:py-10">
            {category.imageUrl ? (
              <div className="relative aspect-square w-24 shrink-0 overflow-hidden rounded-2xl border border-border sm:w-28">
                <Image
                  src={category.imageUrl}
                  alt={category.name}
                  fill
                  sizes="112px"
                  className="object-cover"
                  priority
                />
              </div>
            ) : null}
            <div>
              <h1 className="font-display text-editorial-lg font-semibold tracking-tight">
                {category.name}
              </h1>
              {category.description ? (
                <p className="text-muted-foreground mt-2 max-w-2xl text-[15px] leading-relaxed">
                  {category.description}
                </p>
              ) : null}
              <p className="text-muted-foreground mt-2 text-sm">
                {result.total} {result.total === 1 ? "product" : "products"}
              </p>
            </div>
          </div>
        </Container>
      </div>

      <Container className="py-12 sm:py-16">
        {result.items.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border px-6 py-20 text-center">
            <p className="font-display text-xl font-semibold">
              Nothing here yet
            </p>
            <p className="text-muted-foreground mx-auto mt-2 max-w-sm text-[15px]">
              Products in this category are coming soon.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4">
            {result.items.map((product, i) => (
              <ProductCard key={product.id} product={product} priority={i < 4} />
            ))}
          </div>
        )}

        {result.totalPages > 1 ? (
          <nav
            className="mt-12 flex items-center justify-center gap-1.5"
            aria-label="Pagination"
          >
            {Array.from({ length: result.totalPages }, (_, i) => i + 1).map((p) => {
              const params = new URLSearchParams();
              params.set("sort", sort);
              params.set("page", String(p));
              const isCurrent = p === result.page;
              return (
                <Link
                  key={p}
                  href={`/categories/${slug}?${params.toString()}`}
                  aria-current={isCurrent ? "page" : undefined}
                  className={
                    isCurrent
                      ? "bg-primary text-primary-foreground inline-flex size-10 items-center justify-center rounded-lg text-sm font-semibold"
                      : "hover:bg-muted inline-flex size-10 items-center justify-center rounded-lg text-sm font-medium transition-colors"
                  }
                >
                  {p}
                </Link>
              );
            })}
          </nav>
        ) : null}
      </Container>
    </>
  );
}

function CategorySkeleton() {
  return (
    <Container className="py-12">
      <Skeleton className="mb-8 h-10 w-56" />
      <div className="grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="aspect-[3/4] w-full rounded-2xl" />
        ))}
      </div>
    </Container>
  );
}

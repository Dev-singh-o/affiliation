import { getSettings } from "@/lib/settings";
import { getRecommendedProducts, getRecentProducts, getTrendingProducts } from "@/lib/products/queries";
import { CategoryCard } from "@/components/public/category-card";
import { ProductCard } from "@/components/public/product-card";
import type { Prisma } from "@/lib/generated/prisma/client";

type Product = Prisma.ProductGetPayload<{
  include: { images: true; categories: { include: { category: true } }; offers: true };
}>;

type Category = Prisma.CategoryGetPayload<{
  include: { _count: { select: { products: true } } };
}>;

const sectionTitles: Record<string, string> = {};

export async function SectionRenderer({
  sections,
  featuredProducts,
  featuredCategories,
}: {
  sections: Awaited<ReturnType<typeof getSettings>>["homepage"]["sections"];
  featuredProducts: Product[];
  featuredCategories: Category[];
}) {
  const settings = await getSettings();
  const enabledSections = [...sections]
    .filter((s) => s.enabled)
    .sort((a, b) => a.order - b.order);

  // Resolve products per section.
  const [trending, recent, recommended] = await Promise.all([
    getTrendingProducts(8),
    getRecentProducts(8),
    getRecommendedProducts(8),
  ]);

  const productsByType: Record<string, Product[]> = {
    featuredProducts: featuredProducts,
    trendingProducts: trending,
    recentProducts: recent,
    recommendedProducts: recommended,
  };

  return (
    <div className="space-y-12">
      {enabledSections.map((section) => {
        if (section.type === "banner" && section.banner) {
          return (
            <section key={section.id} className="rounded-2xl border bg-card p-8">
              <div className="grid gap-4 md:grid-cols-2 md:items-center">
                <div>
                  <h2 className="text-2xl font-bold tracking-tight">
                    {section.banner.heading}
                  </h2>
                  {section.banner.text ? (
                    <p className="text-muted-foreground mt-2">
                      {section.banner.text}
                    </p>
                  ) : null}
                  {section.banner.ctaLabel && section.banner.ctaHref ? (
                    <a
                      href={section.banner.ctaHref}
                      className="mt-4 inline-block rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
                    >
                      {section.banner.ctaLabel}
                    </a>
                  ) : null}
                </div>
                {section.banner.imageUrl ? (
                  <div className="relative aspect-video overflow-hidden rounded-xl">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={section.banner.imageUrl}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  </div>
                ) : null}
              </div>
            </section>
          );
        }

        if (section.type === "featuredCategories") {
          const cats =
            section.categoryIds.length > 0
              ? featuredCategories.filter((c) =>
                  section.categoryIds.includes(c.id),
                )
              : featuredCategories;
          const shown = cats.slice(0, section.limit);
          if (shown.length === 0) return null;
          return (
            <SectionWrapper key={section.id} title={section.title} subtitle={section.subtitle} ctaLabel={section.ctaLabel} ctaHref={section.ctaHref}>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {shown.map((category) => (
                  <CategoryCard key={category.id} category={category} />
                ))}
              </div>
            </SectionWrapper>
          );
        }

        if (section.type === "customProducts") {
          // Resolve by id from featured products (best effort for configured picks).
          const picked = section.productIds
            .map((id) => featuredProducts.find((p) => p.id === id))
            .filter(Boolean) as Product[];
          const shown = picked.slice(0, section.limit);
          if (shown.length === 0) return null;
          return (
            <SectionWrapper key={section.id} title={section.title} subtitle={section.subtitle} ctaLabel={section.ctaLabel} ctaHref={section.ctaHref}>
              <ProductGrid products={shown} layout={section.layout} />
            </SectionWrapper>
          );
        }

        const source = productsByType[section.type];
        if (!source) return null;
        const shown = source.slice(0, section.limit);
        if (shown.length === 0) return null;
        return (
          <SectionWrapper key={section.id} title={section.title} subtitle={section.subtitle} ctaLabel={section.ctaLabel} ctaHref={section.ctaHref}>
            <ProductGrid products={shown} layout={section.layout} />
          </SectionWrapper>
        );
      })}
    </div>
  );
}

function SectionWrapper({
  title,
  subtitle,
  ctaLabel,
  ctaHref,
  children,
}: {
  title: string;
  subtitle?: string;
  ctaLabel?: string;
  ctaHref?: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <div className="mb-4 flex items-end justify-between gap-4">
        <div>
          {title ? <h2 className="text-2xl font-bold tracking-tight">{title}</h2> : null}
          {subtitle ? <p className="text-muted-foreground mt-1">{subtitle}</p> : null}
        </div>
        {ctaLabel && ctaHref ? (
          <a href={ctaHref} className="text-sm font-medium text-primary hover:underline">
            {ctaLabel} →
          </a>
        ) : null}
      </div>
      {children}
    </section>
  );
}

function ProductGrid({
  products,
  layout,
}: {
  products: Product[];
  layout: "grid" | "large" | "compact" | "carousel";
}) {
  const cols =
    layout === "large"
      ? "grid gap-4 sm:grid-cols-2"
      : layout === "compact"
        ? "grid gap-3 sm:grid-cols-2 lg:grid-cols-4"
        : "grid gap-4 sm:grid-cols-2 lg:grid-cols-3";
  return (
    <div className={cols}>
      {products.map((product, index) => (
        <ProductCard
          key={product.id}
          product={product}
          style={layout === "large" && index === 0 ? "large" : layout === "compact" ? "compact" : "default"}
        />
      ))}
    </div>
  );
}

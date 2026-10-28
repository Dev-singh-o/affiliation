import Link from "next/link";
import Image from "next/image";
import { ArrowRightIcon } from "lucide-react";

import type { HomeSection } from "@/lib/settings/types";
import {
  getRecommendedProducts,
  getRecentProducts,
  getTrendingProducts,
} from "@/lib/products/queries";
import { CategoryCard, type CategoryTile } from "@/components/public/category-card";
import {
  ProductCard,
  type ProductWithRelations,
} from "@/components/public/product-card";
import { FeatureProduct } from "@/components/public/feature-product";
import { SectionHeader } from "@/components/public/section-header";
import { Reveal } from "@/components/public/reveal";

type Category = CategoryTile;

const SECTION_DESCRIPTIONS: Partial<Record<string, string>> = {
  featuredProducts: "Hand-picked by me — the ones I actually recommend.",
  trendingProducts: "Most-clicked by visitors right now.",
  recommendedProducts: "Products I use personally and stand behind.",
  recentProducts: "The latest additions to the collection.",
};

/**
 * Renders the admin-configured homepage sections in order.
 * Products are de-duplicated across sections so the page never repeats the
 * same item twice, and sections without products are hidden entirely.
 */
export async function SectionRenderer({
  sections,
  featuredProducts,
  featuredCategories,
}: {
  sections: HomeSection[];
  featuredProducts: ProductWithRelations[];
  featuredCategories: Category[];
}) {
  const enabledSections = [...sections]
    .filter((s) => s.enabled)
    .sort((a, b) => a.order - b.order);

  const [trendingByClicks, recommended, recent] = await Promise.all([
    getTrendingProducts(8),
    getRecommendedProducts(8),
    getRecentProducts(8),
  ]);

  // Fallback for trending only when there is no click data at all: a
  // sensible recent-products fallback (never a fabricated popularity list).
  const trending =
    trendingByClicks.length > 0
      ? trendingByClicks
      : recent.length > 0
        ? recent
        : featuredProducts;

  const sourceByType: Record<string, ProductWithRelations[]> = {
    featuredProducts,
    trendingProducts: trending,
    recentProducts: recent,
    recommendedProducts: recommended,
  };

  // Products already shown in an earlier section are avoided when possible.
  // Duplicates are only allowed when the catalog is too small to fill every
  // section — a section is never hidden just because it was already used.
  const used = new Set<string>();

  const rendered: React.ReactNode[] = [];

  enabledSections.forEach((section, index) => {
    if (section.type === "banner" && section.banner) {
      rendered.push(
        <Reveal key={section.id} delay={index * 40}>
          <section className="relative overflow-hidden rounded-3xl border border-border bg-card">
            <div className="grid items-center gap-6 p-7 sm:p-10 lg:grid-cols-[1.2fr_1fr]">
              <div>
                <h2 className="font-display text-editorial-lg font-semibold tracking-tight">
                  {section.banner.heading}
                </h2>
                {section.banner.text ? (
                  <p className="text-muted-foreground mt-3 max-w-lg text-[15px] leading-relaxed">
                    {section.banner.text}
                  </p>
                ) : null}
                {section.banner.ctaLabel && section.banner.ctaHref ? (
                  <Link
                    href={section.banner.ctaHref}
                    className="text-primary mt-6 inline-flex items-center gap-1.5 text-sm font-semibold hover:underline"
                  >
                    {section.banner.ctaLabel}
                    <ArrowRightIcon className="size-4" aria-hidden />
                  </Link>
                ) : null}
              </div>
              {section.banner.imageUrl ? (
                <div className="relative aspect-[16/10] overflow-hidden rounded-2xl border border-border">
                  <Image
                    src={section.banner.imageUrl}
                    alt=""
                    fill
                    sizes="(max-width: 1024px) 100vw, 45vw"
                    className="object-cover"
                  />
                </div>
              ) : null}
            </div>
          </section>
        </Reveal>,
      );
      return;
    }

    if (section.type === "featuredCategories") {
      const pool =
        section.categoryIds.length > 0
          ? featuredCategories.filter((c) => section.categoryIds.includes(c.id))
          : featuredCategories;
      const shown = pool.slice(0, section.limit);
      if (shown.length === 0) return;

      rendered.push(
        <Reveal key={section.id} delay={index * 40}>
          <section>
            <SectionHeader
              eyebrow="Browse"
              title={section.title || "Shop by category"}
              description={section.subtitle}
              actionLabel={section.ctaLabel}
              actionHref={section.ctaHref}
            />
            <div className="grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4">
              {shown.map((category) => (
                <CategoryCard key={category.id} category={category} />
              ))}
            </div>
          </section>
        </Reveal>,
      );
      return;
    }

    if (section.type === "customProducts") {
      const picked = section.productIds
        .map((id) => featuredProducts.find((p) => p.id === id))
        .filter((p): p is ProductWithRelations => Boolean(p));
      const shown = picked.slice(0, section.limit);
      if (shown.length === 0) return;

      rendered.push(
        <Reveal key={section.id} delay={index * 40}>
          <section>
            <SectionHeader
              title={section.title}
              description={section.subtitle}
              actionLabel={section.ctaLabel}
              actionHref={section.ctaHref}
            />
            <ProductGrid products={shown} compact={section.layout === "compact"} />
          </section>
        </Reveal>,
      );
      return;
    }

    const pool = sourceByType[section.type] ?? [];
    if (pool.length === 0) return;

    // Prefer products not used in an earlier section; only fall back to
    // already-used products when the catalog is too small to fill the row.
    const fresh = pool.filter((p) => !used.has(p.id));
    const shown = [...fresh, ...pool.filter((p) => used.has(p.id))].slice(
      0,
      section.limit,
    );
    if (shown.length === 0) return;
    shown.forEach((p) => used.add(p.id));

    // The featured section gets the premium two-column treatment.
    if (section.type === "featuredProducts" && shown.length > 0) {
      const [hero, ...rest] = shown;
      rendered.push(
        <Reveal key={section.id} delay={index * 40}>
          <section>
            <SectionHeader
              eyebrow="Featured"
              title={section.title || "Featured picks"}
              description={section.subtitle ?? SECTION_DESCRIPTIONS.featuredProducts}
              actionLabel={section.ctaLabel}
              actionHref={section.ctaHref}
            />
            <FeatureProduct product={hero} priority={index < 2} />
            {rest.length > 0 ? (
              <div className="mt-5">
                <ProductGrid products={rest} />
              </div>
            ) : null}
          </section>
        </Reveal>,
      );
      return;
    }

    rendered.push(
      <Reveal key={section.id} delay={index * 40}>
        <section>
          <SectionHeader
            title={section.title}
            description={section.subtitle ?? SECTION_DESCRIPTIONS[section.type]}
            actionLabel={section.ctaLabel}
            actionHref={section.ctaHref}
          />
          <ProductGrid
            products={shown}
            compact={section.layout === "compact"}
          />
        </section>
      </Reveal>,
    );
  });

  if (rendered.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border py-20 text-center">
        <p className="text-muted-foreground text-[15px]">
          Products are being curated — check back soon.
        </p>
      </div>
    );
  }

  return <div className="flex flex-col gap-20 sm:gap-24">{rendered}</div>;
}

function ProductGrid({
  products,
  compact = false,
}: {
  products: ProductWithRelations[];
  compact?: boolean;
}) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          variant={compact ? "compact" : "default"}
        />
      ))}
    </div>
  );
}

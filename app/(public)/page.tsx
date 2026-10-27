import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ArrowRightIcon } from "lucide-react";

import { getSettings } from "@/lib/settings";
import { getFeaturedProducts } from "@/lib/products/queries";
import { getFeaturedCategories } from "@/lib/categories/queries";
import { buildMetadata } from "@/lib/seo/metadata";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/public/product-card";
import { CategoryCard } from "@/components/public/category-card";
import { SectionRenderer } from "@/components/public/section-renderer";
import { Skeleton } from "@/components/ui/skeleton";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();
  return buildMetadata({
    title: settings.seo.siteTitle,
    description: settings.seo.defaultDescription,
    canonicalPath: "/",
  });
}

export default function HomePage() {
  return (
    <Suspense fallback={<HomeSkeleton />}>
      <HomeBody />
    </Suspense>
  );
}

async function HomeBody() {
  const settings = await getSettings();
  const [featuredProducts, featuredCategories] = await Promise.all([
    getFeaturedProducts(12),
    getFeaturedCategories(8),
  ]);

  const hero = settings.homepage.hero;

  return (
    <div>
      <section className="relative overflow-hidden">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24">
          <div className="grid items-center gap-10 lg:grid-cols-2">
            <div>
              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
                {hero.title}
              </h1>
              <p className="text-muted-foreground mt-4 text-lg">
                {hero.subtitle}
              </p>
              {hero.intro ? (
                <p className="text-muted-foreground mt-3">{hero.intro}</p>
              ) : null}
              <div className="mt-8 flex flex-wrap gap-3">
                <Button asChild size="lg">
                  <Link href={hero.primaryCtaHref}>
                    {hero.primaryCtaLabel}
                    <ArrowRightIcon />
                  </Link>
                </Button>
                {hero.secondaryCtaLabel ? (
                  <Button asChild size="lg" variant="outline">
                    <Link href={hero.secondaryCtaHref ?? "#"}>
                      {hero.secondaryCtaLabel}
                    </Link>
                  </Button>
                ) : null}
              </div>
            </div>
            {hero.imageUrl ? (
              <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border">
                <Image
                  src={hero.imageUrl}
                  alt={hero.title}
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover"
                  priority
                />
              </div>
            ) : null}
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 pb-16 sm:px-6">
        <SectionRenderer
          sections={settings.homepage.sections}
          featuredProducts={featuredProducts}
          featuredCategories={featuredCategories}
        />
      </div>
    </div>
  );
}

function HomeSkeleton() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
      <Skeleton className="mb-6 h-12 w-2/3" />
      <Skeleton className="h-64 w-full rounded-2xl" />
    </div>
  );
}

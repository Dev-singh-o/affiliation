import { Suspense } from "react";
import type { Metadata } from "next";
import { Hero } from "@/components/public/hero";

import { getSettings } from "@/lib/settings";
import { getFeaturedProducts } from "@/lib/products/queries";
import { getFeaturedCategories } from "@/lib/categories/queries";
import { buildMetadata } from "@/lib/seo/metadata";
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
      <Hero
        hero={hero}
        branding={settings.branding}
        socialLinks={settings.social.links}
      />

      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
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

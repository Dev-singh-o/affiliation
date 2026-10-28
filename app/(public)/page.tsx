import { Suspense } from "react";
import type { Metadata } from "next";

import { getSettings } from "@/lib/settings";
import { getFeaturedProducts } from "@/lib/products/queries";
import { getFeaturedCategories } from "@/lib/categories/queries";
import { buildMetadata } from "@/lib/seo/metadata";
import { Container } from "@/components/ui/container";
import { Hero } from "@/components/public/hero";
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
    getFeaturedProducts(8),
    getFeaturedCategories(8),
  ]);

  const hero = settings.homepage.hero;

  return (
    <>
      <Hero
        hero={hero}
        branding={settings.branding}
        socialLinks={settings.social.links}
      />

      <Container className="py-16 sm:py-20 lg:py-24">
        <SectionRenderer
          sections={settings.homepage.sections}
          featuredProducts={featuredProducts}
          featuredCategories={featuredCategories}
        />
      </Container>
    </>
  );
}

function HomeSkeleton() {
  return (
    <div>
      <div className="hero-wash border-b border-border">
        <Container className="py-16">
          <Skeleton className="h-6 w-32 rounded-full" />
          <Skeleton className="mt-6 h-16 w-full max-w-2xl" />
          <Skeleton className="mt-4 h-6 w-full max-w-xl" />
        </Container>
      </div>
      <Container className="py-16">
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="aspect-[4/3] w-full rounded-2xl" />
          ))}
        </div>
      </Container>
    </div>
  );
}

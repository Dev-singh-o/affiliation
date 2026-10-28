import { Suspense } from "react";
import type { Metadata } from "next";

import { getActiveCategories } from "@/lib/categories/queries";
import { buildMetadata } from "@/lib/seo/metadata";
import { CategoryCard } from "@/components/public/category-card";
import { SectionHeader } from "@/components/public/section-header";
import { Container } from "@/components/ui/container";
import { Skeleton } from "@/components/ui/skeleton";

export async function generateMetadata(): Promise<Metadata> {
  return buildMetadata({
    title: "Categories",
    description: "Browse every product category.",
    canonicalPath: "/categories",
  });
}

export default function CategoriesPage() {
  return (
    <Suspense fallback={<CategoriesSkeleton />}>
      <CategoriesContent />
    </Suspense>
  );
}

async function CategoriesContent() {
  const categories = await getActiveCategories();

  return (
    <Container className="py-12 sm:py-16">
      <SectionHeader
        eyebrow="Browse"
        title="Shop by category"
        description="Everything I recommend, organised so you can find it fast."
        headingLevel="h1"
      />

      {categories.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border px-6 py-20 text-center">
          <p className="font-display text-xl font-semibold">No categories yet</p>
          <p className="text-muted-foreground mt-2 text-[15px]">
            Categories are being set up — check back soon.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4">
          {categories.map((category) => (
            <CategoryCard key={category.id} category={category} />
          ))}
        </div>
      )}
    </Container>
  );
}

function CategoriesSkeleton() {
  return (
    <Container className="py-12">
      <Skeleton className="mb-10 h-10 w-72" />
      <div className="grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="aspect-[4/3] w-full rounded-2xl" />
        ))}
      </div>
    </Container>
  );
}

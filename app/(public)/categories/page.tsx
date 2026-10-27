import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";

import { getActiveCategories } from "@/lib/categories/queries";
import { buildMetadata } from "@/lib/seo/metadata";
import { CategoryCard } from "@/components/public/category-card";
import { Skeleton } from "@/components/ui/skeleton";

export async function generateMetadata(): Promise<Metadata> {
  return buildMetadata({
    title: "Categories",
    description: "Browse all product categories.",
    canonicalPath: "/categories",
  });
}

export default function CategoriesPage() {
  return (
    <Suspense fallback={<Skeleton className="h-96 w-full" />}>
      <CategoriesContent />
    </Suspense>
  );
}

async function CategoriesContent() {
  const categories = await getActiveCategories();
  if (categories.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 text-center">
        <h1 className="text-2xl font-bold">No categories yet</h1>
      </div>
    );
  }
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <h1 className="mb-6 text-3xl font-bold tracking-tight">Categories</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((category) => (
          <CategoryCard key={category.id} category={category} />
        ))}
      </div>
    </div>
  );
}

import { cacheLife, cacheTag } from "next/cache";

import { prisma, withRetry } from "@/lib/db/prisma";

export async function getActiveCategories() {
  "use cache";
  cacheLife("hours");
  cacheTag("categories");
  try {
    return await withRetry(() =>
      prisma.category.findMany({
        where: { status: "ACTIVE" },
        orderBy: [{ featured: "desc" }, { displayOrder: "asc" }, { name: "asc" }],
        include: {
          _count: {
            select: {
              products: { where: { product: { status: "PUBLISHED" } } },
            },
          },
        },
      }),
    );
  } catch (error) {
    console.error("Failed to load categories:", error);
    return [];
  }
}

export async function getFeaturedCategories(limit = 6) {
  "use cache";
  cacheLife("hours");
  cacheTag("categories");
  try {
    return await withRetry(() =>
      prisma.category.findMany({
        where: { status: "ACTIVE", featured: true },
        orderBy: [{ displayOrder: "asc" }, { name: "asc" }],
        take: limit,
        include: {
          _count: {
            select: {
              products: { where: { product: { status: "PUBLISHED" } } },
            },
          },
        },
      }),
    );
  } catch (error) {
    console.error("Failed to load featured categories:", error);
    return [];
  }
}

export async function getCategoryBySlug(slug: string) {
  "use cache";
  cacheLife("hours");
  cacheTag("categories");
  try {
    return await withRetry(() =>
      prisma.category.findUnique({
        where: { slug },
        include: {
          _count: {
            select: {
              products: { where: { product: { status: "PUBLISHED" } } },
            },
          },
        },
      }),
    );
  } catch (error) {
    console.error("Failed to load category:", error);
    return null;
  }
}

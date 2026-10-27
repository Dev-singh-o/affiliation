import { cacheLife, cacheTag } from "next/cache";

import { prisma } from "@/lib/db/prisma";

const productInclude = {
  images: { orderBy: { displayOrder: "asc" as const } },
  categories: { include: { category: true } },
  offers: {
    where: { status: "ACTIVE" as const },
    orderBy: [{ isPrimary: "desc" as const }, { createdAt: "asc" as const }],
  },
};

/** All published products, paginated, with filtering. */
/**
 * Convert non-serializable Prisma values (Decimal) into plain strings so
 * cached results can be serialized by Next.js (Cache Components).
 */
function serializeProduct<T>(product: T): T {
  if (!product || typeof product !== "object") return product;
  const result = { ...(product as Record<string, unknown>) };
  if (Array.isArray(result.offers)) {
    result.offers = (result.offers as Array<Record<string, unknown>>).map(
      (offer) => ({
        ...offer,
        displayedPrice:
          offer.displayedPrice != null &&
          typeof (offer.displayedPrice as { toString?: () => string }).toString ===
            "function"
            ? (offer.displayedPrice as { toString: () => string }).toString()
            : offer.displayedPrice,
        originalPrice:
          offer.originalPrice != null &&
          typeof (offer.originalPrice as { toString?: () => string }).toString ===
            "function"
            ? (offer.originalPrice as { toString: () => string }).toString()
            : offer.originalPrice,
      }),
    );
  }
  if (Array.isArray(result.images)) {
    result.images = (result.images as Array<Record<string, unknown>>).map(
      (img) => ({ ...img }),
    );
  }
  if (Array.isArray(result.categories)) {
    result.categories = (result.categories as Array<Record<string, unknown>>).map(
      (c) => ({ ...c }),
    );
  }
  return result as T;
}

function serializeProducts<T>(products: T[]): T[] {
  return products.map((p) => serializeProduct(p));
}

export async function listPublishedProducts(params: {
  q?: string;
  category?: string;
  retailer?: string;
  brand?: string;
  featured?: boolean;
  sort?: "newest" | "name" | "popular";
  page?: number;
  pageSize?: number;
}) {
  "use cache";
  cacheLife("minutes");
  cacheTag("products");

  const where: Record<string, unknown> = { status: "PUBLISHED" };
  if (params.q) {
    where.OR = [
      { name: { contains: params.q, mode: "insensitive" } },
      { brand: { contains: params.q, mode: "insensitive" } },
      { shortDescription: { contains: params.q, mode: "insensitive" } },
    ];
  }
  if (params.brand) where.brand = { contains: params.brand, mode: "insensitive" };
  if (params.featured) where.featured = true;
  if (params.category) {
    where.categories = { some: { category: { slug: params.category } } };
  }
  if (params.retailer) {
    where.offers = {
      some: { retailerName: { contains: params.retailer, mode: "insensitive" }, status: "ACTIVE" },
    };
  }

  const orderBy =
    params.sort === "name"
      ? { name: "asc" as const }
      : params.sort === "popular"
        ? { displayOrder: "asc" as const }
        : { publishedAt: "desc" as const };

  const page = Math.max(1, params.page ?? 1);
  const pageSize = Math.min(60, Math.max(1, params.pageSize ?? 12));

  try {
    const [items, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: productInclude,
        orderBy,
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.product.count({ where }),
    ]);
    return { items: serializeProducts(items), total, page, pageSize, totalPages: Math.max(1, Math.ceil(total / pageSize)) };
  } catch (error) {
    console.error("Failed to list products:", error);
    return { items: [], total: 0, page, pageSize, totalPages: 1 };
  }
}

export async function getProductBySlug(slug: string) {
  "use cache";
  cacheLife("minutes");
  cacheTag("products");

  // Honor legacy redirects: if someone hits an old slug, the page layer
  // calls permanentRedirect. We expose the redirect target here.
  try {
    const redirect = await prisma.productRedirect.findUnique({
      where: { oldSlug: slug },
      select: { product: { select: { slug: true } } },
    });
    if (redirect?.product) {
      return { kind: "redirect" as const, slug: redirect.product.slug };
    }

    const product = await prisma.product.findUnique({
      where: { slug },
      include: productInclude,
    });
    if (!product || product.status !== "PUBLISHED") {
      return null;
    }
    return { kind: "product" as const, product: serializeProduct(product) };
  } catch (error) {
    console.error("Failed to load product:", error);
    return null;
  }
}

export async function getFeaturedProducts(limit = 6) {
  "use cache";
  cacheLife("minutes");
  cacheTag("products");
  try {
    return serializeProducts(await prisma.product.findMany({
      where: { status: "PUBLISHED", featured: true },
      include: productInclude,
      orderBy: [{ displayOrder: "asc" }, { publishedAt: "desc" }],
      take: limit,
    }));
  } catch (error) {
    console.error("Failed to load featured products:", error);
    return [];
  }
}

export async function getRecommendedProducts(limit = 8) {
  "use cache";
  cacheLife("minutes");
  cacheTag("products");
  try {
    return await prisma.product.findMany({
      where: { status: "PUBLISHED", recommended: true },
      include: productInclude,
      orderBy: [{ displayOrder: "asc" }, { publishedAt: "desc" }],
      take: limit,
    });
  } catch (error) {
    console.error("Failed to load recommended products:", error);
    return [];
  }
}

export async function getRecentProducts(limit = 8) {
  "use cache";
  cacheLife("minutes");
  cacheTag("products");
  try {
    return await prisma.product.findMany({
      where: { status: "PUBLISHED" },
      include: productInclude,
      orderBy: { publishedAt: "desc" },
      take: limit,
    });
  } catch (error) {
    console.error("Failed to load recent products:", error);
    return [];
  }
}

export async function getTrendingProducts(limit = 8) {
  "use cache";
  cacheLife("minutes");
  cacheTag("products");
  // "Trending" = featured OR recommended, falling back to newest.
  try {
    const featured = await prisma.product.findMany({
      where: { status: "PUBLISHED", OR: [{ featured: true }, { recommended: true }] },
      include: productInclude,
      orderBy: [{ displayOrder: "asc" }, { publishedAt: "desc" }],
      take: limit,
    });
    if (featured.length >= limit) return featured;
    const more = await prisma.product.findMany({
      where: { status: "PUBLISHED", NOT: { id: { in: featured.map((p) => p.id) } } },
      include: productInclude,
      orderBy: { publishedAt: "desc" },
      take: limit - featured.length,
    });
    return [...featured, ...more];
  } catch (error) {
    console.error("Failed to load trending products:", error);
    return [];
  }
}

export async function getRelatedProducts(productId: string, categoryIds: string[], limit = 4) {
  "use cache";
  cacheLife("minutes");
  cacheTag("products");
  try {
    return await prisma.product.findMany({
      where: {
        status: "PUBLISHED",
        id: { not: productId },
        ...(categoryIds.length > 0
          ? { categories: { some: { categoryId: { in: categoryIds } } } }
          : {}),
      },
      include: productInclude,
      orderBy: { publishedAt: "desc" },
      take: limit,
    });
  } catch (error) {
    console.error("Failed to load related products:", error);
    return [];
  }
}

export async function listAllBrands(): Promise<string[]> {
  "use cache";
  cacheLife("hours");
  cacheTag("products");
  try {
    const rows = await prisma.product.findMany({
      where: { status: "PUBLISHED", brand: { not: null } },
      select: { brand: true },
      distinct: ["brand"],
    });
    return rows
      .map((r) => r.brand)
      .filter((b): b is string => Boolean(b))
      .sort((a, b) => a.localeCompare(b));
  } catch (error) {
    console.error("Failed to load brands:", error);
    return [];
  }
}

export async function listAllRetailers(): Promise<string[]> {
  "use cache";
  cacheLife("hours");
  cacheTag("products");
  try {
    const rows = await prisma.affiliateOffer.findMany({
      where: { status: "ACTIVE", product: { status: "PUBLISHED" } },
      select: { retailerName: true },
      distinct: ["retailerName"],
    });
    return rows.map((r) => r.retailerName).sort((a, b) => a.localeCompare(b));
  } catch (error) {
    console.error("Failed to load retailers:", error);
    r
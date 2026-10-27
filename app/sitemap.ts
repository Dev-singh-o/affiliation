import type { MetadataRoute } from "next";
import { prisma } from "@/lib/db/prisma";
import { getSettings } from "@/lib/settings";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/+$/, "");
  const settings = await getSettings().catch(() => null);

  const products = await prisma.product
    .findMany({
      where: { status: "PUBLISHED" },
      select: { slug: true, updatedAt: true },
    })
    .catch(() => []);

  const categories = await prisma.category
    .findMany({
      where: { status: "ACTIVE" },
      select: { slug: true, updatedAt: true },
    })
    .catch(() => []);

  const pages = await prisma.contentPage
    .findMany({
      where: { status: "PUBLISHED" },
      select: { slug: true, updatedAt: true },
    })
    .catch(() => []);

  const urls: MetadataRoute.Sitemap = [
    { url: `${siteUrl}/`, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    { url: `${siteUrl}/products`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${siteUrl}/categories`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
  ];

  for (const p of products) {
    urls.push({
      url: `${siteUrl}/products/${p.slug}`,
      lastModified: p.updatedAt,
      changeFrequency: "weekly",
      priority: 0.7,
    });
  }
  for (const c of categories) {
    urls.push({
      url: `${siteUrl}/categories/${c.slug}`,
      lastModified: c.updatedAt,
      changeFrequency: "weekly",
      priority: 0.6,
    });
  }
  for (const pg of pages) {
    urls.push({
      url: `${siteUrl}/pages/${pg.slug}`,
      lastModified: pg.updatedAt,
      changeFrequency: "monthly",
      priority: 0.5,
    });
  }

  void settings;
  return urls;
}

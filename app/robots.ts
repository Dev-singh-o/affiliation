import type { MetadataRoute } from "next";
import { getSettings } from "@/lib/settings";

export default async function robots(): Promise<MetadataRoute.Robots> {
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/+$/, "");
  const settings = await getSettings().catch(() => null);
  const allowIndexing = settings?.seo.allowIndexing ?? true;

  return {
    rules: allowIndexing
      ? { userAgent: "*", allow: "/" }
      : { userAgent: "*", disallow: "/" },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}

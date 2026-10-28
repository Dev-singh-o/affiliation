import type { Metadata } from "next";

import { getSettings } from "@/lib/settings";

export async function buildMetadata(input: {
  title?: string;
  description?: string;
  ogImage?: string;
  canonicalPath?: string;
  noIndex?: boolean;
}): Promise<Metadata> {
  const settings = await getSettings();
  const seo = settings.seo;
  const branding = settings.branding;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, "") ?? "http://localhost:3000";

  const title = input.title
    ? seo.titleTemplate.replace("%s", input.title)
    : seo.siteTitle;
  const description = input.description ?? seo.defaultDescription;
  const ogImage = input.ogImage ?? seo.defaultOgImageUrl ?? branding.defaultOgImageUrl;

  return {
    title,
    description,
    metadataBase: new URL(siteUrl),
    alternates: input.canonicalPath
      ? { canonical: input.canonicalPath }
      : undefined,
    openGraph: {
      title,
      description,
      url: input.canonicalPath ? `${siteUrl}${input.canonicalPath}` : siteUrl,
      siteName: branding.siteName,
      type: "website",
      images: ogImage ? [{ url: ogImage }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ogImage ? [ogImage] : undefined,
    },
    robots: input.noIndex || !seo.allowIndexing ? { index: false, follow: false } : { index: true, follow: true },
  };
}

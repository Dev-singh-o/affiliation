import { z } from "zod";

const hexColor = z
  .string()
  .regex(/^#(?:[0-9a-fA-F]{3}){1,2}$/, "Must be a hex color like #7c3aed");

const optionalUrl = z
  .string()
  .trim()
  .optional()
  .transform((v) => (v === "" ? undefined : v))
  .pipe(z.string().max(2048).optional());

export const brandingSchema = z.object({
  siteName: z.string().trim().min(1).max(80),
  creatorName: z.string().trim().min(1).max(80),
  tagline: z.string().trim().max(160).default(""),
  logoUrl: optionalUrl,
  faviconUrl: optionalUrl,
  profileImageUrl: optionalUrl,
  primaryColor: hexColor.optional(),
  defaultOgImageUrl: optionalUrl,
});

const ctaHref = z
  .string()
  .trim()
  .max(2048)
  .refine(
    (v) =>
      v.startsWith("/") ||
      v.startsWith("#") ||
      v.startsWith("https://") ||
      v.startsWith("http://"),
    "Must be a site path (starting with /) or an http(s) URL",
  );

export const homeSectionSchema = z.object({
  id: z.string().min(1).max(60),
  type: z.enum([
    "featuredProducts",
    "trendingProducts",
    "recentProducts",
    "recommendedProducts",
    "featuredCategories",
    "customProducts",
    "banner",
  ]),
  enabled: z.boolean(),
  order: z.number().int(),
  title: z.string().trim().max(120).default(""),
  subtitle: z.string().trim().max(200).optional(),
  layout: z.enum(["grid", "large", "compact", "carousel"]),
  limit: z.number().int().min(1).max(48),
  productIds: z.array(z.string()).max(48),
  categoryIds: z.array(z.string()).max(24),
  ctaLabel: z.string().trim().max(60).optional(),
  ctaHref: ctaHref.optional(),
  banner: z
    .object({
      heading: z.string().trim().max(120),
      text: z.string().trim().max(300).optional(),
      imageUrl: optionalUrl,
      ctaLabel: z.string().trim().max(60).optional(),
      ctaHref: ctaHref.optional(),
    })
    .optional(),
});

export const homepageSchema = z.object({
  hero: z.object({
    title: z.string().trim().max(140).default(""),
    subtitle: z.string().trim().max(220).default(""),
    intro: z.string().trim().max(600).optional(),
    imageUrl: optionalUrl,
    primaryCtaLabel: z.string().trim().max(60).default("Browse products"),
    primaryCtaHref: ctaHref.default("/products"),
    secondaryCtaLabel: z.string().trim().max(60).optional(),
    secondaryCtaHref: ctaHref.optional(),
  }),
  sections: z.array(homeSectionSchema).max(24),
});

export const navItemSchema = z.object({
  id: z.string().min(1).max(60),
  label: z.string().trim().min(1).max(60),
  href: ctaHref,
  enabled: z.boolean(),
  order: z.number().int(),
  external: z.boolean(),
});

export const navigationSchema = z.object({
  header: z.array(navItemSchema).max(12),
  footer: z.array(navItemSchema).max(20),
});

export const socialLinkSchema = z.object({
  id: z.string().min(1).max(60),
  platform: z.string().trim().min(1).max(30),
  url: z.url().max(2048),
  label: z.string().trim().max(60).optional(),
  enabled: z.boolean(),
  order: z.number().int(),
});

export const socialSchema = z.object({
  links: z.array(socialLinkSchema).max(12),
});

export const seoSchema = z.object({
  siteTitle: z.string().trim().min(1).max(80),
  titleTemplate: z.string().trim().max(100).default("%s"),
  defaultDescription: z.string().trim().max(300).default(""),
  defaultOgImageUrl: optionalUrl,
  allowIndexing: z.boolean(),
});

export const affiliateSchema = z.object({
  disclosureText: z.string().trim().max(2000).default(""),
  approvedDomains: z
    .array(
      z
        .string()
        .trim()
        .toLowerCase()
        .regex(/^(\*\.)?[a-z0-9-]+(\.[a-z0-9-]+)+$/, "Invalid domain"),
    )
    .max(100),
  defaultCtaLabel: z.string().trim().max(60).default("Check price"),
  campaignLabels: z.array(z.string().trim().toLowerCase().max(40)).max(30),
});

export const generalSchema = z.object({
  defaultCurrency: z
    .string()
    .trim()
    .toUpperCase()
    .regex(/^[A-Z]{3}$/, "Must be a 3-letter ISO currency code"),
  locale: z.string().trim().min(2).max(20),
  timezone: z.string().trim().min(1).max(60),
  productsPerPage: z.number().int().min(4).max(60),
  analyticsRetentionDays: z.number().int().min(0).max(3650),
  defaultSort: z.enum(["newest", "name", "popular"]),
});

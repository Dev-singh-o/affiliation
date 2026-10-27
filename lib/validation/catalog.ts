import { z } from "zod";

import { isValidSlug } from "@/lib/slug";

const slugField = z
  .string()
  .trim()
  .toLowerCase()
  .max(80)
  .refine((v) => v === "" || isValidSlug(v), {
    message: "Use lowercase letters, numbers, and hyphens only",
  })
  .optional();

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .transform((v) => (v === "" ? undefined : v));

export const productImageSchema = z.object({
  id: z.string().optional(),
  imageUrl: z.string().trim().min(1).max(2048),
  altText: z.string().trim().max(200).optional(),
  displayOrder: z.number().int().min(0),
});

export const productSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(160),
  slug: slugField,
  shortDescription: optionalText(300),
  description: optionalText(20000),
  brand: optionalText(80),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]),
  featured: z.boolean(),
  recommended: z.boolean(),
  displayOrder: z.number().int().min(0),
  recommendationText: optionalText(2000),
  features: z.array(z.string().trim().min(1).max(200)).max(30),
  seoTitle: optionalText(80),
  seoDescription: optionalText(300),
  categoryIds: z.array(z.string()).max(20),
  images: z.array(productImageSchema).max(12),
});

export type ProductInput = z.infer<typeof productSchema>;

export const categorySchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
  slug: slugField,
  description: optionalText(1000),
  imageUrl: optionalText(2048),
  status: z.enum(["ACTIVE", "ARCHIVED"]),
  featured: z.boolean(),
  displayOrder: z.number().int().min(0),
  seoTitle: optionalText(80),
  seoDescription: optionalText(300),
});

export type CategoryInput = z.infer<typeof categorySchema>;

const money = z
  .union([z.number(), z.string()])
  .optional()
  .transform((v) => (v === "" || v === undefined ? undefined : Number(v)))
  .pipe(z.number().min(0).max(999999999).optional());

export const affiliateOfferSchema = z.object({
  retailerName: z.string().trim().min(1, "Retailer name is required").max(80),
  affiliateNetwork: optionalText(80),
  affiliateUrl: z
    .string()
    .trim()
    .min(1, "Affiliate URL is required")
    .max(2048)
    .refine((v) => /^https?:\/\//.test(v), "Must be an http(s) URL"),
  offerLabel: optionalText(80),
  displayedPrice: money,
  originalPrice: money,
  currency: z
    .string()
    .trim()
    .toUpperCase()
    .regex(/^[A-Z]{3}$/, "3-letter ISO code")
    .optional()
    .or(z.literal("").transform(() => undefined)),
  availabilityStatus: z.enum(["UNKNOWN", "IN_STOCK", "OUT_OF_STOCK", "PREORDER"]),
  isPrimary: z.boolean(),
  trackingLabel: optionalText(60),
  status: z.enum(["ACTIVE", "INACTIVE"]),
});

export type AffiliateOfferInput = z.infer<typeof affiliateOfferSchema>;

export const contentPageSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(160),
  slug: slugField,
  content: z.string().trim().max(100000).default(""),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]),
  seoTitle: optionalText(80),
  seoDescription: optionalText(300),
});

export type ContentPageInput = z.infer<typeof contentPageSchema>;

/** Public search/filter query params. */
export const catalogQuerySchema = z.object({
  q: z.string().trim().max(120).optional(),
  category: z.string().trim().max(80).optional(),
  retailer: z.string().trim().max(80).optional(),
  brand: z.string().trim().max(80).optional(),
  featured: z
    .enum(["1", "true"])
    .optional()
    .transform((v) => v === "1" || v === "true"),
  sort: z.enum(["newest", "name", "popular"]).default("newest"),
  page: z.coerce.number().int().min(1).default(1),
});

export type CatalogQuery = z.infer<typeof catalogQuerySchema>;

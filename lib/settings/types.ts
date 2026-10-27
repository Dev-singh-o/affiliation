/**
 * Typed website settings stored as JSON in the SiteSetting table.
 * Every value has a safe default so the site works before the admin
 * configures anything.
 */

export type SectionType =
  | "featuredProducts"
  | "trendingProducts"
  | "recentProducts"
  | "recommendedProducts"
  | "featuredCategories"
  | "customProducts"
  | "banner";

export type SectionLayout = "grid" | "large" | "compact" | "carousel";

export interface HomeSection {
  id: string;
  type: SectionType;
  enabled: boolean;
  order: number;
  title: string;
  subtitle?: string;
  layout: SectionLayout;
  /** Max items to show for product/category sections. */
  limit: number;
  /** For customProducts sections: explicit product selection (ordered). */
  productIds: string[];
  /** For featuredCategories: explicit category selection (ordered; empty = auto). */
  categoryIds: string[];
  /** Optional CTA shown at the end of the section. */
  ctaLabel?: string;
  ctaHref?: string;
  /** Banner sections only. */
  banner?: {
    heading: string;
    text?: string;
    imageUrl?: string;
    ctaLabel?: string;
    ctaHref?: string;
  };
}

export interface NavItem {
  id: string;
  label: string;
  href: string;
  enabled: boolean;
  order: number;
  external: boolean;
}

export interface SocialLink {
  id: string;
  platform: string; // e.g. instagram, youtube, facebook, tiktok, x, other
  url: string;
  label?: string;
  enabled: boolean;
  order: number;
}

export interface BrandingSettings {
  siteName: string;
  creatorName: string;
  tagline: string;
  logoUrl?: string;
  faviconUrl?: string;
  profileImageUrl?: string;
  /** Hex color, applied as --primary at runtime. */
  primaryColor?: string;
  defaultOgImageUrl?: string;
}

export interface HeroSettings {
  title: string;
  subtitle: string;
  intro?: string;
  imageUrl?: string;
  primaryCtaLabel: string;
  primaryCtaHref: string;
  secondaryCtaLabel?: string;
  secondaryCtaHref?: string;
}

export interface HomepageSettings {
  hero: HeroSettings;
  sections: HomeSection[];
}

export interface NavigationSettings {
  header: NavItem[];
  footer: NavItem[];
}

export interface SocialSettings {
  links: SocialLink[];
}

export interface SeoSettings {
  siteTitle: string;
  titleTemplate: string; // e.g. "%s | Site Name"
  defaultDescription: string;
  defaultOgImageUrl?: string;
  /** Allow search engine indexing. */
  allowIndexing: boolean;
}

export interface AffiliateSettings {
  disclosureText: string;
  /** Empty = allow all valid http(s) destinations. */
  approvedDomains: string[];
  defaultCtaLabel: string;
  campaignLabels: string[];
}

export interface GeneralSettings {
  defaultCurrency: string;
  locale: string;
  timezone: string;
  productsPerPage: number;
  analyticsRetentionDays: number; // 0 = keep forever
  defaultSort: "newest" | "name" | "popular";
}

export interface SettingsMap {
  branding: BrandingSettings;
  homepage: HomepageSettings;
  navigation: NavigationSettings;
  social: SocialSettings;
  seo: SeoSettings;
  affiliate: AffiliateSettings;
  general: GeneralSettings;
}

export type SettingKey = keyof SettingsMap;

export const defaultSections: HomeSection[] = [
  {
    id: "sec-featured-categories",
    type: "featuredCategories",
    enabled: true,
    order: 10,
    title: "Shop by category",
    subtitle: "",
    layout: "grid",
    limit: 6,
    productIds: [],
    categoryIds: [],
  },
  {
    id: "sec-featured-products",
    type: "featuredProducts",
    enabled: true,
    order: 20,
    title: "Featured picks",
    subtitle: "",
    layout: "large",
    limit: 6,
    productIds: [],
    categoryIds: [],
    ctaLabel: "View all products",
    ctaHref: "/products",
  },
  {
    id: "sec-trending",
    type: "trendingProducts",
    enabled: true,
    order: 30,
    title: "Trending now",
    subtitle: "",
    layout: "grid",
    limit: 8,
    productIds: [],
    categoryIds: [],
  },
  {
    id: "sec-recommended",
    type: "recommendedProducts",
    enabled: true,
    order: 40,
    title: "My recommendations",
    subtitle: "",
    layout: "grid",
    limit: 8,
    productIds: [],
    categoryIds: [],
  },
  {
    id: "sec-recent",
    type: "recentProducts",
    enabled: true,
    order: 50,
    title: "Recently added",
    subtitle: "",
    layout: "grid",
    limit: 8,
    productIds: [],
    categoryIds: [],
    ctaLabel: "Browse everything",
    ctaHref: "/products",
  },
];

export const defaultSettings: SettingsMap = {
  branding: {
    siteName: "Creator Picks",
    creatorName: "Creator",
    tagline: "Products I genuinely use and recommend",
  },
  homepage: {
    hero: {
      title: "Products I genuinely use and recommend",
      subtitle: "Every product here is hand-picked from my videos and posts.",
      intro: "",
      primaryCtaLabel: "Browse products",
      primaryCtaHref: "/products",
      secondaryCtaLabel: "About me",
      secondaryCtaHref: "/pages/about",
    },
    sections: defaultSections,
  },
  navigation: {
    header: [
      { id: "nav-home", label: "Home", href: "/", enabled: true, order: 1, external: false },
      { id: "nav-products", label: "Products", href: "/products", enabled: true, order: 2, external: false },
      { id: "nav-categories", label: "Categories", href: "/categories", enabled: true, order: 3, external: false },
      { id: "nav-about", label: "About", href: "/pages/about", enabled: true, order: 4, external: false },
    ],
    footer: [
      { id: "ft-products", label: "Products", href: "/products", enabled: true, order: 1, external: false },
      { id: "ft-categories", label: "Categories", href: "/categories", enabled: true, order: 2, external: false },
      { id: "ft-disclosure", label: "Affiliate disclosure", href: "/pages/affiliate-disclosure", enabled: true, order: 3, external: false },
      { id: "ft-privacy", label: "Privacy policy", href: "/pages/privacy-policy", enabled: true, order: 4, external: false },
      { id: "ft-terms", label: "Terms", href: "/pages/terms", enabled: true, order: 5, external: false },
    ],
  },
  social: {
    links: [],
  },
  seo: {
    siteTitle: "Creator Picks",
    titleTemplate: "%s | Creator Picks",
    defaultDescription:
      "Hand-picked product recommendations from my videos and posts.",
    allowIndexing: true,
  },
  affiliate: {
    disclosureText:
      "Some links on this site are affiliate links. If you buy through them, I may earn a commission at no extra cost to you. I only recommend products I genuinely use or believe in.",
    approvedDomains: [],
    defaultCtaLabel: "Check price",
    campaignLabels: ["instagram", "youtube", "tiktok", "newsletter"],
  },
  general: {
    defaultCurrency: "USD",
    locale: "en-US",
    timezone: "UTC",
    productsPerPage: 12,
    analyticsRetentionDays: 0,
    defaultSort: "newest",
  },
};

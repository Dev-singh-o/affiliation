import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Format a decimal-ish value as a localized price. Never invent pricing. */
export function formatPrice(
  value: number | string | null | undefined,
  currency: string | null | undefined,
  locale = "en-US",
): string | null {
  if (value === null || value === undefined || value === "") return null;
  const num = typeof value === "string" ? Number(value) : value;
  if (Number.isNaN(num)) return null;
  const cur = currency && /^[A-Z]{3}$/.test(currency) ? currency : "USD";
  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: cur,
    }).format(num);
  } catch {
    return `${cur} ${num.toFixed(2)}`;
  }
}

export function formatDate(date: Date | string, locale = "en-US"): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(d);
}

export function formatNumber(value: number, locale = "en-US"): string {
  return new Intl.NumberFormat(locale).format(value);
}

/** Percentage discount between two prices; null when data is missing/invalid. */
export function discountPercent(
  price: number | string | null | undefined,
  original: number | string | null | undefined,
): number | null {
  if (price == null || original == null) return null;
  const p = Number(price);
  const o = Number(original);
  if (Number.isNaN(p) || Number.isNaN(o) || o <= 0 || p >= o) return null;
  return Math.round(((o - p) / o) * 100);
}

import { cacheLife, cacheTag } from "next/cache";

import { prisma } from "@/lib/db/prisma";
import {
  defaultSettings,
  type SettingKey,
  type SettingsMap,
} from "@/lib/settings/types";
import {
  affiliateSchema,
  brandingSchema,
  generalSchema,
  homepageSchema,
  navigationSchema,
  seoSchema,
  socialSchema,
} from "@/lib/validation/settings";

const schemas = {
  branding: brandingSchema,
  homepage: homepageSchema,
  navigation: navigationSchema,
  social: socialSchema,
  seo: seoSchema,
  affiliate: affiliateSchema,
  general: generalSchema,
} as const;

/**
 * Cached read of all website settings, merged over safe defaults.
 * Invalid stored values fall back to defaults (never crash the storefront).
 * Invalidated via updateTag("settings") in settings server actions.
 */
export async function getSettings(): Promise<SettingsMap> {
  "use cache";
  cacheLife("hours");
  cacheTag("settings");

  let rows: { key: string; value: unknown }[] = [];
  try {
    rows = await prisma.siteSetting.findMany({
      select: { key: true, value: true },
    });
  } catch (error) {
    // DB unavailable (e.g. first build without env) — serve defaults.
    console.error("Failed to load settings, using defaults:", error);
    return defaultSettings;
  }

  const stored = new Map(rows.map((r) => [r.key, r.value]));
  const result = { ...defaultSettings } as SettingsMap;

  (Object.keys(schemas) as SettingKey[]).forEach((key) => {
    const raw = stored.get(key);
    if (raw === undefined) return;
    const merged =
      raw !== null && typeof raw === "object" && !Array.isArray(raw)
        ? { ...defaultSettings[key], ...(raw as Record<string, unknown>) }
        : raw;
    const parsed = schemas[key].safeParse(merged);
    if (parsed.success) {
      (result[key] as unknown) = parsed.data;
    }
  });

  return result;
}

export async function getSetting<K extends SettingKey>(
  key: K,
): Promise<SettingsMap[K]> {
  const all = await getSettings();
  return all[key];
}

/** Validated write. Call `updateTag("settings")` afterwards (server action). */
export async function writeSetting<K extends SettingKey>(
  key: K,
  value: unknown,
): Promise<{ ok: true; data: SettingsMap[K] } | { ok: false; error: string }> {
  const merged =
    value !== null && typeof value === "object" && !Array.isArray(value)
      ? { ...defaultSettings[key], ...(value as Record<string, unknown>) }
      : value;
  const parsed = schemas[key].safeParse(merged);
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    return {
      ok: false,
      error: `${first?.path.join(".") ?? key}: ${first?.message ?? "invalid value"}`,
    };
  }
  await prisma.siteSetting.upsert({
    where: { key },
    create: { key, value: parsed.data },
    update: { value: parsed.data },
  });
  return { ok: true, data: parsed.data as SettingsMap[K] };
}

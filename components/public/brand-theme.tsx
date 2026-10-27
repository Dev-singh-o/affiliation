import { getSettings } from "@/lib/settings";

/** Relative luminance (0–1) of a #rrggbb color for contrast decisions. */
function luminance(hex: string): number {
  const m = hex.replace("#", "");
  if (m.length !== 6) return 0.2;
  const r = parseInt(m.slice(0, 2), 16) / 255;
  const g = parseInt(m.slice(2, 4), 16) / 255;
  const b = parseInt(m.slice(4, 6), 16) / 255;
  const f = (c: number) =>
    c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
}

/**
 * Injects the admin-configured brand color as runtime CSS custom properties,
 * so the whole design system (buttons, links, rings, hero gradient) follows
 * the creator's color without a redeploy.
 */
export async function BrandTheme() {
  const { branding } = await getSettings();
  const color = branding.primaryColor;
  if (!color || !/^#[0-9a-fA-F]{6}$/.test(color)) return null;

  const darkText = luminance(color) > 0.45;
  const foreground = darkText ? "oklch(0.18 0.01 60)" : "oklch(0.985 0 0)";

  const css = `:root{--primary:${color};--ring:${color};--primary-foreground:${foreground};--accent:color-mix(in oklab, ${color} 12%, var(--background));--accent-foreground:${color};}`;
  return <style dangerouslySetInnerHTML={{ __html: css }} />;
}

import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";

/**
 * Generates local SVG placeholder imagery for the demo seed so the
 * storefront always renders — no dependency on a third-party image CDN.
 * Real products get real uploaded images via the admin panel.
 */

const OUT = path.join(process.cwd(), "public", "images");
mkdirSync(OUT, { recursive: true });

type Palette = { bg: string; glow: string; ink: string };

const PALETTES: Palette[] = [
  { bg: "#efe9ff", glow: "#c9b8ff", ink: "#4c3bb0" },
  { bg: "#fdf0e6", glow: "#f6c9a3", ink: "#8a4b22" },
  { bg: "#e8f4ef", glow: "#a8dcc8", ink: "#1f6b52" },
  { bg: "#f0f1f5", glow: "#c7cbd8", ink: "#3f4757" },
  { bg: "#fdeaf0", glow: "#f5b8cc", ink: "#9c2f55" },
  { bg: "#eaf0fb", glow: "#b4c9f0", ink: "#2c4f8f" },
  { bg: "#f6f2e4", glow: "#ddd2a4", ink: "#6b5a1f" },
  { bg: "#e9f2f4", glow: "#b0d8de", ink: "#26606b" },
  { bg: "#f7eef2", glow: "#e4b9cb", ink: "#7c3a54" },
  { bg: "#eef0e6", glow: "#cbd6ab", ink: "#4d5c2a" },
];

function productSvg(index: number, label: string) {
  const p = PALETTES[index % PALETTES.length];
  const initials = label
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="900" viewBox="0 0 1200 900" role="img" aria-label="${label}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${p.bg}"/>
      <stop offset="100%" stop-color="#ffffff"/>
    </linearGradient>
    <radialGradient id="glow" cx="50%" cy="42%" r="55%">
      <stop offset="0%" stop-color="${p.glow}" stop-opacity="0.85"/>
      <stop offset="100%" stop-color="${p.glow}" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="1200" height="900" fill="url(#bg)"/>
  <rect width="1200" height="900" fill="url(#glow)"/>
  <g opacity="0.16" fill="none" stroke="${p.ink}" stroke-width="2">
    <circle cx="600" cy="390" r="190"/>
    <circle cx="600" cy="390" r="250"/>
    <circle cx="600" cy="390" r="310"/>
  </g>
  <rect x="470" y="286" width="260" height="300" rx="44" fill="#ffffff" opacity="0.9"/>
  <rect x="470" y="286" width="260" height="300" rx="44" fill="none" stroke="${p.ink}" stroke-opacity="0.18" stroke-width="3"/>
  <text x="600" y="450" text-anchor="middle" font-family="Georgia, 'Times New Roman', serif" font-size="104" fill="${p.ink}" fill-opacity="0.85">${initials}</text>
  <text x="600" y="700" text-anchor="middle" font-family="system-ui, -apple-system, 'Segoe UI', sans-serif" font-size="34" fill="${p.ink}" fill-opacity="0.6" letter-spacing="1">${label.length > 42 ? `${label.slice(0, 40)}…` : label}</text>
</svg>
`;
}

function categorySvg(index: number, label: string) {
  const p = PALETTES[(index + 3) % PALETTES.length];
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="900" viewBox="0 0 1200 900" role="img" aria-label="${label}">
  <defs>
    <linearGradient id="cbg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${p.bg}"/>
      <stop offset="100%" stop-color="#ffffff"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="900" fill="url(#cbg)"/>
  <g fill="none" stroke="${p.ink}" stroke-opacity="0.22" stroke-width="3">
    <rect x="150" y="150" width="360" height="300" rx="36"/>
    <rect x="580" y="150" width="470" height="300" rx="36"/>
    <rect x="150" y="500" width="900" height="260" rx="36"/>
  </g>
  <g fill="${p.ink}" fill-opacity="0.5">
    <circle cx="330" cy="300" r="52"/>
    <rect x="640" y="250" width="350" height="24" rx="12"/>
    <rect x="640" y="300" width="260" height="18" rx="9"/>
    <rect x="210" y="600" width="500" height="22" rx="11"/>
    <rect x="210" y="648" width="380" height="16" rx="8"/>
  </g>
  <text x="600" y="840" text-anchor="middle" font-family="system-ui, -apple-system, 'Segoe UI', sans-serif" font-size="38" fill="${p.ink}" fill-opacity="0.65" letter-spacing="2">${label.toUpperCase()}</text>
</svg>
`;
}

const products = [
  ["wireless-headphones", "Wireless Headphones"],
  ["mechanical-keyboard", "Mechanical Keyboard"],
  ["4k-webcam", "4K Webcam"],
  ["cast-iron-skillet", "Cast Iron Skillet"],
  ["pour-over-dripper", "Pour Over Dripper"],
  ["adjustable-dumbbells", "Adjustable Dumbbells"],
  ["foam-roller", "Recovery Foam Roller"],
  ["carry-on-backpack", "Carry On Backpack"],
  ["packing-cubes", "Packing Cubes"],
  ["monitor-light-bar", "Monitor Light Bar"],
] as const;

const categories = [
  ["tech-gadgets", "Tech & Gadgets"],
  ["home-kitchen", "Home & Kitchen"],
  ["fitness", "Fitness"],
  ["travel", "Travel"],
  ["desk-setup", "Desk Setup"],
] as const;

products.forEach(([slug, label], i) => {
  writeFileSync(path.join(OUT, `${slug}.svg`), productSvg(i, label), "utf8");
});
categories.forEach(([slug, label], i) => {
  writeFileSync(path.join(OUT, `cat-${slug}.svg`), categorySvg(i, label), "utf8");
});

console.log(`Generated ${products.length + categories.length} placeholder images in public/images`);

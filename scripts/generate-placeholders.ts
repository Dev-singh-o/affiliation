import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";

/**
 * Generates local SVG placeholder imagery for the demo seed so the
 * storefront always renders — no dependency on a third-party image CDN.
 * Real products get real uploaded images via the admin panel.
 */

const OUT = path.join(process.cwd(), "public", "images");
mkdirSync(OUT, { recursive: true });

/** Escape text for safe inclusion in XML/SVG (a raw "&" breaks parsing). */
function xml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

type Palette = { bg: string; glow: string; ink: string; soft: string };

const PALETTES: Palette[] = [
  { bg: "#efe9ff", glow: "#c9b8ff", ink: "#4c3bb0", soft: "#f5f1ff" },
  { bg: "#fdf0e6", glow: "#f6c9a3", ink: "#8a4b22", soft: "#fff6ef" },
  { bg: "#e8f4ef", glow: "#a8dcc8", ink: "#1f6b52", soft: "#f1faf6" },
  { bg: "#f0f1f5", glow: "#c7cbd8", ink: "#3f4757", soft: "#f8f9fb" },
  { bg: "#fdeaf0", glow: "#f5b8cc", ink: "#9c2f55", soft: "#fff3f7" },
  { bg: "#eaf0fb", glow: "#b4c9f0", ink: "#2c4f8f", soft: "#f2f6fd" },
  { bg: "#f6f2e4", glow: "#ddd2a4", ink: "#6b5a1f", soft: "#fbf8ee" },
  { bg: "#e9f2f4", glow: "#b0d8de", ink: "#26606b", soft: "#f2f9fa" },
  { bg: "#f7eef2", glow: "#e4b9cb", ink: "#7c3a54", soft: "#fcf4f7" },
  { bg: "#eef0e6", glow: "#cbd6ab", ink: "#4d5c2a", soft: "#f6f8f1" },
];

function frame(p: Palette, id: string) {
  return `<defs>
    <linearGradient id="bg-${id}" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${p.bg}"/>
      <stop offset="100%" stop-color="#ffffff"/>
    </linearGradient>
    <radialGradient id="glow-${id}" cx="50%" cy="38%" r="60%">
      <stop offset="0%" stop-color="${p.glow}" stop-opacity="0.75"/>
      <stop offset="100%" stop-color="${p.glow}" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="1200" height="900" fill="url(#bg-${id})"/>
  <rect width="1200" height="900" fill="url(#glow-${id})"/>`;
}

/* ---------------------------------------------------------------- */
/* Product imagery                                                  */
/* ---------------------------------------------------------------- */

function productSvg(index: number, slug: string, label: string) {
  const p = PALETTES[index % PALETTES.length];
  const id = `p${index}`;
  const initials = label
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="900" viewBox="0 0 1200 900" role="img" aria-label="${xml(label)}">
  ${frame(p, id)}
  <g opacity="0.14" fill="none" stroke="${p.ink}" stroke-width="2">
    <circle cx="600" cy="380" r="200"/>
    <circle cx="600" cy="380" r="262"/>
    <circle cx="600" cy="380" r="324"/>
  </g>
  <rect x="455" y="265" width="290" height="330" rx="48" fill="${p.soft}" stroke="${p.ink}" stroke-opacity="0.2" stroke-width="3"/>
  <text x="600" y="455" text-anchor="middle" font-family="Georgia, 'Times New Roman', serif" font-size="112" fill="${p.ink}" fill-opacity="0.85">${xml(initials)}</text>
  <text x="600" y="710" text-anchor="middle" font-family="system-ui, -apple-system, 'Segoe UI', sans-serif" font-size="34" fill="${p.ink}" fill-opacity="0.55" letter-spacing="1">${xml(label.length > 40 ? `${label.slice(0, 38)}…` : label)}</text>
</svg>
`;
}

/* ---------------------------------------------------------------- */
/* Category imagery — distinct motif per category                    */
/* ---------------------------------------------------------------- */

type Motif = (ink: string, soft: string) => string;

const MOTIFS: Record<string, Motif> = {
  "tech-gadgets": (ink, soft) => `
    <g fill="none" stroke="${ink}" stroke-opacity="0.55" stroke-width="10" stroke-linecap="round" stroke-linejoin="round">
      <rect x="470" y="250" width="260" height="400" rx="36"/>
      <line x1="530" y1="600" x2="670" y2="600"/>
    </g>
    <rect x="500" y="290" width="200" height="260" rx="20" fill="${soft}"/>
    <circle cx="600" cy="410" r="54" fill="none" stroke="${ink}" stroke-opacity="0.45" stroke-width="9"/>
    <circle cx="600" cy="410" r="16" fill="${ink}" fill-opacity="0.4"/>`,

  "home-kitchen": (ink, soft) => `
    <g fill="none" stroke="${ink}" stroke-opacity="0.55" stroke-width="10" stroke-linecap="round" stroke-linejoin="round">
      <path d="M420 360 h360 v150 a40 40 0 0 1 -40 40 h-280 a40 40 0 0 1 -40 -40 z"/>
      <line x1="390" y1="360" x2="810" y2="360"/>
      <path d="M760 360 a90 90 0 0 1 90 90"/>
    </g>
    <rect x="450" y="392" width="300" height="120" rx="18" fill="${soft}"/>
    <path d="M500 300 q40 -70 80 0" fill="none" stroke="${ink}" stroke-opacity="0.32" stroke-width="9" stroke-linecap="round"/>`,

  fitness: (ink, soft) => `
    <g fill="none" stroke="${ink}" stroke-opacity="0.55" stroke-width="10" stroke-linecap="round">
      <line x1="330" y1="450" x2="870" y2="450"/>
      <rect x="380" y="360" width="90" height="180" rx="22" fill="${soft}"/>
      <rect x="730" y="360" width="90" height="180" rx="22" fill="${soft}"/>
      <line x1="470" y1="450" x2="470" y2="450"/>
      <line x1="730" y1="450" x2="730" y2="450"/>
    </g>
    <rect x="540" y="424" width="120" height="52" rx="16" fill="${soft}"/>
    <path d="M420 620 q180 60 360 0" fill="none" stroke="${ink}" stroke-opacity="0.25" stroke-width="9" stroke-linecap="round"/>`,

  travel: (ink, soft) => `
    <g fill="none" stroke="${ink}" stroke-opacity="0.55" stroke-width="10" stroke-linecap="round" stroke-linejoin="round">
      <rect x="450" y="270" width="300" height="380" rx="40"/>
      <path d="M530 270 v-40 a70 70 0 0 1 140 0 v40"/>
      <line x1="450" y1="380" x2="750" y2="380"/>
    </g>
    <rect x="500" y="410" width="200" height="200" rx="22" fill="${soft}"/>
    <circle cx="600" cy="470" r="34" fill="none" stroke="${ink}" stroke-opacity="0.4" stroke-width="9"/>`,

  "desk-setup": (ink, soft) => `
    <g fill="none" stroke="${ink}" stroke-opacity="0.55" stroke-width="10" stroke-linecap="round" stroke-linejoin="round">
      <rect x="360" y="260" width="480" height="300" rx="26"/>
      <line x1="600" y1="560" x2="600" y2="620"/>
      <line x1="500" y1="620" x2="700" y2="620"/>
    </g>
    <rect x="400" y="300" width="400" height="220" rx="14" fill="${soft}"/>
    <line x1="450" y1="470" x2="620" y2="380" stroke="${ink}" stroke-opacity="0.35" stroke-width="9" stroke-linecap="round"/>
    <circle cx="660" cy="360" r="22" fill="${ink}" fill-opacity="0.28"/>`,
};

function categorySvg(index: number, slug: string, label: string) {
  const p = PALETTES[(index + 2) % PALETTES.length];
  const id = `c${index}`;
  const motif = MOTIFS[slug] ?? MOTIFS["tech-gadgets"];

  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="900" viewBox="0 0 1200 900" role="img" aria-label="${xml(label)}">
  ${frame(p, id)}
  <g opacity="0.12" fill="none" stroke="${p.ink}" stroke-width="2">
    <circle cx="600" cy="430" r="330"/>
    <circle cx="600" cy="430" r="400"/>
  </g>
  ${motif(p.ink, p.soft)}
  <text x="600" y="790" text-anchor="middle" font-family="system-ui, -apple-system, 'Segoe UI', sans-serif" font-size="42" font-weight="600" fill="${p.ink}" fill-opacity="0.6" letter-spacing="3">${xml(label.toUpperCase())}</text>
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
  writeFileSync(path.join(OUT, `${slug}.svg`), productSvg(i, slug, label), "utf8");
});
categories.forEach(([slug, label], i) => {
  writeFileSync(path.join(OUT, `cat-${slug}.svg`), categorySvg(i, slug, label), "utf8");
});

console.log(
  `Generated ${products.length} product + ${categories.length} category images in public/images`,
);

import "dotenv/config";

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../lib/generated/prisma/client";

const connectionString = process.env.DIRECT_URL ?? process.env.DATABASE_URL;
if (!connectionString) {
  console.error("Set DIRECT_URL or DATABASE_URL in .env");
  process.exit(1);
}

const adapter = new PrismaPg({ connectionString, ssl: { rejectUnauthorized: false } });
const prisma = new PrismaClient({ adapter });

const IMG = (id: string) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=900&q=80`;

type SeedProduct = {
  name: string;
  slug: string;
  brand: string;
  shortDescription: string;
  description: string;
  price: number;
  originalPrice?: number;
  retailer: string;
  image: string;
  category: string;
  featured?: boolean;
  recommended?: boolean;
  features: string[];
};

const CATEGORIES = [
  {
    name: "Tech & Gadgets",
    slug: "tech-gadgets",
    description: "Devices and accessories I use every day.",
    image: IMG("photo-1519389950473-47ba0277781c"),
    featured: true,
  },
  {
    name: "Home & Kitchen",
    slug: "home-kitchen",
    description: "Tools that make everyday life easier.",
    image: IMG("photo-1556911220-bff31c812dba"),
    featured: true,
  },
  {
    name: "Fitness",
    slug: "fitness",
    description: "Gear for training and recovery.",
    image: IMG("photo-1517836357463-d25dfeac3438"),
    featured: true,
  },
  {
    name: "Travel",
    slug: "travel",
    description: "Carry-on essentials and travel tech.",
    image: IMG("photo-1488646953014-85cb44e25828"),
    featured: false,
  },
  {
    name: "Desk Setup",
    slug: "desk-setup",
    description: "A calmer, better workspace.",
    image: IMG("photo-1497366754035-f200968a6e72"),
    featured: false,
  },
];

const PRODUCTS: SeedProduct[] = [
  {
    name: "Wireless Noise-Cancelling Headphones",
    slug: "wireless-noise-cancelling-headphones",
    brand: "SoundPro",
    shortDescription: "My go-to headphones for editing and long flights.",
    description:
      "Comfortable, long battery life, and excellent noise cancellation. These are the headphones I wear in almost every video and on every long-haul flight.",
    price: 199.99,
    originalPrice: 249.99,
    retailer: "Amazon",
    image: IMG("photo-1505740420928-5e560c06d30e"),
    category: "tech-gadgets",
    featured: true,
    recommended: true,
    features: [
      "30-hour battery life",
      "Hybrid active noise cancellation",
      "Folds flat for travel",
    ],
  },
  {
    name: "Mechanical Keyboard, Hot-Swap",
    slug: "mechanical-keyboard-hot-swap",
    brand: "KeyForge",
    shortDescription: "Quiet, tactile, and endlessly repairable.",
    description:
      "A hot-swappable mechanical keyboard with a gasket mount. Quiet enough for calls, satisfying enough to type all day.",
    price: 129,
    retailer: "Amazon",
    image: IMG("photo-1587829741301-dc798b83add3"),
    category: "desk-setup",
    featured: true,
    features: ["Hot-swappable switches", "PBT keycaps", "USB-C and Bluetooth"],
  },
  {
    name: "4K Webcam with Auto-Framing",
    slug: "4k-webcam-auto-framing",
    brand: "Lumen",
    shortDescription: "Sharp on camera without the harsh studio look.",
    description:
      "Auto-framing keeps me centred, and the 4K sensor holds detail even in a dim room. It fixed my on-camera look instantly.",
    price: 149.5,
    retailer: "B&H",
    image: IMG("photo-1587825140708-dfaf72ae4b04"),
    category: "tech-gadgets",
    recommended: true,
    features: ["4K sensor", "Auto-framing", "Dual microphone array"],
  },
  {
    name: "Cast-Iron Skillet, 12 inch",
    slug: "cast-iron-skillet-12-inch",
    brand: "Hearth",
    shortDescription: "The one pan I use for almost everything.",
    description:
      "Pre-seasoned, oven-safe, and impossible to ruin. It heats evenly and every meal tastes better out of it.",
    price: 45.99,
    originalPrice: 59.99,
    retailer: "Amazon",
    image: IMG("photo-1584990347449-a2d4c2c9ea8f"),
    category: "home-kitchen",
    featured: true,
    features: ["Pre-seasoned", "Oven-safe to 260°C", "Induction compatible"],
  },
  {
    name: "Pour-Over Coffee Dripper",
    slug: "pour-over-coffee-dripper",
    brand: "Origin",
    shortDescription: "Better coffee in three minutes, every morning.",
    description:
      "A ceramic cone dripper that makes a genuinely good cup without a machine. My morning ritual.",
    price: 28,
    retailer: "Target",
    image: IMG("photo-1495474472287-4d71bcdd2085"),
    category: "home-kitchen",
    recommended: true,
    features: ["Ceramic cone", "Single-cup and 4-cup", "Dishwasher safe"],
  },
  {
    name: "Adjustable Dumbbell Set",
    slug: "adjustable-dumbbell-set",
    brand: "Ironline",
    shortDescription: "Replaces a full rack in a small apartment.",
    description:
      "Six weight settings in one compact pair. Saved me an entire rack of space and it still feels solid.",
    price: 349,
    retailer: "Amazon",
    image: IMG("photo-1638536532686-d610adfc8e7c"),
    category: "fitness",
    featured: true,
    features: ["2–24 kg per dumbbell", "Six speed settings", "One-hand adjustment"],
  },
  {
    name: "Recovery Foam Roller",
    slug: "recovery-foam-roller",
    brand: "Pulse",
    shortDescription: "Ten minutes that save my back.",
    description:
      "A firm, textured roller that releases tight legs after leg day. I keep one by the couch.",
    price: 32.5,
    retailer: "Dick's",
    image: IMG("photo-1599058917212-d750089bc07e"),
    category: "fitness",
    features: ["Textured surface", "High-density EVA", "Includes carry strap"],
  },
  {
    name: "Carry-On Backpack 38L",
    slug: "carry-on-backpack-38l",
    brand: "Nomad",
    shortDescription: "Fits the overhead bin and a full editing kit.",
    description:
      "A clamshell carry-on that fits a 16-inch laptop, camera body, and three days of clothes.",
    price: 179,
    originalPrice: 219,
    retailer: "REI",
    image: IMG("photo-1553062407-98eeb64c6a62"),
    category: "travel",
    featured: true,
    features: ["Fits most airline carry-on limits", "Clamshell opening", "Luggage pass-through"],
  },
  {
    name: "Packing Cube Set",
    slug: "packing-cube-set",
    brand: "Nomad",
    shortDescription: "Compression cubes that actually compress.",
    description:
      "Four ripstop cubes with a zip that squeezes the air out. My bag always fits now.",
    price: 54,
    retailer: "Amazon",
    image: IMG("photo-1553531384-cc64ac80f931"),
    category: "travel",
    features: ["Four-piece set", "Water-resistant zip", "See-through mesh panels"],
  },
  {
    name: "Monitor Light Bar",
    slug: "monitor-light-bar",
    brand: "Lumen",
    shortDescription: "Even desk lighting without screen glare.",
    description:
      "An asymmetric light bar that lights the desk but not the screen. My late-night editing is much easier on my eyes.",
    price: 89,
    retailer: "Amazon",
    image: IMG("photo-1527443224154-c4a3942d3acf"),
    category: "desk-setup",
    recommended: true,
    features: ["Asymmetric optics", "Auto dimming", "Touch controls"],
  },
];

async function main() {
  const force = process.argv.includes("--force");
  const existing = await prisma.product.count();
  if (existing > 0 && !force) {
    console.log(
      `Database already has ${existing} product(s). Skipping seed. ` +
        `Re-run with "npm run db:seed -- --force" to reset the demo catalog.`,
    );
    return;
  }

  if (force && existing > 0) {
    // Reset only the catalog data; users, settings and audit logs are kept.
    await prisma.affiliateClick.deleteMany();
    await prisma.affiliateOffer.deleteMany();
    await prisma.productImage.deleteMany();
    await prisma.productCategory.deleteMany();
    await prisma.productRedirect.deleteMany();
    await prisma.product.deleteMany();
    await prisma.category.deleteMany();
    await prisma.contentPage.deleteMany();
    console.log("Existing demo catalog cleared.");
  }

  const categoryBySlug = new Map<string, string>();
  for (const [index, category] of CATEGORIES.entries()) {
    const created = await prisma.category.create({
      data: {
        name: category.name,
        slug: category.slug,
        description: category.description,
        imageUrl: category.image,
        status: "ACTIVE",
        featured: category.featured,
        displayOrder: index + 1,
      },
    });
    categoryBySlug.set(category.slug, created.id);
  }

  for (const [index, product] of PRODUCTS.entries()) {
    const created = await prisma.product.create({
      data: {
        name: product.name,
        slug: product.slug,
        shortDescription: product.shortDescription,
        description: product.description,
        brand: product.brand,
        status: "PUBLISHED",
        featured: Boolean(product.featured),
        recommended: Boolean(product.recommended),
        displayOrder: index + 1,
        features: product.features,
        publishedAt: new Date(Date.now() - index * 86_400_000),
        images: {
          create: [
            {
              imageUrl: product.image,
              altText: product.name,
              displayOrder: 0,
            },
          ],
        },
        categories: {
          create: [{ categoryId: categoryBySlug.get(product.category)! }],
        },
      },
    });

    await prisma.affiliateOffer.create({
      data: {
        productId: created.id,
        retailerName: product.retailer,
        affiliateNetwork: `${product.retailer} Affiliate Program`,
        affiliateUrl: `https://example.com/${product.retailer.toLowerCase().replace(/\s+/g, "-")}/${product.slug}?ref=creator-20`,
        offerLabel: `Buy on ${product.retailer}`,
        displayedPrice: product.price,
        originalPrice: product.originalPrice ?? null,
        currency: "USD",
        availabilityStatus: "IN_STOCK",
        isPrimary: true,
        status: "ACTIVE",
      },
    });
  }

  await prisma.contentPage.createMany({
    data: [
      {
        title: "About",
        slug: "about",
        content: `# About me

Hi — I'm a creator covering **tech, productivity and everyday carry**. For the last six years I've been filming setups, testing gear, and figuring out what actually earns its place in a bag.

## Why this page exists

Every product here is one I've **personally bought and used**. I don't run sponsored posts, I don't accept free products for reviews, and nothing gets listed just because a brand asked nicely.

That means:

- **Only products I own.** If I recommend it, it's in my house.
- **Real usage, not spec sheets.** I tell you how it holds up after a month, not what the box says.
- **The price I actually paid.** The retailer sets the final price, so always confirm before buying.

## What you'll find here

The storefront is organised the way I actually shop — by **category** and by **what I'm recommending right now**. The "Creator's pick" badge means it's the one I'd replace first. The trending section is driven by what visitors actually click, not by what pays me the most.

## My promise

If something stops working, gets discontinued, or turns out to be a bad recommendation, it comes off the list. I would rather have a small, honest collection than a large one full of filler.

## Let's talk

Questions about a product, or want a recommendation for a specific setup? [Get in touch](/pages/contact) — I read everything.

---

*Disclosure: some links on this site are affiliate links. If you buy through them, I may earn a commission at no extra cost to you. It never changes what I recommend.*`,
        status: "PUBLISHED",
        publishedAt: new Date(),
      },
      {
        title: "Contact",
        slug: "contact",
        content: `# Contact

Have a question, a product suggestion, or spotted a mistake on a listing? I read every message.

## Product suggestions

The best suggestions come with context — *what you shoot, what you carry, what broke last.* Tell me your use case and I'll tell you honestly whether I have something I'd recommend.

## Corrections

If a price is wrong, a product is discontinued, or I've misdescribed something, please let me know. I update listings as soon as I can confirm the details.

## Business enquiries

For collaborations, sponsorship, or licensing, use the same form and pick **Business** in the subject line. Note that I only consider collaborations for products I've already used or that I can test properly before publishing.

---

*Typical response time: 2–4 days.*`,
        status: "PUBLISHED",
        publishedAt: new Date(),
      },
      {
        title: "Affiliate disclosure",
        slug: "affiliate-disclosure",
        content: `# Affiliate disclosure

Some links on this site are **affiliate links**. If you buy through them, I may earn a commission at no extra cost to you.

## What this means for you

- **Your price doesn't change.** The price you pay is the same whether you click my link or not.
- **Prices and availability are set by the retailer.** They can change at any time — always confirm the current price on the retailer's site before buying.
- **A commission never decides what I recommend.** Products are listed because I use them, not because of a payout.

## How links are marked

Every outbound purchase button on this site is an affiliate link. Product pages show which retailer the link goes to, and the retailer name is displayed next to the price so you always know where you're being sent.

## How many affiliate links are on this site?

**All of them.** There is no paid placement, no "ad" slot, and no page where a brand can buy a better position in the list.

## What I earn

Commissions from this site help fund the equipment I test with and the time spent making the content. That is the entire arrangement — and the reason I can keep the recommendations honest.

---

Questions about a specific link? [Get in touch](/pages/contact).`,
        status: "PUBLISHED",
        publishedAt: new Date(),
      },
      {
        title: "Privacy policy",
        slug: "privacy-policy",
        content: `# Privacy policy

Last updated: this page ships with the site and reflects the behaviour of the software behind it.

## What this site collects

This site is built to collect as little as possible. Specifically:

- **Outbound click records.** When you click a product link, the site records *which* product, *which* retailer link, *when*, and a **best-effort traffic source** derived from the referring page or a **utm_source** parameter.
- **Pseudonymous session hash.** A one-way hash of the request IP address, browser string, and current date, used only to de-duplicate repeated clicks. **Raw IP addresses are never stored**, and the hash changes daily.
- **Bot classification.** A flag marking automated traffic so it can be excluded from analytics.

No accounts are required to browse this site, and **no personal information is collected about you** beyond what is technically necessary to serve the page.

## What this site does **not** collect

- No advertising or cross-site tracking pixels.
- No third-party marketing cookies.
- No sale or sharing of personal data.

## Cookies

The site sets **one** cookie, and only for administrators: a signed session cookie required to access the dashboard. Visitors to the public storefront are not tracked with cookies.

## Affiliate links

When you click a link to a retailer, that retailer may set its own cookies and apply its own privacy policy. This site has no control over what happens after you leave. Links are marked with **rel="sponsored nofollow noopener"** so search engines do not treat affiliate links as editorial endorsements.

## Your rights

Because we do not hold identifiable personal data, there is generally nothing to export or delete. If you have a question about privacy, [get in touch](/pages/contact).

## Changes

If this policy changes materially, the updated text will appear on this page with a new date.`,
        status: "PUBLISHED",
        publishedAt: new Date(),
      },
      {
        title: "Terms and conditions",
        slug: "terms",
        content: `# Terms and conditions

## Use of this site

By using this site you agree to these terms. If you do not agree, please do not use the site.

## Product information

Everything published here is **editorial guidance, not professional advice**. Product descriptions, prices, availability and specifications are provided in good faith and may change without notice. The retailer is the authoritative source for price, stock and warranty terms — always confirm on the retailer's site before purchasing.

I am not liable for purchases made through links on this site, for the condition of any product, or for any outcome arising from your use of it. **Buy what suits your needs**, and check the return policy before you order.

## Intellectual property

Content on this site — including text, images, layout and the underlying software — belongs to the creator, except where clearly credited otherwise. You may quote short excerpts with a link back, but please ask before reproducing full articles or images.

## Affiliate relationships

Some links are affiliate links, which means the creator may earn a commission if you buy. This never affects the price you pay, and it never influences which products are listed or what is said about them. Full details are in the [affiliate disclosure](/pages/affiliate-disclosure).

## Limitation of liability

To the fullest extent permitted by law, no liability is accepted for any loss or damage arising from use of this site, including reliance on product information or availability. Nothing here limits liability that cannot be limited by law.

## Governing terms

These terms may be updated at any time. The version published on this page is the version that applies.`,
        status: "PUBLISHED",
        publishedAt: new Date(),
      },
    ],
  });

  console.log(
    `Seed complete: ${CATEGORIES.length} categories, ${PRODUCTS.length} products, 5 content pages.`,
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

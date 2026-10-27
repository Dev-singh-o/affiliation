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

async function main() {
  // Only seed when the catalog is empty — never clobber existing data.
  const existingProducts = await prisma.product.count();
  if (existingProducts > 0) {
    console.log(`Database already has ${existingProducts} product(s); skipping seed.`);
    return;
  }

  const categories = await prisma.$transaction([
    prisma.category.create({
      data: {
        name: "Tech & Gadgets",
        slug: "tech-gadgets",
        description: "Devices and accessories I use daily.",
        status: "ACTIVE",
        featured: true,
        displayOrder: 1,
      },
    }),
    prisma.category.create({
      data: {
        name: "Home & Kitchen",
        slug: "home-kitchen",
        description: "Tools that make everyday life easier.",
        status: "ACTIVE",
        featured: true,
        displayOrder: 2,
      },
    }),
    prisma.category.create({
      data: {
        name: "Fitness",
        slug: "fitness",
        description: "Gear for training and recovery.",
        status: "ACTIVE",
        displayOrder: 3,
      },
    }),
  ]);

  const tech = categories[0];
  const home = categories[1];

  const p1 = await prisma.product.create({
    data: {
      name: "Wireless Noise-Cancelling Headphones",
      slug: "wireless-noise-cancelling-headphones",
      shortDescription: "My go-to headphones for editing and travel.",
      description:
        "Comfortable, long battery life, and excellent noise cancellation. I use these for every edit and flight.",
      brand: "SoundPro",
      status: "PUBLISHED",
      featured: true,
      recommended: true,
      displayOrder: 1,
      recommendationText:
        "These are the headphones I wear in almost every video. The battery lasts a full week of heavy use.",
      features: ["30-hour battery", "Active noise cancellation", "Foldable design"],
      publishedAt: new Date(),
      images: {
        create: [
          {
            imageUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800",
            altText: "Wireless headphones",
            displayOrder: 0,
          },
        ],
      },
      categories: {
        create: [{ categoryId: tech.id }],
      },
    },
  });

  await prisma.affiliateOffer.create({
    data: {
      productId: p1.id,
      retailerName: "Amazon",
      affiliateNetwork: "Amazon Associates",
      affiliateUrl: "https://www.amazon.com/dp/B000000000?tag=example-20",
      offerLabel: "Buy on Amazon",
      displayedPrice: 199.99,
      originalPrice: 249.99,
      currency: "USD",
      availabilityStatus: "IN_STOCK",
      isPrimary: true,
      status: "ACTIVE",
    },
  });

  await prisma.contentPage.createMany({
    data: [
      {
        title: "About",
        slug: "about",
        content:
          "# About me\n\nI create content about tech, lifestyle, and productivity. This storefront collects the products I genuinely use and recommend.",
        status: "PUBLISHED",
        publishedAt: new Date(),
      },
      {
        title: "Affiliate disclosure",
        slug: "affiliate-disclosure",
        content:
          "# Affiliate disclosure\n\nSome links on this site are affiliate links. If you buy through them, I may earn a commission at no extra cost to you.",
        status: "PUBLISHED",
        publishedAt: new Date(),
      },
      {
        title: "Privacy policy",
        slug: "privacy-policy",
        content:
          "# Privacy policy\n\nThis site collects minimal, pseudonymous analytics about outbound clicks. No raw IP addresses are stored.",
        status: "PUBLISHED",
        publishedAt: new Date(),
      },
      {
        title: "Terms and conditions",
        slug: "terms",
        content: "# Terms and conditions\n\nUse of this site is subject to these terms.",
        status: "PUBLISHED",
        publishedAt: new Date(),
      },
    ],
  });

  console.log("Seed complete: 3 categories, 1 product, 4 content pages.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

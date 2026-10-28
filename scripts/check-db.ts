import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../lib/generated/prisma/client";

const adapter = new PrismaPg({
  connectionString: process.env.DIRECT_URL ?? process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});
const prisma = new PrismaClient({ adapter });

async function main() {
  const [products, categories, pages, offers, featured, recommended] =
    await Promise.all([
      prisma.product.count(),
      prisma.category.count(),
      prisma.contentPage.findMany({
        select: { slug: true, title: true, status: true },
        orderBy: { title: "asc" },
      }),
      prisma.affiliateOffer.count(),
      prisma.product.count({ where: { featured: true } }),
      prisma.product.count({ where: { recommended: true } }),
    ]);
  console.log("products:", products);
  console.log("categories:", categories);
  console.log("offers:", offers);
  console.log("featured:", featured, "recommended:", recommended);
  console.log("content pages:");
  for (const p of pages) console.log("  -", p.slug, "|", p.title, "|", p.status);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

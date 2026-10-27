import { prisma } from "@/lib/db/prisma";

export interface DateRange {
  from: Date;
  to: Date;
  days: number;
}

export function resolveRange(rangeParam: string | undefined): DateRange {
  const days = rangeParam === "90" ? 90 : rangeParam === "30" ? 30 : 7;
  const to = new Date();
  const from = new Date(to.getTime() - days * 24 * 60 * 60 * 1000);
  return { from, to, days };
}

/** Real counts from the database — never hardcoded. */
export async function getCatalogCounts() {
  const [byStatus, categories, offers] = await Promise.all([
    prisma.product.groupBy({
      by: ["status"],
      _count: { _all: true },
    }),
    prisma.category.count(),
    prisma.affiliateOffer.count(),
  ]);

  const count = (status: string) =>
    byStatus.find((s) => s.status === status)?._count._all ?? 0;

  return {
    products: {
      total: byStatus.reduce((sum, s) => sum + s._count._all, 0),
      published: count("PUBLISHED"),
      draft: count("DRAFT"),
      archived: count("ARCHIVED"),
    },
    categories,
    offers,
  };
}

interface ClickRow {
  clickedAt: Date;
  productId: string;
  source: string | null;
  campaign: string | null;
  offer: { retailerName: string };
  product: { name: string; categories: { category: { name: string } }[] };
}

function emptyAggregates() {
  return {
    totalClicks: 0,
    clicksByDay: [] as { date: string; clicks: number }[],
    topProducts: [] as { id: string; name: string; clicks: number }[],
    topRetailers: [] as { retailer: string; clicks: number }[],
    topCategories: [] as { category: string; clicks: number }[],
    bySource: [] as { source: string; clicks: number }[],
    byCampaign: [] as { campaign: string; clicks: number }[],
  };
}

/**
 * Aggregate click analytics for a date range.
 * Bot-classified clicks are excluded from reports.
 * For typical affiliate volumes this in-JS aggregation is fine; introduce
 * daily rollup tables if click volume outgrows it (see README).
 */
export async function getClickAnalytics(range: DateRange) {
  const clicks: ClickRow[] = await prisma.affiliateClick.findMany({
    where: { clickedAt: { gte: range.from, lte: range.to }, isBot: false },
    select: {
      clickedAt: true,
      productId: true,
      source: true,
      campaign: true,
      offer: { select: { retailerName: true } },
      product: {
        select: {
          name: true,
          categories: { select: { category: { select: { name: true } } } },
        },
      },
    },
    orderBy: { clickedAt: "asc" },
    take: 100_000,
  });

  const result = emptyAggregates();
  result.totalClicks = clicks.length;

  // Pre-fill every day in the range so charts have a continuous axis.
  const byDay = new Map<string, number>();
  for (let i = range.days - 1; i >= 0; i--) {
    const d = new Date(range.to.getTime() - i * 24 * 60 * 60 * 1000);
    byDay.set(d.toISOString().slice(0, 10), 0);
  }

  const products = new Map<string, { name: string; clicks: number }>();
  const retailers = new Map<string, number>();
  const categories = new Map<string, number>();
  const sources = new Map<string, number>();
  const campaigns = new Map<string, number>();

  for (const click of clicks) {
    const day = click.clickedAt.toISOString().slice(0, 10);
    byDay.set(day, (byDay.get(day) ?? 0) + 1);

    const product = products.get(click.productId) ?? {
      name: click.product.name,
      clicks: 0,
    };
    product.clicks += 1;
    products.set(click.productId, product);

    retailers.set(
      click.offer.retailerName,
      (retailers.get(click.offer.retailerName) ?? 0) + 1,
    );

    for (const { category } of click.product.categories) {
      categories.set(category.name, (categories.get(category.name) ?? 0) + 1);
    }

    const source = click.source ?? "direct";
    sources.set(source, (sources.get(source) ?? 0) + 1);

    if (click.campaign) {
      campaigns.set(click.campaign, (campaigns.get(click.campaign) ?? 0) + 1);
    }
  }

  const top = <T>(map: Map<string, T>, take: number) =>
    [...map.entries()]
      .sort((a, b) => (b[1] as number) - (a[1] as number))
      .slice(0, take);

  result.clicksByDay = [...byDay.entries()].map(([date, clicks]) => ({
    date,
    clicks,
  }));
  result.topProducts = [...products.entries()]
    .sort((a, b) => b[1].clicks - a[1].clicks)
    .slice(0, 10)
    .map(([id, v]) => ({ id, name: v.name, clicks: v.clicks }));
  result.topRetailers = top(retailers, 10).map(([retailer, clicks]) => ({
    retailer,
    clicks,
  }));
  result.topCategories = top(categories, 10).map(([category, clicks]) => ({
    category,
    clicks,
  }));
  result.bySource = top(sources, 10).map(([source, clicks]) => ({
    source,
    clicks,
  }));
  result.byCampaign = top(campaigns, 10).map(([campaign, clicks]) => ({
    campaign,
    clicks,
  }));

  return result;
}

export async function getTotalClicks(): Promise<number> {
  return prisma.affiliateClick.count({ where: { isBot: false } });
}

export async function getRecentAuditLogs(take = 10) {
  return prisma.adminAuditLog.findMany({
    orderBy: { createdAt: "desc" },
    take,
    include: { actor: { select: { email: true, name: true } } },
  });
}

export async function getRecentClicks(take = 20) {
  return prisma.affiliateClick.findMany({
    where: { isBot: false },
    orderBy: { clickedAt: "desc" },
    take,
    include: {
      product: { select: { name: true, slug: true } },
      offer: { select: { retailerName: true } },
    },
  });
}

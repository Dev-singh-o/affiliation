import { Suspense } from "react";
import { connection } from "next/server";
import Link from "next/link";

import { getClickAnalytics, resolveRange } from "@/lib/analytics/queries";
import { formatNumber } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata = {
  title: "Analytics",
  robots: { index: false, follow: false },
};

type SearchParams = Promise<{ range?: string }>;

export default function AnalyticsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  return (
    <Suspense fallback={<AnalyticsSkeleton />}>
      <AnalyticsContent searchParams={searchParams} />
    </Suspense>
  );
}

async function AnalyticsContent({ searchParams }: { searchParams: SearchParams }) {
  const { range } = await searchParams;
  await connection();
  const resolved = resolveRange(range);
  const analytics = await getClickAnalytics(resolved);

  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Analytics</h1>
          <p className="text-muted-foreground text-sm">
            Outbound affiliate clicks — not sales or commissions.{" "}
            {formatNumber(analytics.totalClicks)} clicks in the last{" "}
            {resolved.days} days.
          </p>
        </div>
        <div className="flex items-center gap-1 rounded-lg border p-1">
          {[7, 30, 90].map((days) => (
            <Link
              key={days}
              href={`/admin/analytics?range=${days}`}
              className={`rounded-md px-3 py-1 text-sm font-medium ${
                resolved.days === days
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted"
              }`}
            >
              {days}d
            </Link>
          ))}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Clicks by day</CardTitle>
            <CardDescription>
              Daily outbound click volume (last {resolved.days} days).
            </CardDescription>
          </CardHeader>
          <CardContent>
            <MiniBarChart data={analytics.clicksByDay} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top products</CardTitle>
            <CardDescription>Most-clicked products.</CardDescription>
          </CardHeader>
          <CardContent>
            {analytics.topProducts.length === 0 ? (
              <p className="text-muted-foreground text-sm">No clicks yet.</p>
            ) : (
              <ul className="space-y-2">
                {analytics.topProducts.map((p, i) => (
                  <li key={p.id} className="flex items-center gap-3">
                    <span className="text-muted-foreground w-5 text-sm">
                      {i + 1}.
                    </span>
                    <span className="min-w-0 flex-1 truncate text-sm font-medium">
                      {p.name}
                    </span>
                    <span className="text-muted-foreground text-sm">
                      {formatNumber(p.clicks)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top retailers</CardTitle>
            <CardDescription>Clicks by retailer.</CardDescription>
          </CardHeader>
          <CardContent>
            {analytics.topRetailers.length === 0 ? (
              <p className="text-muted-foreground text-sm">No clicks yet.</p>
            ) : (
              <ul className="space-y-2">
                {analytics.topRetailers.map((r) => (
                  <li key={r.retailer} className="flex items-center gap-3">
                    <span className="min-w-0 flex-1 truncate text-sm font-medium">
                      {r.retailer}
                    </span>
                    <span className="text-muted-foreground text-sm">
                      {formatNumber(r.clicks)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top categories</CardTitle>
            <CardDescription>Clicks attributed to category.</CardDescription>
          </CardHeader>
          <CardContent>
            {analytics.topCategories.length === 0 ? (
              <p className="text-muted-foreground text-sm">No clicks yet.</p>
            ) : (
              <ul className="space-y-2">
                {analytics.topCategories.map((c) => (
                  <li key={c.category} className="flex items-center gap-3">
                    <span className="min-w-0 flex-1 truncate text-sm font-medium">
                      {c.category}
                    </span>
                    <span className="text-muted-foreground text-sm">
                      {formatNumber(c.clicks)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Traffic sources</CardTitle>
            <CardDescription>Best-effort attribution.</CardDescription>
          </CardHeader>
          <CardContent>
            {analytics.bySource.length === 0 ? (
              <p className="text-muted-foreground text-sm">No clicks yet.</p>
            ) : (
              <ul className="space-y-2">
                {analytics.bySource.map((s) => (
                  <li key={s.source} className="flex items-center gap-3">
                    <span className="min-w-0 flex-1 truncate text-sm font-medium capitalize">
                      {s.source}
                    </span>
                    <span className="text-muted-foreground text-sm">
                      {formatNumber(s.clicks)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Campaigns</CardTitle>
            <CardDescription>Clicks by campaign label.</CardDescription>
          </CardHeader>
          <CardContent>
            {analytics.byCampaign.length === 0 ? (
              <p className="text-muted-foreground text-sm">No campaigns yet.</p>
            ) : (
              <ul className="space-y-2">
                {analytics.byCampaign.map((c) => (
                  <li key={c.campaign} className="flex items-center gap-3">
                    <span className="min-w-0 flex-1 truncate text-sm font-medium">
                      {c.campaign}
                    </span>
                    <span className="text-muted-foreground text-sm">
                      {formatNumber(c.clicks)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent clicks</CardTitle>
          <CardDescription>Latest outbound clicks (non-bot).</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <RecentClicksTable />
        </CardContent>
      </Card>
    </div>
  );
}

async function RecentClicksTable() {
  const { getRecentClicks } = await import("@/lib/analytics/queries");
  const clicks = await getRecentClicks(25);
  if (clicks.length === 0) {
    return (
      <div className="text-muted-foreground p-8 text-center text-sm">
        No clicks recorded yet.
      </div>
    );
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-muted/50 text-left">
          <tr>
            <th className="px-4 py-2 font-medium">When</th>
            <th className="px-4 py-2 font-medium">Product</th>
            <th className="px-4 py-2 font-medium">Retailer</th>
            <th className="px-4 py-2 font-medium">Source</th>
          </tr>
        </thead>
        <tbody>
          {clicks.map((click) => (
            <tr key={click.id} className="border-t">
              <td className="text-muted-foreground px-4 py-2 text-xs">
                {click.clickedAt.toLocaleString()}
              </td>
              <td className="px-4 py-2">{click.product.name}</td>
              <td className="px-4 py-2">{click.offer.retailerName}</td>
              <td className="px-4 py-2 text-xs">
                {click.source ?? "direct"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function MiniBarChart({
  data,
}: {
  data: { date: string; clicks: number }[];
}) {
  const max = Math.max(1, ...data.map((d) => d.clicks));
  return (
    <div className="flex h-40 items-end gap-1">
      {data.map((d) => (
        <div
          key={d.date}
          className="flex flex-1 flex-col items-center gap-1"
        >
          <div
            className="bg-primary/80 w-full rounded-sm transition-all"
            style={{ height: `${(d.clicks / max) * 100}%` }}
            title={`${d.date}: ${d.clicks} clicks`}
          />
          <span className="text-muted-foreground hidden text-[9px] sm:block">
            {d.date.slice(5)}
          </span>
        </div>
      ))}
    </div>
  );
}

function AnalyticsSkeleton() {
  return (
    <div className="grid gap-6">
      <Skeleton className="h-10 w-64" />
      <div className="grid gap-4 lg:grid-cols-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-48 w-full" />
        ))}
      </div>
    </div>
  );
}

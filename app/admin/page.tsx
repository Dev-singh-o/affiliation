import { Suspense } from "react";
import Link from "next/link";
import {
  BarChart3Icon,
  FolderTreeIcon,
  MousePointerClickIcon,
  PackageIcon,
  TicketPercentIcon,
} from "lucide-react";

import {
  getCatalogCounts,
  getClickAnalytics,
  getRecentAuditLogs,
  getTotalClicks,
  resolveRange,
} from "@/lib/analytics/queries";
import { formatNumber } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  EmptyState,
  EmptyStateDescription,
  EmptyStateIcon,
  EmptyStateTitle,
} from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

type SearchParams = Promise<{ range?: string }>;

export default function AdminDashboardPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardContent searchParams={searchParams} />
    </Suspense>
  );
}

function StatCard({
  label,
  value,
  href,
  icon: Icon,
  hint,
}: {
  label: string;
  value: number | string;
  href?: string;
  icon: typeof PackageIcon;
  hint?: string;
}) {
  const body = (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{label}</CardTitle>
        <Icon className="text-muted-foreground size-4" aria-hidden />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {hint ? (
          <p className="text-muted-foreground text-xs">{hint}</p>
        ) : null}
      </CardContent>
    </Card>
  );
  return href ? (
    <Link href={href} className="transition-opacity hover:opacity-80">
      {body}
    </Link>
  ) : (
    body
  );
}

async function DashboardContent({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { range } = await searchParams;
  const resolved = resolveRange(range);
  const [counts, analytics, totalClicks, auditLogs] = await Promise.all([
    getCatalogCounts(),
    getClickAnalytics(resolved),
    getTotalClicks(),
    getRecentAuditLogs(8),
  ]);

  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground text-sm">
            Live statistics from your database.
          </p>
        </div>
        <div className="flex items-center gap-1 rounded-lg border p-1">
          {[7, 30, 90].map((days) => (
            <Link
              key={days}
              href={`/admin?range=${days}`}
              className={cn(
                "rounded-md px-3 py-1 text-sm font-medium",
                resolved.days === days
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted",
              )}
            >
              {days}d
            </Link>
          ))}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Products"
          value={formatNumber(counts.products.total)}
          href="/admin/products"
          icon={PackageIcon}
          hint={`${counts.products.published} published · ${counts.products.draft} draft · ${counts.products.archived} archived`}
        />
        <StatCard
          label="Categories"
          value={formatNumber(counts.categories)}
          href="/admin/categories"
          icon={FolderTreeIcon}
        />
        <StatCard
          label="Affiliate offers"
          value={formatNumber(counts.offers)}
          href="/admin/affiliate-offers"
          icon={TicketPercentIcon}
        />
        <StatCard
          label="Outbound clicks"
          value={formatNumber(totalClicks)}
          href="/admin/analytics"
          icon={MousePointerClickIcon}
          hint={`${formatNumber(analytics.totalClicks)} in the last ${resolved.days} days`}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Top products</CardTitle>
            <CardDescription>
              Most clicked products in the last {resolved.days} days.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {analytics.topProducts.length === 0 ? (
              <p className="text-muted-foreground text-sm">
                No clicks recorded in this period yet.
              </p>
            ) : (
              <ul className="space-y-2">
                {analytics.topProducts.slice(0, 5).map((product, index) => (
                  <li key={product.id} className="flex items-center gap-3">
                    <span className="text-muted-foreground w-5 text-sm">
                      {index + 1}.
                    </span>
                    <span className="min-w-0 flex-1 truncate text-sm font-medium">
                      {product.name}
                    </span>
                    <Badge variant="secondary">
                      {formatNumber(product.clicks)} clicks
                    </Badge>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Traffic sources</CardTitle>
            <CardDescription>
              Best-effort attribution (referrer / UTM), last {resolved.days}{" "}
              days.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {analytics.bySource.length === 0 ? (
              <p className="text-muted-foreground text-sm">
                No attributed traffic in this period yet.
              </p>
            ) : (
              <ul className="space-y-2">
                {analytics.bySource.slice(0, 5).map((row) => (
                  <li key={row.source} className="flex items-center gap-3">
                    <span className="min-w-0 flex-1 truncate text-sm font-medium capitalize">
                      {row.source}
                    </span>
                    <Badge variant="secondary">
                      {formatNumber(row.clicks)} clicks
                    </Badge>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent administrative activity</CardTitle>
          <CardDescription>Audit log of sensitive operations.</CardDescription>
        </CardHeader>
        <CardContent>
          {auditLogs.length === 0 ? (
            <EmptyState>
              <EmptyStateIcon icon={BarChart3Icon} />
              <EmptyStateTitle>No activity yet</EmptyStateTitle>
              <EmptyStateDescription>
                Administrative actions like publishing products or changing
                settings will appear here.
              </EmptyStateDescription>
            </EmptyState>
          ) : (
            <ul className="divide-y">
              {auditLogs.map((log) => (
                <li
                  key={log.id}
                  className="flex flex-wrap items-center gap-x-3 py-2 text-sm"
                >
                  <code className="bg-muted rounded px-1.5 py-0.5 text-xs">
                    {log.action}
                  </code>
                  <span className="text-muted-foreground">
                    {log.entityType}
                    {log.entityId ? ` · ${log.entityId.slice(0, 8)}…` : ""}
                  </span>
                  <span className="ml-auto text-muted-foreground text-xs">
                    {log.actor?.email ?? "system"} ·{" "}
                    {log.createdAt.toLocaleString()}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="grid gap-6">
      <Skeleton className="h-10 w-64" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-28 w-full" />
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    </div>
  );
}

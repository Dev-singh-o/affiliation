import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { PlusIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { prisma } from "@/lib/db/prisma";

export const metadata: Metadata = {
  title: "Products",
  robots: { index: false, follow: false },
};

export default function ProductsPage() {
  return (
    <Suspense fallback={<Skeleton className="h-96 w-full" />}>
      <ProductsContent />
    </Suspense>
  );
}

async function ProductsContent() {
  const products = await prisma.product.findMany({
    orderBy: [{ updatedAt: "desc" }],
    include: {
      _count: { select: { offers: true } },
      categories: { include: { category: { select: { name: true } } } },
    },
  });

  return (
    <div className="grid gap-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Products</h1>
          <p className="text-muted-foreground text-sm">
            {products.length} total · manage catalog entries.
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/products/new">
            <PlusIcon />
            New product
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All products</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-left">
                <tr>
                  <th className="px-4 py-2 font-medium">Name</th>
                  <th className="px-4 py-2 font-medium">Status</th>
                  <th className="px-4 py-2 font-medium">Categories</th>
                  <th className="px-4 py-2 font-medium">Offers</th>
                  <th className="px-4 py-2 font-medium">Featured</th>
                  <th className="px-4 py-2 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id} className="border-t">
                    <td className="px-4 py-2 font-medium">{product.name}</td>
                    <td className="px-4 py-2">
                      <StatusBadge status={product.status} />
                    </td>
                    <td className="text-muted-foreground px-4 py-2 text-xs">
                      {product.categories
                        .map((c) => c.category.name)
                        .join(", ") || "—"}
                    </td>
                    <td className="px-4 py-2">{product._count.offers}</td>
                    <td className="px-4 py-2">
                      {product.featured ? "Yes" : "—"}
                    </td>
                    <td className="px-4 py-2 text-right">
                      <Link
                        href={`/admin/products/${product.id}`}
                        className="text-primary hover:underline"
                      >
                        Edit
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const variant =
    status === "PUBLISHED"
      ? "success"
      : status === "DRAFT"
        ? "secondary"
        : "outline";
  return <span className="text-xs font-medium">{status}</span>;
}

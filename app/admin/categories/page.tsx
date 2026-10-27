import { Suspense } from "react";
import type { Metadata } from "next";
import { PlusIcon } from "lucide-react";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { prisma } from "@/lib/db/prisma";

export const metadata: Metadata = {
  title: "Categories",
  robots: { index: false, follow: false },
};

export default function CategoriesPage() {
  return (
    <Suspense fallback={<Skeleton className="h-96 w-full" />}>
      <CategoriesContent />
    </Suspense>
  );
}

async function CategoriesContent() {
  const categories = await prisma.category.findMany({
    orderBy: [{ displayOrder: "asc" }, { name: "asc" }],
    include: { _count: { select: { products: true } } },
  });

  return (
    <div className="grid gap-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Categories</h1>
          <p className="text-muted-foreground text-sm">
            Organize products into browsable categories.
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/categories/new">
            <PlusIcon />
            New category
          </Link>
        </Button>
      </div>

      {categories.length === 0 ? (
        <Card>
          <CardContent className="p-0">
            <div className="text-muted-foreground p-8 text-center text-sm">
              No categories yet. Create your first one.
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>All categories</CardTitle>
            <CardDescription>
              {categories.length} total · sorted by display order.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/50 text-left">
                  <tr>
                    <th className="px-4 py-2 font-medium">Name</th>
                    <th className="px-4 py-2 font-medium">Slug</th>
                    <th className="px-4 py-2 font-medium">Products</th>
                    <th className="px-4 py-2 font-medium">Status</th>
                    <th className="px-4 py-2 font-medium">Featured</th>
                    <th className="px-4 py-2 text-right font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.map((category) => (
                    <tr key={category.id} className="border-t">
                      <td className="px-4 py-2 font-medium">{category.name}</td>
                      <td className="text-muted-foreground px-4 py-2 font-mono text-xs">
                        {category.slug}
                      </td>
                      <td className="px-4 py-2">{category._count.products}</td>
                      <td className="px-4 py-2">
                        <span
                          className={
                            category.status === "ACTIVE"
                              ? "text-emerald-600"
                              : "text-muted-foreground"
                          }
                        >
                          {category.status}
                        </span>
                      </td>
                      <td className="px-4 py-2">
                        {category.featured ? "Yes" : "—"}
                      </td>
                      <td className="px-4 py-2 text-right">
                        <Link
                          href={`/admin/categories/${category.id}`}
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
      )}
    </div>
  );
}

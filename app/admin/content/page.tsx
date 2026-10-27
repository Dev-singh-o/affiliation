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
  title: "Content",
  robots: { index: false, follow: false },
};

export default function ContentPage() {
  return (
    <Suspense fallback={<Skeleton className="h-96 w-full" />}>
      <ContentList />
    </Suspense>
  );
}

async function ContentList() {
  const pages = await prisma.contentPage.findMany({
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div className="grid gap-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Content pages</h1>
          <p className="text-muted-foreground text-sm">
            About, contact, legal pages, and custom informational pages.
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/content/new">
            <PlusIcon />
            New page
          </Link>
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          {pages.length === 0 ? (
            <div className="text-muted-foreground p-8 text-center text-sm">
              No content pages yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/50 text-left">
                  <tr>
                    <th className="px-4 py-2 font-medium">Title</th>
                    <th className="px-4 py-2 font-medium">Slug</th>
                    <th className="px-4 py-2 font-medium">Status</th>
                    <th className="px-4 py-2 text-right font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pages.map((page) => (
                    <tr key={page.id} className="border-t">
                      <td className="px-4 py-2 font-medium">{page.title}</td>
                      <td className="text-muted-foreground px-4 py-2 font-mono text-xs">
                        {page.slug}
                      </td>
                      <td className="px-4 py-2">{page.status}</td>
                      <td className="px-4 py-2 text-right">
                        <Link
                          href={`/admin/content/${page.id}`}
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
          )}
        </CardContent>
      </Card>
    </div>
  );
}

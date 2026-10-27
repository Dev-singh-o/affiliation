import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeftIcon } from "lucide-react";

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
import { ProductForm } from "../product-form";

export const metadata: Metadata = {
  title: "New product",
  robots: { index: false, follow: false },
};

export default function NewProductPage() {
  return (
    <Suspense fallback={<Skeleton className="h-96 w-full" />}>
      <NewProductContent />
    </Suspense>
  );
}

async function NewProductContent() {
  const categories = await prisma.category.findMany({
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });
  return (
    <div className="grid gap-6">
      <div className="flex items-center gap-3">
        <Button asChild variant="ghost" size="sm">
          <Link href="/admin/products">
            <ArrowLeftIcon />
            Back
          </Link>
        </Button>
        <h1 className="text-2xl font-bold tracking-tight">New product</h1>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Product details</CardTitle>
          <CardDescription>
            Add a product, images, categories, and affiliate offers. Save as
            draft first; publish when ready.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ProductForm categories={categories} />
        </CardContent>
      </Card>
    </div>
  );
}

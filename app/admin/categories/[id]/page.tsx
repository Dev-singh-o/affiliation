import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeftIcon, Trash2Icon } from "lucide-react";

import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { prisma } from "@/lib/db/prisma";
import { CategoryForm } from "../category-form";
import { deleteCategory } from "@/actions/categories";

export const metadata: Metadata = {
  title: "Edit category",
  robots: { index: false, follow: false },
};

export default async function EditCategoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const category = await prisma.category.findUnique({
    where: { id },
    include: { _count: { select: { products: true } } },
  });
  if (!category) return <div className="text-muted-foreground p-8 text-center">Category not found.</div>;

  const initial = {
    name: category.name,
    slug: category.slug,
    description: category.description ?? undefined,
    imageUrl: category.imageUrl ?? undefined,
    status: category.status,
    featured: category.featured,
    displayOrder: category.displayOrder,
    seoTitle: category.seoTitle ?? undefined,
    seoDescription: category.seoDescription ?? undefined,
  };

  return (
    <div className="grid gap-6">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Button asChild variant="ghost" size="sm">
            <Link href="/admin/categories">
              <ArrowLeftIcon />
              Back
            </Link>
          </Button>
          <h1 className="text-2xl font-bold tracking-tight">
            Edit: {category.name}
          </h1>
        </div>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" size="sm">
              <Trash2Icon />
              Delete
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete category?</AlertDialogTitle>
              <AlertDialogDescription>
                {category._count
                  ? `This category is assigned to ${category._count.products} product(s). Confirm to remove it from those products and delete.`
                  : "This will permanently delete the category."}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={async () => {
                  "use server";
                  await deleteCategory(id, "detach");
                }}
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
      <CategoryForm id={id} initial={initial} />
    </div>
  );
}

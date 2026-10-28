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
import { CategoryForm } from "../category-form";

export const metadata: Metadata = {
  title: "New category",
  robots: { index: false, follow: false },
};

export default function NewCategoryPage() {
  return (
    <div className="grid gap-6">
      <div className="flex items-center gap-3">
        <Button asChild variant="ghost" size="sm">
          <Link href="/admin/categories">
            <ArrowLeftIcon />
            Back
          </Link>
        </Button>
        <h1 className="text-2xl font-bold tracking-tight">New category</h1>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Category details</CardTitle>
          <CardDescription>
            Create a category. The slug is generated from the name unless you
            provide one.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CategoryForm />
        </CardContent>
      </Card>
    </div>
  );
}

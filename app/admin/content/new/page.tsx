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
import { ContentPageForm } from "@/components/admin/content-page-form";

export const metadata: Metadata = {
  title: "New content page",
  robots: { index: false, follow: false },
};

export default function NewContentPage() {
  return (
    <div className="grid gap-6">
      <div className="flex items-center gap-3">
        <Button asChild variant="ghost" size="sm">
          <Link href="/admin/content">
            <ArrowLeftIcon />
            Back
          </Link>
        </Button>
        <h1 className="text-2xl font-bold tracking-tight">New content page</h1>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Page details</CardTitle>
          <CardDescription>
            Create an informational page (About, Contact, Privacy, Terms, etc.).
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ContentPageForm />
        </CardContent>
      </Card>
    </div>
  );
}

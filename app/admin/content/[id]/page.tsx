import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeftIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { prisma } from "@/lib/db/prisma";
import { ContentPageForm } from "@/components/admin/content-page-form";

export const metadata: Metadata = {
  title: "Edit content page",
  robots: { index: false, follow: false },
};

export default function EditContentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <Suspense fallback={<Skeleton className="h-96 w-full" />}>
      <EditContentBody params={params} />
    </Suspense>
  );
}

async function EditContentBody({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const page = await prisma.contentPage.findUnique({ where: { id } });
  if (!page) {
    return (
      <div className="text-muted-foreground p-8 text-center">Page not found.</div>
    );
  }

  return (
    <div className="grid gap-6">
      <div className="flex items-center gap-3">
        <Button asChild variant="ghost" size="sm">
          <Link href="/admin/content">
            <ArrowLeftIcon />
            Back
          </Link>
        </Button>
        <h1 className="text-2xl font-bold tracking-tight">
          Edit: {page.title}
        </h1>
      </div>
      <ContentPageForm
        id={id}
        initial={{
          title: page.title,
          slug: page.slug,
          content: page.content,
          status: page.status,
          seoTitle: page.seoTitle ?? undefined,
          seoDescription: page.seoDescription ?? undefined,
        }}
      />
    </div>
  );
}

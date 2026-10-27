import { Suspense } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { prisma } from "@/lib/db/prisma";
import { buildMetadata } from "@/lib/seo/metadata";
import { getSettings } from "@/lib/settings";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSanitize from "rehype-sanitize";
import { Skeleton } from "@/components/ui/skeleton";

type Params = Promise<{ slug: string }>;

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { slug } = await params;
  const page = await prisma.contentPage.findUnique({
    where: { slug },
    select: { title: true, seoTitle: true, seoDescription: true, status: true },
  });
  if (!page || page.status !== "PUBLISHED") return { title: "Not found" };
  return buildMetadata({
    title: page.seoTitle ?? page.title,
    description: page.seoDescription ?? undefined,
    canonicalPath: `/pages/${slug}`,
  });
}

export default function ContentPage({ params }: { params: Params }) {
  return (
    <Suspense fallback={<Skeleton className="h-96 w-full" />}>
      <ContentBody params={params} />
    </Suspense>
  );
}

async function ContentBody({ params }: { params: Params }) {
  const { slug } = await params;
  const page = await prisma.contentPage.findUnique({ where: { slug } });
  if (!page || page.status !== "PUBLISHED") notFound();

  const settings = await getSettings();

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-bold tracking-tight">{page.title}</h1>
      <article className="prose prose-neutral dark:prose-invert mt-6 max-w-none">
        <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeSanitize]}>
          {page.content}
        </ReactMarkdown>
      </article>
      <p className="text-muted-foreground mt-10 text-xs">
        {settings.affiliate.disclosureText}
      </p>
    </div>
  );
}

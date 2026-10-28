import { Suspense } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSanitize from "rehype-sanitize";

import { prisma } from "@/lib/db/prisma";
import { buildMetadata } from "@/lib/seo/metadata";
import { getSettings } from "@/lib/settings";
import { Container } from "@/components/ui/container";
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
    <Suspense fallback={<ContentSkeleton />}>
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
    <Container size="narrow" className="py-14 sm:py-20">
      <h1 className="font-display text-editorial-lg font-semibold tracking-tight">
        {page.title}
      </h1>
      <article className="prose prose-neutral dark:prose-invert mt-8 max-w-none prose-headings:font-display prose-headings:tracking-tight prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-strong:text-foreground prose-p:text-muted-foreground prose-p:leading-relaxed prose-li:text-muted-foreground">
        <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeSanitize]}>
          {page.content}
        </ReactMarkdown>
      </article>
      <p className="text-muted-foreground mt-14 border-t border-border pt-6 text-[13px] leading-relaxed">
        {settings.affiliate.disclosureText}
      </p>
    </Container>
  );
}

function ContentSkeleton() {
  return (
    <Container size="narrow" className="py-16">
      <Skeleton className="h-10 w-64" />
      <Skeleton className="mt-8 h-5 w-full" />
      <Skeleton className="mt-3 h-5 w-4/5" />
      <Skeleton className="mt-3 h-5 w-3/5" />
    </Container>
  );
}

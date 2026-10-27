import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";

import { getSettings } from "@/lib/settings";
import { buildMetadata } from "@/lib/seo/metadata";
import { Skeleton } from "@/components/ui/skeleton";

export async function generateMetadata(): Promise<Metadata> {
  return buildMetadata({
    title: "About",
    description: "About the creator.",
    canonicalPath: "/about",
  });
}

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-bold tracking-tight">About</h1>
      <p className="text-muted-foreground mt-4">
        This page can be managed from the admin dashboard under Content.
      </p>
      <Link href="/pages/about" className="text-primary mt-4 inline-block hover:underline">
        View configured About page →
      </Link>
    </div>
  );
}

import type { Metadata } from "next";

import { buildMetadata } from "@/lib/seo/metadata";

export async function generateMetadata(): Promise<Metadata> {
  return buildMetadata({
    title: "Search",
    noIndex: true,
  });
}

export default function SearchPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-16 text-center">
      <h1 className="text-2xl font-bold">Search</h1>
      <p className="text-muted-foreground mt-2">
        Use the filters on the products page to find what you need.
      </p>
    </div>
  );
}

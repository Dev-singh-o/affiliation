import type { Metadata } from "next";
import Link from "next/link";

import { buildMetadata } from "@/lib/seo/metadata";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";

export async function generateMetadata(): Promise<Metadata> {
  return buildMetadata({
    title: "About",
    description: "About the creator.",
    canonicalPath: "/about",
  });
}

export default function AboutPage() {
  return (
    <Container size="narrow" className="py-16 sm:py-24">
      <h1 className="font-display text-editorial-lg font-semibold tracking-tight">
        About
      </h1>
      <p className="text-muted-foreground mt-4 max-w-xl text-[15px] leading-relaxed">
        This page can be managed from the admin dashboard under Content.
      </p>
      <Button asChild variant="outline" className="mt-6">
        <Link href="/pages/about">Read the About page →</Link>
      </Button>
    </Container>
  );
}

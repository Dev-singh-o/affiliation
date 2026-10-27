import { Suspense } from "react";
import type { Metadata } from "next";
import { permanentRedirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ExternalLinkIcon } from "lucide-react";

import { getProductBySlug, getRelatedProducts } from "@/lib/products/queries";
import { getSettings } from "@/lib/settings";
import { buildMetadata } from "@/lib/seo/metadata";
import { formatPrice, discountPercent } from "@/lib/utils";
import { ProductCard } from "@/components/public/product-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

type Params = Promise<{ slug: string }>;

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { slug } = await params;
  const result = await getProductBySlug(slug);
  if (!result || result.kind !== "product") {
    return { title: "Product not found" };
  }
  const product = result.product;
  const primaryOffer = product.offers.find((o) => o.isPrimary) ?? product.offers[0];
  return buildMetadata({
    title: product.seoTitle ?? product.name,
    description: product.seoDescription ?? product.shortDescription ?? product.description?.slice(0, 160),
    ogImage: product.images[0]?.imageUrl,
    canonicalPath: `/products/${product.slug}`,
  });
}

export default function ProductPage({ params }: { params: Params }) {
  return (
    <Suspense fallback={<ProductSkeleton />}>
      <ProductBody params={params} />
    </Suspense>
  );
}

async function ProductBody({ params }: { params: Params }) {
  const { slug } = await params;
  const result = await getProductBySlug(slug);

  if (result?.kind === "redirect") {
    permanentRedirect(`/products/${result.slug}`);
  }
  if (!result || result.kind !== "product") {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 text-center">
        <h1 className="text-2xl font-bold">Product not found</h1>
        <p className="text-muted-foreground mt-2">
          This product may have been removed or is no longer available.
        </p>
        <Link href="/products" className="text-primary mt-4 inline-block hover:underline">
          Back to all products
        </Link>
      </div>
    );
  }

  const product = result.product;
  const settings = await getSettings();
  const disclosure = settings.affiliate.disclosureText;
  const primaryOffer = product.offers.find((o) => o.isPrimary) ?? product.offers[0];
  const related = await getRelatedProducts(
    product.id,
    product.categories.map((c) => c.categoryId),
    4,
  );

  const price = primaryOffer?.displayedPrice?.toString();
  const original = primaryOffer?.originalPrice?.toString();
  const currency = primaryOffer?.currency ?? settings.general.defaultCurrency;
  const discount = discountPercent(price, original);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <nav className="text-muted-foreground mb-6 text-sm">
        <Link href="/" className="hover:text-foreground">Home</Link>
        {" / "}
        <Link href="/products" className="hover:text-foreground">Products</Link>
        {" / "}
        <span className="text-foreground">{product.name}</span>
      </nav>

      <div className="grid gap-8 lg:grid-cols-2">
        <div>
          <div className="relative aspect-square overflow-hidden rounded-2xl border bg-muted">
            {product.images[0]?.imageUrl ? (
              <Image
                src={product.images[0].imageUrl}
                alt={product.images[0].altText ?? product.name}
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
                priority
              />
            ) : null}
          </div>
          {product.images.length > 1 ? (
            <div className="mt-3 grid grid-cols-5 gap-2">
              {product.images.slice(1).map((img) => (
                <div
                  key={img.id}
                  className="relative aspect-square overflow-hidden rounded-lg border bg-muted"
                >
                  <Image
                    src={img.imageUrl}
                    alt={img.altText ?? product.name}
                    fill
                    sizes="100px"
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          ) : null}
        </div>

        <div className="flex flex-col gap-4">
          {product.brand ? (
            <p className="text-muted-foreground text-sm font-medium uppercase tracking-wide">
              {product.brand}
            </p>
          ) : null}
          <h1 className="text-3xl font-bold tracking-tight">{product.name}</h1>

          {product.recommended ? (
            <Badge variant="default">Recommended by creator</Badge>
          ) : null}

          {product.shortDescription ? (
            <p className="text-muted-foreground">{product.shortDescription}</p>
          ) : null}

          <div className="flex items-baseline gap-3">
            {price ? (
              <span className="text-3xl font-bold">
                {formatPrice(price, currency)}
              </span>
            ) : null}
            {original && original !== price ? (
              <span className="text-muted-foreground text-lg line-through">
                {formatPrice(original, currency)}
              </span>
            ) : null}
            {discount ? (
              <Badge variant="destructive">Save {discount}%</Badge>
            ) : null}
          </div>

          {primaryOffer?.retailerName ? (
            <p className="text-sm text-muted-foreground">
              Sold via {primaryOffer.retailerName}
              {primaryOffer.availabilityStatus !== "UNKNOWN"
                ? ` · ${primaryOffer.availabilityStatus.replace(/_/g, " ").toLowerCase()}`
                : ""}
            </p>
          ) : null}

          {product.offers.length > 0 ? (
            <div className="grid gap-2">
              {product.offers.map((offer) => (
                <Button
                  key={offer.id}
                  asChild
                  size="lg"
                  variant={offer.isPrimary ? "default" : "outline"}
                  className="w-full justify-between"
                >
                  <a
                    href={`/go/${offer.id}`}
                    target="_blank"
                    rel="noopener noreferrer nofollow"
                  >
                    <span>
                      {offer.offerLabel ?? settings.affiliate.defaultCtaLabel}
                    </span>
                    <span className="text-xs opacity-80">
                      {offer.retailerName}
                      {offer.displayedPrice
                        ? ` · ${formatPrice(offer.displayedPrice.toString(), offer.currency ?? currency)}`
                        : ""}
                    </span>
                  </a>
                </Button>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-sm">
              No purchase links available yet.
            </p>
          )}

          <p className="text-muted-foreground text-xs">{disclosure}</p>

          {product.recommendationText ? (
            <div className="rounded-xl border bg-card p-4">
              <p className="text-sm font-semibold">Creator&apos;s take</p>
              <p className="text-muted-foreground mt-1 text-sm">
                {product.recommendationText}
              </p>
            </div>
          ) : null}

          {product.features.length > 0 ? (
            <div>
              <p className="text-sm font-semibold">Highlights</p>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                {product.features.map((feature, i) => (
                  <li key={i}>{feature}</li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      </div>

      {product.description ? (
        <section className="mt-10">
          <h2 className="text-xl font-semibold">Description</h2>
          <div className="prose prose-neutral dark:prose-invert mt-3 max-w-none">
            <p className="whitespace-pre-line text-muted-foreground">
              {product.description}
            </p>
          </div>
        </section>
      ) : null}

      {related.length > 0 ? (
        <section className="mt-12">
          <h2 className="text-xl font-semibold">Related products</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}

function ProductSkeleton() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <Skeleton className="h-96 w-full rounded-2xl" />
    </div>
  );
}

import { Suspense } from "react";
import type { Metadata } from "next";
import { permanentRedirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowUpRightIcon, ChevronRightIcon, ShieldCheckIcon } from "lucide-react";

import { getProductBySlug, getRelatedProducts } from "@/lib/products/queries";
import { getSettings } from "@/lib/settings";
import { buildMetadata } from "@/lib/seo/metadata";
import { formatPrice, discountPercent } from "@/lib/utils";
import { ProductCard } from "@/components/public/product-card";
import { SectionHeader } from "@/components/public/section-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
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
  return buildMetadata({
    title: product.seoTitle ?? product.name,
    description:
      product.seoDescription ??
      product.shortDescription ??
      product.description?.slice(0, 160),
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
      <Container className="py-24 text-center">
        <p className="font-display text-2xl font-semibold">Product not found</p>
        <p className="text-muted-foreground mx-auto mt-2 max-w-sm text-[15px] leading-relaxed">
          This product may have been removed or is no longer available.
        </p>
        <Button asChild variant="outline" className="mt-6">
          <Link href="/products">Browse all products</Link>
        </Button>
      </Container>
    );
  }

  const product = result.product;
  const settings = await getSettings();
  const disclosure = settings.affiliate.disclosureText;
  const primaryOffer =
    product.offers.find((o) => o.isPrimary) ?? product.offers[0];
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
    <Container className="py-8 sm:py-10">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="mb-8">
        <ol className="text-muted-foreground flex flex-wrap items-center gap-1.5 text-[13px]">
          <li>
            <Link href="/" className="hover:text-foreground transition-colors">
              Home
            </Link>
          </li>
          <ChevronRightIcon className="size-3.5" aria-hidden />
          <li>
            <Link
              href="/products"
              className="hover:text-foreground transition-colors"
            >
              Products
            </Link>
          </li>
          {product.categories[0] ? (
            <>
              <ChevronRightIcon className="size-3.5" aria-hidden />
              <li>
                <Link
                  href={`/categories/${product.categories[0].category.slug}`}
                  className="hover:text-foreground transition-colors"
                >
                  {product.categories[0].category.name}
                </Link>
              </li>
            </>
          ) : null}
          <ChevronRightIcon className="size-3.5" aria-hidden />
          <li className="text-foreground line-clamp-1 font-medium">
            {product.name}
          </li>
        </ol>
      </nav>

      <div className="grid gap-10 lg:grid-cols-[1.05fr_1fr] lg:gap-14">
        {/* Gallery */}
        <div>
          <div className="bg-muted relative aspect-[4/3] w-full overflow-hidden rounded-3xl border border-border sm:aspect-square lg:aspect-[4/3]">
            {product.images[0]?.imageUrl ? (
              <Image
                src={product.images[0].imageUrl}
                alt={product.images[0].altText ?? product.name}
                fill
                sizes="(max-width: 1024px) 100vw, 52vw"
                className="object-cover"
                priority
              />
            ) : (
              <div className="tile-fallback flex h-full items-center justify-center">
                <span className="text-muted-foreground text-sm">
                  No image available
                </span>
              </div>
            )}
            {discount ? (
              <Badge
                variant="destructive"
                className="absolute left-5 top-5 shadow-sm backdrop-blur-sm"
              >
                −{discount}%
              </Badge>
            ) : null}
          </div>

          {product.images.length > 1 ? (
            <div className="mt-4 grid grid-cols-5 gap-3">
              {product.images.slice(1).map((img) => (
                <div
                  key={img.id}
                  className="bg-muted relative aspect-square overflow-hidden rounded-xl border border-border"
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

        {/* Details */}
        <div className="flex flex-col gap-6">
          <div className="flex flex-wrap items-center gap-2">
            {product.recommended ? (
              <Badge variant="accent">Creator&apos;s pick</Badge>
            ) : null}
            {product.brand ? (
              <span className="text-muted-foreground text-[12px] font-semibold tracking-[0.1em] uppercase">
                {product.brand}
              </span>
            ) : null}
          </div>

          <div>
            <h1 className="font-display text-editorial-lg font-semibold text-foreground">
              {product.name}
            </h1>
            {product.shortDescription ? (
              <p className="text-muted-foreground mt-3 text-[15px] leading-relaxed sm:text-base">
                {product.shortDescription}
              </p>
            ) : null}
          </div>

          {price ? (
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <span className="text-3xl font-semibold tracking-tight">
                {formatPrice(price, currency)}
              </span>
              {original && original !== price ? (
                <span className="text-muted-foreground text-lg line-through">
                  {formatPrice(original, currency)}
                </span>
              ) : null}
            </div>
          ) : null}

          {/* Affiliate offers */}
          {product.offers.length > 0 ? (
            <div className="grid gap-3">
              {product.offers.map((offer) => (
                <Button
                  key={offer.id}
                  asChild
                  size="lg"
                  variant={offer.isPrimary ? "default" : "outline"}
                  className="h-auto w-full justify-between py-3.5"
                >
                  <a
                    href={`/go/${offer.id}`}
                    target="_blank"
                    rel="noopener noreferrer nofollow"
                  >
                    <span className="flex items-center gap-2">
                      {offer.offerLabel ?? settings.affiliate.defaultCtaLabel}
                      <ArrowUpRightIcon className="size-4" aria-hidden />
                    </span>
                    <span className="text-xs font-normal opacity-75">
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
            <p className="text-muted-foreground rounded-xl border border-dashed border-border px-4 py-3 text-sm">
              No purchase links available yet.
            </p>
          )}

          <p className="text-muted-foreground flex items-start gap-2 text-[13px] leading-relaxed">
            <ShieldCheckIcon
              className="text-muted-foreground/70 mt-0.5 size-4 shrink-0"
              aria-hidden
            />
            {disclosure}
          </p>

          {product.recommendationText ? (
            <div className="relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-accent/60 via-card to-card p-6">
              <span className="font-display text-primary/20 absolute -top-1 left-4 text-6xl leading-none">
                &ldquo;
              </span>
              <p className="text-primary text-[12px] font-semibold tracking-[0.1em] uppercase">
                Creator&apos;s take
              </p>
              <p className="font-display relative mt-2 text-lg leading-relaxed text-foreground/90">
                {product.recommendationText}
              </p>
            </div>
          ) : null}

          {product.features.length > 0 ? (
            <div>
              <h2 className="text-sm font-semibold">Highlights</h2>
              <ul className="text-muted-foreground mt-3 grid gap-2 text-[15px]">
                {product.features.map((feature, i) => (
                  <li key={i} className="flex gap-2.5">
                    <span
                      className="bg-primary mt-2 size-1.5 shrink-0 rounded-full"
                      aria-hidden
                    />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      </div>

      {product.description ? (
        <section className="mt-16 border-t border-border pt-12">
          <h2 className="font-display text-2xl font-semibold tracking-tight">
            About this product
          </h2>
          <p className="text-muted-foreground mt-4 max-w-2xl text-[15px] leading-relaxed whitespace-pre-line">
            {product.description}
          </p>
        </section>
      ) : null}

      {related.length > 0 ? (
        <section className="mt-20">
          <SectionHeader
            eyebrow="More like this"
            title="You might also like"
            actionLabel="View all products"
            actionHref="/products"
          />
          <div className="grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      ) : null}
    </Container>
  );
}

function ProductSkeleton() {
  return (
    <Container className="py-10">
      <Skeleton className="mb-8 h-4 w-64" />
      <div className="grid gap-10 lg:grid-cols-[1.05fr_1fr]">
        <Skeleton className="aspect-[4/3] w-full rounded-3xl" />
        <div className="space-y-5">
          <Skeleton className="h-6 w-28" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-14 w-full rounded-lg" />
          <Skeleton className="h-14 w-full rounded-lg" />
        </div>
      </div>
    </Container>
  );
}

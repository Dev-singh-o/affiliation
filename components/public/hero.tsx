import Link from "next/link";
import Image from "next/image";
import { ArrowRightIcon } from "lucide-react";

import type {
  BrandingSettings,
  HeroSettings,
  SocialLink,
} from "@/lib/settings/types";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { SocialIcons } from "@/components/public/social-icons";
import { Reveal } from "@/components/public/reveal";

/**
 * Editorial hero: eyebrow, fluid display headline, supporting copy and
 * dual CTAs, with an optional portrait. Deliberately compact so useful
 * content stays above the fold on mobile.
 */
export function Hero({
  hero,
  branding,
  socialLinks,
}: {
  hero: HeroSettings;
  branding: BrandingSettings;
  socialLinks: SocialLink[];
}) {
  const socials = socialLinks
    .filter((l) => l.enabled)
    .sort((a, b) => a.order - b.order);

  const hasPortrait = Boolean(branding.profileImageUrl);

  return (
    <section className="hero-wash relative overflow-hidden border-b border-border">
      <Container>
        <div
          className={
            hasPortrait
              ? "grid items-center gap-10 py-14 sm:py-16 lg:grid-cols-[1.15fr_0.85fr] lg:gap-16 lg:py-20"
              : "flex flex-col items-center py-14 text-center sm:py-16 lg:py-20"
          }
        >
          <div className={hasPortrait ? "max-w-2xl" : "max-w-3xl"}>
            <Reveal>
              <p className="text-primary inline-flex items-center gap-2 rounded-full border border-primary/15 bg-accent/60 px-3 py-1 text-[12px] font-semibold">
                <span className="bg-primary size-1.5 rounded-full" aria-hidden />
                {branding.creatorName}
              </p>
            </Reveal>

            <Reveal delay={70}>
              <h1 className="font-display text-editorial mt-6 text-balance font-semibold text-foreground">
                {hero.title}
              </h1>
            </Reveal>

            {hero.subtitle ? (
              <Reveal delay={120}>
                <p className="text-muted-foreground mt-5 max-w-xl text-pretty text-base leading-relaxed sm:text-lg">
                  {hero.subtitle}
                </p>
              </Reveal>
            ) : null}

            {hero.intro ? (
              <Reveal delay={160}>
                <p className="text-muted-foreground mt-3 max-w-xl text-[15px] leading-relaxed">
                  {hero.intro}
                </p>
              </Reveal>
            ) : null}

            <Reveal delay={200}>
              <div
                className={
                  hasPortrait
                    ? "mt-8 flex flex-wrap items-center gap-3"
                    : "mt-8 flex flex-wrap items-center justify-center gap-3"
                }
              >
                <Button asChild size="lg" className="shadow-sm">
                  <Link href={hero.primaryCtaHref}>
                    {hero.primaryCtaLabel}
                    <ArrowRightIcon />
                  </Link>
                </Button>
                {hero.secondaryCtaLabel ? (
                  <Button asChild size="lg" variant="outline">
                    <Link href={hero.secondaryCtaHref ?? "#"}>
                      {hero.secondaryCtaLabel}
                    </Link>
                  </Button>
                ) : null}
              </div>
            </Reveal>

            {socials.length > 0 ? (
              <Reveal delay={250}>
                <div
                  className={
                    hasPortrait
                      ? "mt-8 flex items-center gap-3"
                      : "mt-8 flex items-center justify-center gap-3"
                  }
                >
                  <span className="text-muted-foreground text-[13px]">
                    Follow
                  </span>
                  <SocialIcons links={socials} className="justify-start" />
                </div>
              </Reveal>
            ) : null}
          </div>

          {hasPortrait ? (
            <Reveal delay={120} className="lg:justify-self-end">
              <div className="relative aspect-[4/5] w-full max-w-[380px] overflow-hidden rounded-3xl border border-border shadow-md">
                <Image
                  src={branding.profileImageUrl as string}
                  alt={branding.creatorName}
                  fill
                  sizes="(max-width: 1024px) 90vw, 380px"
                  className="object-cover"
                  priority
                />
              </div>
            </Reveal>
          ) : null}
        </div>
      </Container>
    </section>
  );
}

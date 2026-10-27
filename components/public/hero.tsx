import Link from "next/link";
import Image from "next/image";
import { ArrowRightIcon, SparklesIcon } from "lucide-react";

import type { BrandingSettings, HeroSettings, SocialLink } from "@/lib/settings/types";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/public/reveal";
import { SocialIcons } from "@/components/public/social-icons";

/**
 * Premium creator hero: avatar, name, tagline, socials, dual CTAs over a
 * soft aurora gradient. All content comes from admin-configurable settings.
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

  return (
    <section className="hero-aurora relative overflow-hidden border-b">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20 lg:py-24">
        <div className="flex flex-col items-center text-center">
          {branding.profileImageUrl ? (
            <Reveal>
              <div className="ring-background relative size-24 overflow-hidden rounded-full shadow-xl ring-4 sm:size-28">
                <Image
                  src={branding.profileImageUrl}
                  alt={branding.creatorName}
                  fill
                  sizes="112px"
                  className="object-cover"
                  priority
                />
              </div>
            </Reveal>
          ) : null}

          <Reveal delay={60}>
            <p className="text-primary bg-background/60 mt-5 inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold backdrop-blur">
              <SparklesIcon className="size-3.5" aria-hidden />
              {branding.creatorName}
            </p>
          </Reveal>

          <Reveal delay={120}>
            <h1 className="font-display mt-5 max-w-2xl text-balance text-4xl font-semibold leading-[1.08] tracking-tight sm:text-5xl lg:text-6xl">
              {hero.title}
            </h1>
          </Reveal>

          <Reveal delay={180}>
            <p className="text-muted-foreground mt-5 max-w-xl text-pretty text-base leading-relaxed sm:text-lg">
              {hero.subtitle}
            </p>
          </Reveal>

          {hero.intro ? (
            <Reveal delay={220}>
              <p className="text-muted-foreground mt-3 max-w-xl text-sm leading-relaxed">
                {hero.intro}
              </p>
            </Reveal>
          ) : null}

          <Reveal delay={260}>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Button asChild size="xl" className="shadow-primary/25 shadow-lg">
                <Link href={hero.primaryCtaHref}>
                  {hero.primaryCtaLabel}
                  <ArrowRightIcon />
                </Link>
              </Button>
              {hero.secondaryCtaLabel ? (
                <Button
                  asChild
                  size="xl"
                  variant="outline"
                  className="bg-background/60 backdrop-blur"
                >
                  <Link href={hero.secondaryCtaHref ?? "#"}>
                    {hero.secondaryCtaLabel}
                  </Link>
                </Button>
              ) : null}
            </div>
          </Reveal>

          {socials.length > 0 ? (
            <Reveal delay={320}>
              <div className="mt-8 flex items-center justify-center gap-1">
                <SocialIcons links={socials} />
              </div>
            </Reveal>
          ) : null}
        </div>
      </div>
    </section>
  );
}

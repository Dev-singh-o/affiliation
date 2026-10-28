import Link from "next/link";
import { SearchIcon, ShoppingBagIcon } from "lucide-react";

import { getSettings } from "@/lib/settings";
import { SocialIcons } from "@/components/public/social-icons";
import { MobileNav } from "@/components/public/mobile-nav";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";

const CURRENT_YEAR = new Date().getFullYear();

export async function PublicHeader() {
  const settings = await getSettings();
  const branding = settings.branding;
  const nav = settings.navigation.header
    .filter((item) => item.enabled)
    .sort((a, b) => a.order - b.order);
  const socials = settings.social.links.filter((l) => l.enabled);

  return (
    <header className="bg-background/85 sticky top-0 z-40 border-b border-border backdrop-blur-xl">
      <Container>
        <div className="flex h-[72px] items-center justify-between gap-4">
          {/* Brand */}
          <Link
            href="/"
            className="group flex min-w-0 items-center gap-2.5"
            aria-label={`${branding.siteName} — home`}
          >
            {branding.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={branding.logoUrl}
                alt={branding.siteName}
                className="h-9 w-auto transition-transform duration-200 group-hover:scale-[1.02]"
              />
            ) : (
              <span className="bg-primary text-primary-foreground flex size-9 shrink-0 items-center justify-center rounded-xl shadow-sm">
                <ShoppingBagIcon className="size-[18px]" aria-hidden />
              </span>
            )}
            <span className="font-display truncate text-[17px] font-semibold tracking-tight">
              {branding.siteName}
            </span>
          </Link>

          {/* Desktop nav */}
          <nav
            className="hidden items-center gap-1 md:flex"
            aria-label="Primary"
          >
            {nav.map((item) => (
              <Link
                key={item.id}
                href={item.href}
                target={item.external ? "_blank" : undefined}
                rel={item.external ? "noopener noreferrer" : undefined}
                className="text-foreground/75 hover:text-foreground hover:bg-muted rounded-lg px-3.5 py-2 text-[15px] font-medium transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {socials.length > 0 ? (
              <div className="hidden lg:block">
                <SocialIcons links={socials} />
              </div>
            ) : null}
            <Button
              asChild
              variant="ghost"
              size="icon-sm"
              className="hidden sm:inline-flex"
            >
              <Link href="/products" aria-label="Search products">
                <SearchIcon className="size-[18px]" />
              </Link>
            </Button>
            <MobileNav
              items={nav}
              brandName={branding.siteName}
              logoUrl={branding.logoUrl}
            />
          </div>
        </div>
      </Container>
    </header>
  );
}

export async function PublicFooter() {
  const settings = await getSettings();
  const branding = settings.branding;
  const nav = settings.navigation.footer
    .filter((item) => item.enabled)
    .sort((a, b) => a.order - b.order);
  const social = settings.social.links
    .filter((l) => l.enabled)
    .sort((a, b) => a.order - b.order);

  return (
    <footer className="mt-24 border-t border-border bg-card/40">
      <Container>
        <div className="grid gap-12 py-16 md:grid-cols-[1.4fr_1fr_1.2fr]">
          <div>
            <div className="flex items-center gap-2.5">
              {branding.logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={branding.logoUrl}
                  alt={branding.siteName}
                  className="h-8 w-auto"
                />
              ) : (
                <span className="bg-primary text-primary-foreground flex size-8 items-center justify-center rounded-lg">
                  <ShoppingBagIcon className="size-4" aria-hidden />
                </span>
              )}
              <p className="font-display text-lg font-semibold tracking-tight">
                {branding.siteName}
              </p>
            </div>
            <p className="text-muted-foreground mt-4 max-w-sm text-[15px] leading-relaxed">
              {branding.tagline}
            </p>
            {social.length > 0 ? (
              <div className="mt-6">
                <SocialIcons links={social} className="justify-start" />
              </div>
            ) : null}
          </div>

          <nav aria-label="Footer">
            <p className="text-[11px] font-semibold tracking-[0.14em] uppercase">
              Explore
            </p>
            <ul className="mt-4 space-y-1">
              {nav.map((item) => (
                <li key={item.id}>
                  <Link
                    href={item.href}
                    target={item.external ? "_blank" : undefined}
                    rel={item.external ? "noopener noreferrer" : undefined}
                    className="text-muted-foreground hover:text-foreground -mx-2 flex min-h-10 items-center rounded-md px-2 text-[15px] transition-colors"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <p className="text-[11px] font-semibold tracking-[0.14em] uppercase">
              Affiliate disclosure
            </p>
            <p className="text-muted-foreground mt-5 text-sm leading-relaxed">
              {settings.affiliate.disclosureText}
            </p>
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-3 border-t border-border py-7 sm:flex-row">
          <p className="text-muted-foreground text-[13px]">
            © {CURRENT_YEAR} {branding.siteName}. All rights reserved.
          </p>
          <p className="text-muted-foreground text-[13px]">
            Some links are affiliate links.
          </p>
        </div>
      </Container>
    </footer>
  );
}

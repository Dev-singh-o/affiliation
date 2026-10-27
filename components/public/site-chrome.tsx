import Link from "next/link";
import { ShoppingBagIcon } from "lucide-react";

import { getSettings } from "@/lib/settings";
import { SocialIcons } from "@/components/public/social-icons";
import { cn } from "@/lib/utils";

const CURRENT_YEAR = new Date().getFullYear();

export async function PublicHeader() {
  const settings = await getSettings();
  const branding = settings.branding;
  const nav = settings.navigation.header
    .filter((item) => item.enabled)
    .sort((a, b) => a.order - b.order);

  return (
    <header className="bg-background/80 sticky top-0 z-40 border-b backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link
          href="/"
          className="group flex items-center gap-2 text-lg font-bold tracking-tight"
        >
          {branding.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={branding.logoUrl}
              alt={branding.siteName}
              className="h-8 w-auto transition-transform group-hover:scale-105"
            />
          ) : (
            <span className="bg-primary text-primary-foreground flex size-8 items-center justify-center rounded-lg shadow-sm">
              <ShoppingBagIcon className="size-4" aria-hidden />
            </span>
          )}
          <span className="font-display">{branding.siteName}</span>
        </Link>

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
              className="text-muted-foreground hover:text-foreground hover:bg-accent rounded-full px-4 py-2 text-sm font-medium transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <SocialIcons
            links={settings.social.links.filter((l) => l.enabled)}
            className="hidden sm:flex"
          />
        </div>
      </div>
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
    <footer className="border-t bg-muted/30">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-3">
        <div>
          <p className="font-display text-xl font-bold tracking-tight">
            {branding.siteName}
          </p>
          <p className="text-muted-foreground mt-3 text-sm leading-relaxed">
            {branding.tagline}
          </p>
          {social.length > 0 ? (
            <div className="mt-5">
              <SocialIcons links={social} className="justify-start" />
            </div>
          ) : null}
        </div>
        <div>
          <p className="text-sm font-semibold">Navigate</p>
          <ul className="mt-4 space-y-2.5">
            {nav.map((item) => (
              <li key={item.id}>
                <Link
                  href={item.href}
                  target={item.external ? "_blank" : undefined}
                  rel={item.external ? "noopener noreferrer" : undefined}
                  className="text-muted-foreground hover:text-foreground text-sm transition-colors"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-sm font-semibold">Affiliate disclosure</p>
          <p className="text-muted-foreground mt-4 text-sm leading-relaxed">
            {settings.affiliate.disclosureText}
          </p>
        </div>
      </div>
      <div className="border-t py-5 text-center text-xs text-muted-foreground">
        © {CURRENT_YEAR} {branding.siteName}. All rights reserved.
      </div>
    </footer>
  );
}

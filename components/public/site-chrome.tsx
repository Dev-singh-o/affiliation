import Link from "next/link";
import { ShoppingBagIcon } from "lucide-react";

import { getSettings } from "@/lib/settings";
import { cn } from "@/lib/utils";

const PLATFORM_ICONS: Record<string, string> = {
  instagram: "IG",
  youtube: "YT",
  facebook: "FB",
  tiktok: "TT",
  x: "X",
  twitter: "X",
};

const CURRENT_YEAR = new Date().getFullYear();

export async function PublicHeader() {
  const settings = await getSettings();
  const branding = settings.branding;
  const nav = settings.navigation.header
    .filter((item) => item.enabled)
    .sort((a, b) => a.order - b.order);

  return (
    <header className="bg-background/95 sticky top-0 z-40 border-b backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2 text-lg font-bold tracking-tight">
          {branding.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={branding.logoUrl}
              alt={branding.siteName}
              className="h-8 w-auto"
            />
          ) : (
            <ShoppingBagIcon className="text-primary size-6" aria-hidden />
          )}
          <span>{branding.siteName}</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex" aria-label="Primary">
          {nav.map((item) => (
            <Link
              key={item.id}
              href={item.href}
              target={item.external ? "_blank" : undefined}
              rel={item.external ? "noopener noreferrer" : undefined}
              className="text-muted-foreground hover:text-foreground rounded-md px-3 py-2 text-sm font-medium transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {settings.social.links
            .filter((l) => l.enabled)
            .sort((a, b) => a.order - b.order)
            .slice(0, 4)
            .map((link) => (
              <Link
                key={link.id}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={link.label ?? link.platform}
                className="text-muted-foreground hover:text-foreground rounded-md px-2 py-1 text-xs font-semibold uppercase"
              >
                {PLATFORM_ICONS[link.platform.toLowerCase()] ?? link.platform.slice(0, 2).toUpperCase()}
              </Link>
            ))}
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
    <footer className="border-t">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-3">
        <div>
          <p className="text-lg font-bold tracking-tight">{branding.siteName}</p>
          <p className="text-muted-foreground mt-2 text-sm">{branding.tagline}</p>
          {social.length > 0 ? (
            <div className="mt-4 flex flex-wrap gap-3">
              {social.map((link) => (
                <Link
                  key={link.id}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground text-sm"
                >
                  {link.label ?? link.platform}
                </Link>
              ))}
            </div>
          ) : null}
        </div>
        <div>
          <p className="text-sm font-semibold">Navigate</p>
          <ul className="mt-3 space-y-2">
            {nav.map((item) => (
              <li key={item.id}>
                <Link
                  href={item.href}
                  target={item.external ? "_blank" : undefined}
                  rel={item.external ? "noopener noreferrer" : undefined}
                  className="text-muted-foreground hover:text-foreground text-sm"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-sm font-semibold">Affiliate disclosure</p>
          <p className="text-muted-foreground mt-3 text-sm">
            {settings.affiliate.disclosureText}
          </p>
        </div>
      </div>
      <div className="border-t py-4 text-center text-xs text-muted-foreground">
        © {CURRENT_YEAR} {branding.siteName}. All rights reserved.
      </div>
    </footer>
  );
}

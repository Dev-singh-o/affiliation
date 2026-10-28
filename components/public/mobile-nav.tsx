"use client";

import { useState } from "react";
import Link from "next/link";
import { MenuIcon, SearchIcon, XIcon } from "lucide-react";

import type { NavItem } from "@/lib/settings/types";
import { Button } from "@/components/ui/button";

/**
 * Mobile navigation drawer — accessible, keyboard friendly, tap targets
 * sized for thumbs. The trigger is rendered by the server header.
 */
export function MobileNav({
  items,
  brandName,
  logoUrl,
}: {
  items: NavItem[];
  brandName: string;
  logoUrl?: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="md:hidden">
      <Button
        variant="ghost"
        size="icon-sm"
        aria-label="Open navigation menu"
        aria-expanded={open}
        onClick={() => setOpen(true)}
      >
        <MenuIcon className="size-5" />
      </Button>

      {open ? (
        <div
          className="fixed inset-0 z-50 flex flex-col"
          role="dialog"
          aria-modal="true"
          aria-label="Site navigation"
        >
          <button
            type="button"
            aria-label="Close navigation menu"
            className="absolute inset-0 bg-foreground/25 backdrop-blur-[2px]"
            onClick={() => setOpen(false)}
          />
          <div className="bg-background relative ml-auto flex h-full w-[86%] max-w-sm flex-col shadow-2xl">
            <div className="flex h-16 items-center justify-between border-b px-5">
              <Link
                href="/"
                className="font-display truncate text-base font-semibold tracking-tight"
                onClick={() => setOpen(false)}
              >
                {logoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={logoUrl} alt={brandName} className="h-7 w-auto" />
                ) : (
                  brandName
                )}
              </Link>
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label="Close navigation menu"
                onClick={() => setOpen(false)}
              >
                <XIcon className="size-5" />
              </Button>
            </div>

            <nav
              className="flex-1 overflow-y-auto px-3 py-4"
              aria-label="Mobile primary"
            >
              <ul className="flex flex-col gap-1">
                {items.map((item) => {
                  return (
                    <li key={item.id}>
                      <Link
                        href={item.href}
                        onClick={() => setOpen(false)}
                        target={item.external ? "_blank" : undefined}
                        rel={item.external ? "noopener noreferrer" : undefined}
                        className="text-foreground/80 hover:bg-muted hover:text-foreground flex min-h-12 items-center justify-between rounded-xl px-4 text-[15px] font-medium transition-colors"
                      >
                        {item.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>

            <div className="border-t p-4">
              <Button asChild variant="outline" className="w-full">
                <Link href="/products" onClick={() => setOpen(false)}>
                  <SearchIcon />
                  Browse products
                </Link>
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

"use client";

import { useState } from "react";
import Link from "next/link";
import { SearchIcon } from "lucide-react";

import type { NavItem } from "@/lib/settings/types";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

/**
 * Mobile navigation drawer.
 *
 * Built on the shared Radix `Sheet` so it is rendered in a portal on
 * <body>. This matters: the sticky header uses `backdrop-filter`, which
 * creates a containing block for `position: fixed` children — an in-header
 * drawer would be trapped inside the header instead of covering the screen.
 *
 * The open state is controlled so tapping any link closes the drawer
 * (Radix does not do this automatically for in-content navigation).
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
  const close = () => setOpen(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon-sm"
          className="md:hidden"
          aria-label="Open navigation menu"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            className="size-5"
            aria-hidden
          >
            <path d="M4 6h16" />
            <path d="M4 12h16" />
            <path d="M4 18h16" />
          </svg>
        </Button>
      </SheetTrigger>

      <SheetContent
        side="right"
        className="flex w-[88%] max-w-sm flex-col gap-0 p-0"
      >
        <SheetHeader className="shrink-0 border-b px-5 py-4">
          <div className="flex items-center justify-between gap-3">
            <Link
              href="/"
              onClick={close}
              className="font-display truncate text-base font-semibold tracking-tight"
            >
              {logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={logoUrl} alt={brandName} className="h-7 w-auto" />
              ) : (
                brandName
              )}
            </Link>
          </div>
          <SheetTitle className="sr-only">Site navigation</SheetTitle>
          <SheetDescription className="sr-only">
            Browse the storefront by section.
          </SheetDescription>
        </SheetHeader>

        <nav
          className="flex-1 overflow-y-auto px-3 py-4"
          aria-label="Mobile primary"
        >
          <ul className="flex flex-col gap-1">
            {items.map((item) => (
              <li key={item.id}>
                <Link
                  href={item.href}
                  onClick={close}
                  target={item.external ? "_blank" : undefined}
                  rel={item.external ? "noopener noreferrer" : undefined}
                  className="text-foreground/85 hover:bg-muted hover:text-foreground flex min-h-12 items-center rounded-xl px-4 text-[15px] font-medium transition-colors"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="shrink-0 border-t p-4">
          <Button asChild variant="outline" className="w-full">
            <Link href="/products" onClick={close}>
              <SearchIcon />
              Browse products
            </Link>
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

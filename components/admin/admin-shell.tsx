"use client";

import { type ReactNode, useTransition } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3Icon,
  FileTextIcon,
  FolderTreeIcon,
  LayoutDashboardIcon,
  LogOutIcon,
  MenuIcon,
  PackageIcon,
  SettingsIcon,
  TicketPercentIcon,
  ExternalLinkIcon,
} from "lucide-react";

import { logoutAction } from "@/actions/auth";
import type { SessionUser } from "@/lib/auth/session";
import { cn } from "@/lib/utils";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const NAV_ITEMS = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboardIcon },
  { href: "/admin/products", label: "Products", icon: PackageIcon },
  { href: "/admin/categories", label: "Categories", icon: FolderTreeIcon },
  {
    href: "/admin/affiliate-offers",
    label: "Affiliate offers",
    icon: TicketPercentIcon,
  },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart3Icon },
  { href: "/admin/content", label: "Content", icon: FileTextIcon },
  { href: "/admin/settings", label: "Settings", icon: SettingsIcon },
];

function isActive(pathname: string, href: string): boolean {
  if (href === "/admin") return pathname === "/admin";
  return pathname === href || pathname.startsWith(`${href}/`);
}

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <nav className="grid gap-1" aria-label="Admin navigation">
      {NAV_ITEMS.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          onClick={onNavigate}
          aria-current={isActive(pathname, item.href) ? "page" : undefined}
          className={cn(
            "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
            isActive(pathname, item.href)
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:bg-muted hover:text-foreground",
          )}
        >
          <item.icon className="size-4" aria-hidden />
          {item.label}
        </Link>
      ))}
    </nav>
  );
}

export function AdminShell({
  user,
  children,
}: {
  user: SessionUser;
  children: ReactNode;
}) {
  const [pending, startTransition] = useTransition();
  const initials = (user.name ?? user.email)
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="flex min-h-svh">
      {/* Desktop sidebar */}
      <aside className="bg-card sticky top-0 hidden h-svh w-64 shrink-0 flex-col border-r lg:flex">
        <div className="flex h-16 items-center border-b px-4">
          <Link href="/admin" className="text-lg font-bold tracking-tight">
            Storefront Admin
          </Link>
        </div>
        <div className="flex-1 overflow-y-auto p-3">
          <NavLinks />
        </div>
        <div className="border-t p-3">
          <Link
            href="/"
            className="text-muted-foreground hover:text-foreground flex items-center gap-2 rounded-lg px-3 py-2 text-sm"
          >
            <ExternalLinkIcon className="size-4" aria-hidden />
            View storefront
          </Link>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Topbar */}
        <header className="bg-background/95 sticky top-0 z-40 flex h-16 items-center justify-between gap-4 border-b px-4 backdrop-blur lg:px-6">
          <div className="flex items-center gap-2">
            <Sheet>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="lg:hidden"
                  aria-label="Open navigation"
                >
                  <MenuIcon />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-72 p-4">
                <SheetTitle className="mb-4 text-left text-lg font-bold">
                  Storefront Admin
                </SheetTitle>
                <NavLinks />
              </SheetContent>
            </Sheet>
            <span className="text-muted-foreground hidden text-sm lg:block">
              Manage your affiliate storefront
            </span>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="gap-2 px-2">
                <Avatar className="size-8">
                  <AvatarImage src={undefined} alt="" />
                  <AvatarFallback>{initials}</AvatarFallback>
                </Avatar>
                <span className="hidden text-sm font-medium sm:block">
                  {user.name ?? user.email}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col">
                  <span>{user.name ?? "Admin"}</span>
                  <span className="text-muted-foreground text-xs font-normal">
                    {user.email} · {user.role}
                  </span>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                disabled={pending}
                onSelect={() =>
                  startTransition(async () => {
                    await logoutAction();
                  })
                }
              >
                <LogOutIcon />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>

        <main className="flex-1 p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}

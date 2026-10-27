import type { Metadata } from "next";

import { PublicHeader, PublicFooter } from "@/components/public/site-chrome";
import { BrandTheme } from "@/components/public/brand-theme";

export const metadata: Metadata = {
  title: "Affiliate storefront",
};

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-svh flex-col">
      <BrandTheme />
      <PublicHeader />
      <main className="flex-1">{children}</main>
      <PublicFooter />
    </div>
  );
}

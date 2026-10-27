import { Suspense, type ReactNode } from "react";
import type { Metadata } from "next";

import { requireStaff } from "@/lib/auth/session";
import { AdminShell } from "@/components/admin/admin-shell";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={<AdminFallback />}>
      <AdminGuard>{children}</AdminGuard>
    </Suspense>
  );
}

async function AdminGuard({ children }: { children: ReactNode }) {
  // Server-side authorization on every admin page (layout-level defense).
  const user = await requireStaff();
  return <AdminShell user={user}>{children}</AdminShell>;
}

function AdminFallback() {
  return (
    <div className="flex min-h-svh">
      <div className="hidden w-64 border-r p-4 lg:block">
        <Skeleton className="mb-6 h-8 w-32" />
        <div className="space-y-2">
          {Array.from({ length: 7 }).map((_, i) => (
            <Skeleton key={i} className="h-9 w-full" />
          ))}
        </div>
      </div>
      <div className="flex-1 p-6">
        <Skeleton className="mb-6 h-10 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    </div>
  );
}

import * as React from "react";
import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * 21st.dev-style empty state: icon in a soft ring, title, description, action.
 */
function EmptyState({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="empty-state"
      className={cn(
        "flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed p-10 text-center",
        className,
      )}
      {...props}
    />
  );
}

function EmptyStateIcon({
  icon: Icon,
  className,
}: {
  icon: LucideIcon;
  className?: string;
}) {
  return (
    <div
      data-slot="empty-state-icon"
      className={cn(
        "bg-muted text-muted-foreground mb-2 flex size-12 items-center justify-center rounded-full",
        className,
      )}
    >
      <Icon className="size-6" aria-hidden />
    </div>
  );
}

function EmptyStateTitle({
  className,
  ...props
}: React.ComponentProps<"h3">) {
  return (
    <h3
      data-slot="empty-state-title"
      className={cn("text-lg font-semibold", className)}
      {...props}
    />
  );
}

function EmptyStateDescription({
  className,
  ...props
}: React.ComponentProps<"p">) {
  return (
    <p
      data-slot="empty-state-description"
      className={cn("text-muted-foreground max-w-sm text-sm", className)}
      {...props}
    />
  );
}

function EmptyStateAction({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="empty-state-action"
      className={cn("mt-4 flex items-center gap-2", className)}
      {...props}
    />
  );
}

export {
  EmptyState,
  EmptyStateIcon,
  EmptyStateTitle,
  EmptyStateDescription,
  EmptyStateAction,
};

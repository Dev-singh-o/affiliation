import * as React from "react";

import { cn } from "@/lib/utils";

/**
 * Shared page container: max-width 1280px with fluid horizontal padding.
 * Every public section uses this so alignment is consistent across pages.
 */
function Container({
  className,
  as: Tag = "div",
  size = "default",
  ...props
}: React.ComponentProps<"div"> & {
  as?: "div" | "section" | "header" | "footer" | "nav" | "main";
  size?: "default" | "narrow" | "wide";
}) {
  return (
    <Tag
      data-slot="container"
      className={cn(
        "mx-auto w-full px-5 sm:px-8",
        size === "narrow" && "max-w-3xl",
        size === "default" && "max-w-6xl",
        size === "wide" && "max-w-7xl",
        className,
      )}
      {...props}
    />
  );
}

export { Container };

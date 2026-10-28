import Link from "next/link";
import { ArrowRightIcon } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * Consistent section header used across the storefront: eyebrow, title,
 * optional description, and an optional "view all" link.
 */
export function SectionHeader({
  eyebrow,
  title,
  description,
  actionLabel,
  actionHref,
  className,
  headingLevel = "h2",
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  actionLabel?: string;
  actionHref?: string;
  className?: string;
  headingLevel?: "h1" | "h2" | "h3";
}) {
  const Heading = headingLevel;

  return (
    <div
      className={cn(
        "mb-8 flex flex-col gap-3 sm:mb-10 sm:flex-row sm:items-end sm:justify-between",
        className,
      )}
    >
      <div className="max-w-2xl">
        {eyebrow ? (
          <p className="text-primary mb-2 text-[11px] font-semibold tracking-[0.14em] uppercase">
            {eyebrow}
          </p>
        ) : null}
        <Heading className="font-display text-editorial-lg font-semibold text-foreground">
          {title}
        </Heading>
        {description ? (
          <p className="text-muted-foreground mt-2.5 text-[15px] leading-relaxed">
            {description}
          </p>
        ) : null}
      </div>
      {actionLabel && actionHref ? (
        <Link
          href={actionHref}
          className="group text-primary inline-flex shrink-0 items-center gap-1.5 text-sm font-semibold transition-colors hover:text-primary/80"
        >
          {actionLabel}
          <ArrowRightIcon
            className="size-4 transition-transform duration-200 group-hover:translate-x-0.5"
            aria-hidden
          />
        </Link>
      ) : null}
    </div>
  );
}

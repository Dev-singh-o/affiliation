import Link from "next/link";
import {
  Camera,
  Play,
  Globe,
  Music2,
  Link2,
  AtSign,
  MessageCircle,
} from "lucide-react";

import type { SocialLink } from "@/lib/settings/types";
import { cn } from "@/lib/utils";

const PLATFORM_META: Record<
  string,
  { icon: typeof Camera; label: string }
> = {
  instagram: { icon: Camera, label: "Instagram" },
  youtube: { icon: Play, label: "YouTube" },
  facebook: { icon: Globe, label: "Facebook" },
  tiktok: { icon: Music2, label: "TikTok" },
  x: { icon: MessageCircle, label: "X" },
  twitter: { icon: MessageCircle, label: "X" },
  threads: { icon: AtSign, label: "Threads" },
};

/** Circular social icon buttons used in the hero and footer. */
export function SocialIcons({
  links,
  className,
}: {
  links: SocialLink[];
  className?: string;
}) {
  return (
    <div className={cn("flex flex-wrap items-center justify-center gap-2", className)}>
      {links.map((link) => {
        const meta = PLATFORM_META[link.platform.toLowerCase()];
        const Icon = meta?.icon ?? Link2;
        const label = link.label ?? meta?.label ?? link.platform;
        return (
          <Link
            key={link.id}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={label}
            title={label}
            className="text-muted-foreground hover:text-primary hover:border-primary/40 hover:bg-accent flex size-10 items-center justify-center rounded-full border bg-background/60 backdrop-blur transition-colors"
          >
            <Icon className="size-4" aria-hidden />
          </Link>
        );
      })}
    </div>
  );
}

"use client";

import { useState } from "react";
import Image from "next/image";

import { cn } from "@/lib/utils";

/**
 * A remote WordPress image on a paper plate.
 *
 * Elementor's carousel markup carries no `width`/`height` and the media details
 * are not in `ContentQuery`, so there is no honest intrinsic size to hand
 * `next/image` — `fill` inside a framed box is the only way to reserve space
 * without inventing an aspect ratio.
 *
 * The plate is also the placeholder. `placeholder="blur"` on a remote source
 * needs a `blurDataURL`, and generating those means pulling every full-size
 * upload off a server that rate-limits bursts at build time; the dashed frame
 * the shop already uses costs nothing and holds the grid steady.
 */
export function GalleryImage({
  src,
  alt,
  sizes,
  fit = "cover",
  className,
  priority,
}: {
  src: string;
  alt: string;
  sizes: string;
  fit?: "cover" | "contain";
  className?: string;
  priority?: boolean;
}) {
  const [loaded, setLoaded] = useState(false);

  return (
    <div className={cn("relative overflow-hidden bg-paper-shade", className)}>
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        priority={priority}
        onLoad={() => setLoaded(true)}
        className={cn(
          "transition-opacity duration-200 ease-[var(--ease-out)]",
          fit === "cover" ? "object-cover" : "object-contain",
          loaded ? "opacity-100" : "opacity-0",
        )}
      />
    </div>
  );
}

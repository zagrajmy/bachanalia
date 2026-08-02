"use client";

import { type CSSProperties, useRef, useState } from "react";
import Image from "next/image";

import { cn } from "@/lib/utils";

export function GalleryImage({
  src,
  alt,
  sizes,
  fit = "cover",
  className,
  priority,
  style,
  reveal = "fade",
  onReady,
  blurDataURL,
}: {
  src: string;
  alt: string;
  sizes: string;
  fit?: "cover" | "contain";
  className?: string;
  priority?: boolean;
  style?: CSSProperties;
  reveal?: "fade" | "instant";
  onReady?: (image: HTMLImageElement) => void;
  blurDataURL?: string;
}) {
  const [loaded, setLoaded] = useState(false);
  const notified = useRef(false);

  const markReady = (node: HTMLImageElement) => {
    if (notified.current) return;

    const finish = () => {
      if (notified.current) return;
      notified.current = true;
      setLoaded(true);
      queueMicrotask(() => onReady?.(node));
    };

    node.decode().then(finish, finish);
  };

  return (
    <div className={cn("relative overflow-hidden bg-paper-shade", className)} style={style}>
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        priority={priority}
        unoptimized
        placeholder={blurDataURL ? "blur" : "empty"}
        blurDataURL={blurDataURL}
        ref={(node) => {
          if (node?.complete && node.naturalWidth > 0) markReady(node);
        }}
        onLoad={(event) => markReady(event.currentTarget)}
        className={cn(
          fit === "cover" ? "object-cover" : "object-contain",
          reveal === "fade" && !blurDataURL && "transition-opacity duration-200 ease-[var(--ease-out)]",
          reveal === "instant" || loaded || blurDataURL ? "opacity-100" : "opacity-0",
        )}
      />
    </div>
  );
}

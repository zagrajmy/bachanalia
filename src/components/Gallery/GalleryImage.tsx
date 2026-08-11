"use client";

import { type CSSProperties, useRef, useState } from "react";
import Image from "next/image";

import { cn } from "@/lib/utils";
import { mediaLoader } from "@/utils/mediaPaths";

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
  alt: string;
  blurDataURL?: string;
  className?: string;
  fit?: "contain" | "cover";
  onReady?: (image: HTMLImageElement) => void;
  priority?: boolean;
  reveal?: "fade" | "instant";
  sizes: string;
  src: string;
  style?: CSSProperties;
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
        loader={mediaLoader}
        placeholder={blurDataURL ? "blur" : "empty"}
        blurDataURL={blurDataURL}
        ref={(node) => {
          if (node?.complete && node.naturalWidth > 0) markReady(node);
        }}
        onLoad={(event) => {
          markReady(event.currentTarget);
        }}
        className={cn(
          fit === "cover" ? "object-cover" : "object-contain",
          reveal === "fade" && !blurDataURL && "transition-opacity duration-200 ease-out",
          reveal === "instant" || loaded || blurDataURL ? "opacity-100" : "opacity-0",
        )}
      />
    </div>
  );
}

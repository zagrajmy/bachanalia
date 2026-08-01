"use client";

import { useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";

import type { WpGalleryImage } from "@/utils/prepareWpContent";

import { GalleryImage } from "./GalleryImage";
import { Lightbox } from "./Lightbox";

/** Past a dozen photos the grid reads as a contact sheet, so the cells shrink. */
const DENSE_FROM = 13;

/**
 * The thumbnail and the opened photo share this name, so the browser tweens
 * one into the other instead of cross-fading a panel over the page. Only one
 * element may carry it at a time, which is what `morph` below tracks.
 */
const MORPH = "gallery-photo";

function withMorph(run: () => void) {
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (reduced || !document.startViewTransition) return run();

  document.startViewTransition(() => flushSync(run));
}

/**
 * Elementor's image carousel, rendered as a contact sheet.
 *
 * Its Swiper script never runs here, so the slides were already a static grid;
 * this only replaces the raw remote `<img>` tags with `next/image` and makes
 * every cell a real button that opens the photo full size.
 *
 * The alt text WordPress carries is the camera's filename — `IMG_7508-2` — so
 * it is dropped for the positional label a screen reader can actually use.
 */
export function Gallery({ images }: { images: WpGalleryImage[] }) {
  const [index, setIndex] = useState<number | null>(null);
  const thumbnails = useRef<(HTMLButtonElement | null)[]>([]);
  const finalFocus = useRef<HTMLButtonElement | null>(null);
  /** Which thumbnail the photo flies out of, and back into. */
  const morph = useRef(0);

  useEffect(() => {
    if (index !== null) finalFocus.current = thumbnails.current[index] ?? null;
  }, [index]);

  if (images.length === 0) return null;

  const dense = images.length >= DENSE_FROM;
  const cell = dense ? "8.5rem" : "15rem";

  return (
    <div className="my-8">
      <noscript>
        <style>{`[data-gallery] img { opacity: 1 }`}</style>
      </noscript>

      <ul
        data-gallery=""
        className="grid list-none gap-2 p-0 sm:gap-3"
        style={{ gridTemplateColumns: `repeat(auto-fill, minmax(min(${cell}, 100%), 1fr))` }}
      >
        {images.map((image, i) => (
          <li key={`${image.src}-${i}`}>
            <button
              type="button"
              ref={(node) => {
                thumbnails.current[i] = node;
              }}
              onClick={() => {
                morph.current = i;
                withMorph(() => setIndex(i));
              }}
              aria-label={`Powiększ zdjęcie ${i + 1} z ${images.length}`}
              className="block w-full cursor-zoom-in rounded-card border border-dashed border-navy/25 transition-colors duration-200 ease-[var(--ease-out)] hover:border-navy/70 [&_img]:transition-transform [&_img]:duration-200 [&_img]:ease-[var(--ease-out)] hover:[&_img]:scale-[1.04]"
            >
              <GalleryImage
                src={image.src}
                alt=""
                sizes={dense ? "(min-width: 40rem) 9rem, 45vw" : "(min-width: 40rem) 16rem, 45vw"}
                className="aspect-4/3 rounded-card"
                style={
                  index === null && morph.current === i ? { viewTransitionName: MORPH } : undefined
                }
              />
            </button>
          </li>
        ))}
      </ul>

      <Lightbox
        images={images}
        index={index}
        onIndexChange={(next) => {
          morph.current = next;
          setIndex(next);
        }}
        onClose={() => withMorph(() => setIndex(null))}
        morphName={MORPH}
        finalFocus={finalFocus}
      />
    </div>
  );
}

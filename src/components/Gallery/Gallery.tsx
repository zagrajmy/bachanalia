"use client";

import { useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";

import type { WpGalleryImage } from "@/utils/prepareWpContent";

import { GalleryImage } from "./GalleryImage";
import { Lightbox } from "./Lightbox";

const DENSE_FROM = 13;
const MORPH = "gallery-photo";

function withMorph(run: () => void, ms = 260) {
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (reduced || !document.startViewTransition) return run();

  const root = document.documentElement;
  root.style.setProperty("--gallery-morph-ms", `${ms}ms`);
  const transition = document.startViewTransition(() => flushSync(run));
  transition.finished.finally(() => root.style.removeProperty("--gallery-morph-ms"));
}

export function Gallery({ images }: { images: WpGalleryImage[] }) {
  const [index, setIndex] = useState<number | null>(null);
  const [morphIndex, setMorphIndex] = useState(0);
  const thumbnails = useRef<(HTMLButtonElement | null)[]>([]);
  const finalFocus = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (index !== null) finalFocus.current = thumbnails.current[index] ?? null;
  }, [index]);

  if (images.length === 0) return null;

  const dense = images.length >= DENSE_FROM;
  const cell = dense ? "8.5rem" : "15rem";
  const thumbSizes = dense ? "(min-width: 40rem) 9rem, 45vw" : "(min-width: 40rem) 16rem, 45vw";

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
                flushSync(() => setMorphIndex(i));
                withMorph(() => setIndex(i));
              }}
              aria-label={`Powiększ zdjęcie ${i + 1} z ${images.length}`}
              className="block w-full cursor-zoom-in overflow-hidden [&_img]:transition-transform [&_img]:duration-200 [&_img]:ease-[var(--ease-out)] hover:[&_img]:scale-[1.04]"
            >
              <GalleryImage
                src={image.src}
                alt=""
                sizes={thumbSizes}
                blurDataURL={image.blurDataURL}
                className="aspect-4/3"
                style={
                  index === null && morphIndex === i ? { viewTransitionName: MORPH } : undefined
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
          setMorphIndex(next);
          setIndex(next);
        }}
        onClose={() => withMorph(() => setIndex(null))}
        morphName={MORPH}
        thumbSizes={thumbSizes}
        finalFocus={finalFocus}
      />
    </div>
  );
}

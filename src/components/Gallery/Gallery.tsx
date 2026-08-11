"use client";

import { useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";

import type { WpGalleryImage } from "@/utils/prepareWpContent";

import { GalleryImage } from "./GalleryImage";

const DENSE_FROM = 13;
const MORPH = "gallery-photo";
const loadLightbox = () => import("./Lightbox").then((module) => module.Lightbox);

function withMorph(run: () => void, ms = 260) {
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /** lib.dom declares this unconditionally; Safari below 18 does not ship it. */
  // oxlint-disable-next-line typescript/no-unnecessary-condition
  if (reduced || !document.startViewTransition) {
    run();
    return;
  }

  const root = document.documentElement;
  root.style.setProperty("--gallery-morph-ms", `${ms}ms`);
  const transition = document.startViewTransition(() => {
    flushSync(run);
  });

  transition.finished
    .finally(() => {
      root.style.removeProperty("--gallery-morph-ms");
    })
    .catch(() => {
      /** A render that threw is already reported; the custom property is cleared above. */
    });
}

export function Gallery({ images }: { images: WpGalleryImage[] }) {
  const [index, setIndex] = useState<number | null>(null);
  const [morphIndex, setMorphIndex] = useState(0);
  const [LoadedLightbox, setLoadedLightbox] = useState<typeof import("./Lightbox").Lightbox>();
  const thumbnails = useRef<(HTMLButtonElement | null)[]>([]);
  const finalFocus = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (index !== null) finalFocus.current = thumbnails.current[index] ?? null;
  }, [index]);

  if (images.length === 0) return null;

  const dense = images.length >= DENSE_FROM;
  const cell = dense ? "8.5rem" : "15rem";
  const thumbSizes = dense ? "(min-width: 40rem) 9rem, 45vw" : "(min-width: 40rem) 16rem, 45vw";

  const open = async (nextIndex: number) => {
    try {
      const Lightbox = await loadLightbox();

      flushSync(() => {
        setLoadedLightbox(() => Lightbox);
        setMorphIndex(nextIndex);
      });
      withMorph(() => {
        setIndex(nextIndex);
      });
    } catch (error) {
      reportError(error);
    }
  };

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
              onPointerEnter={() => void loadLightbox().catch(reportError)}
              onFocus={() => void loadLightbox().catch(reportError)}
              onClick={() => void open(i)}
              aria-label={`Powiększ zdjęcie ${i + 1} z ${images.length}`}
              className="block w-full cursor-zoom-in overflow-hidden [&_img]:transition-transform [&_img]:duration-200 [&_img]:ease-out hover:[&_img]:scale-[1.04]"
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

      {LoadedLightbox && (
        <LoadedLightbox
          images={images}
          index={index}
          onIndexChange={(next) => {
            setMorphIndex(next);
            setIndex(next);
          }}
          onClose={() => {
            withMorph(() => {
              setIndex(null);
            });
          }}
          morphName={MORPH}
          thumbSizes={thumbSizes}
          finalFocus={finalFocus}
        />
      )}
    </div>
  );
}

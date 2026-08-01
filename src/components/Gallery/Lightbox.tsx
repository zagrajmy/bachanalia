"use client";

import {
  type KeyboardEvent,
  type MouseEvent,
  type RefObject,
  useEffect,
  useRef,
  useState,
} from "react";
import { ChevronLeftIcon, ChevronRightIcon, XIcon } from "lucide-react";
import { Dialog } from "@base-ui/react/dialog";

import { cn } from "@/lib/utils";
import type { WpGalleryImage } from "@/utils/prepareWpContent";

import { GalleryImage } from "./GalleryImage";

const SWIPE_THRESHOLD = 44;
const ZOOM = 2.5;

const CONTROL =
  "flex size-11 shrink-0 items-center justify-center rounded-card border border-dashed border-current/45 text-ink transition-[border-color,transform] duration-150 ease-[var(--ease-out)] hover:border-current active:scale-[0.96] disabled:pointer-events-none disabled:opacity-35";

/**
 * The photo full-bleed on navy, framed the way the rest of the ticket is:
 * dashed rules, a 3px trim radius and a zero-padded index.
 *
 * Base UI's dialog carries the modal contract — focus trap, Escape, scroll
 * lock — and `finalFocus` hands focus back to the thumbnail of whichever photo
 * is on screen when it closes, not necessarily the one that opened it.
 */
export function Lightbox({
  images,
  index,
  onIndexChange,
  onClose,
  finalFocus,
}: {
  images: WpGalleryImage[];
  index: number | null;
  onIndexChange: (index: number) => void;
  onClose: () => void;
  finalFocus: RefObject<HTMLElement | null>;
}) {
  const [zoomed, setZoomed] = useState(false);
  const stage = useRef<HTMLDivElement>(null);
  const touchStart = useRef<{ x: number; y: number } | null>(null);

  /** Held across the closing transition, when `index` has already gone null. */
  const lastIndex = useRef(0);
  if (index !== null) lastIndex.current = index;

  useEffect(() => setZoomed(false), [index]);

  const total = images.length;
  const shown = index ?? lastIndex.current;
  const current = images[shown];
  const step = (delta: number) => onIndexChange((shown + delta + total) % total);

  const onKeyDown = (event: KeyboardEvent) => {
    const moves: Record<string, () => void> = {
      ArrowLeft: () => step(-1),
      ArrowRight: () => step(1),
      Home: () => onIndexChange(0),
      End: () => onIndexChange(total - 1),
    };

    const move = moves[event.key];
    if (!move || zoomed) return;

    event.preventDefault();
    move();
  };

  const toggleZoom = (event: MouseEvent) => {
    const el = stage.current;
    if (!el) return;

    if (zoomed) {
      setZoomed(false);
      el.scrollTo({ left: 0, top: 0 });
      return;
    }

    const box = el.getBoundingClientRect();
    const ratioX = (event.clientX - box.left) / box.width;
    const ratioY = (event.clientY - box.top) / box.height;

    setZoomed(true);
    requestAnimationFrame(() => {
      el.scrollTo({
        left: ratioX * box.width * ZOOM - box.width / 2,
        top: ratioY * box.height * ZOOM - box.height / 2,
      });
    });
  };

  return (
    <Dialog.Root
      open={index !== null}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-50 bg-navy-deep transition-opacity duration-200 ease-[var(--ease-out)] data-[ending-style]:opacity-0 data-[starting-style]:opacity-0" />

        <Dialog.Popup
          finalFocus={finalFocus}
          onKeyDown={onKeyDown}
          onTouchStart={(event) => {
            const touch = event.touches[0];
            touchStart.current = touch ? { x: touch.clientX, y: touch.clientY } : null;
          }}
          onTouchEnd={(event) => {
            const from = touchStart.current;
            const touch = event.changedTouches[0];
            touchStart.current = null;
            if (!from || !touch || zoomed) return;

            const dx = touch.clientX - from.x;
            if (Math.abs(dx) > SWIPE_THRESHOLD && Math.abs(dx) > Math.abs(touch.clientY - from.y)) {
              step(dx < 0 ? 1 : -1);
            }
          }}
          className="ink-inverted screened fixed inset-0 z-50 flex flex-col outline-none transition-opacity duration-200 ease-[var(--ease-out)] data-[ending-style]:opacity-0 data-[starting-style]:opacity-0"
        >
          <div className="flex items-center justify-between gap-4 px-4 py-3 sm:px-6">
            <Dialog.Title className="eyebrow tabular-nums text-ink-muted">
              {String(shown + 1).padStart(2, "0")}
              <span className="px-1.5 opacity-50">/</span>
              {String(total).padStart(2, "0")}
            </Dialog.Title>

            <Dialog.Close aria-label="Zamknij" className={CONTROL}>
              <XIcon className="size-5" aria-hidden="true" />
            </Dialog.Close>
          </div>

          <div
            ref={stage}
            onClick={toggleZoom}
            className={cn(
              "relative min-h-0 flex-1",
              zoomed ? "cursor-zoom-out overflow-auto" : "cursor-zoom-in overflow-hidden",
            )}
          >
            <div className={cn("relative", zoomed ? "h-[250%] w-[250%]" : "size-full")}>
              {current && (
                <GalleryImage
                  key={current.src}
                  src={current.src}
                  alt={current.alt}
                  fit="contain"
                  priority
                  sizes={zoomed ? "250vw" : "100vw"}
                  className="size-full bg-transparent"
                />
              )}
            </div>
          </div>

          <div className="flex items-center justify-center gap-3 px-4 py-4 sm:gap-5">
            <button
              type="button"
              aria-label="Poprzednie zdjęcie"
              onClick={() => step(-1)}
              disabled={total < 2}
              className={CONTROL}
            >
              <ChevronLeftIcon className="size-5" aria-hidden="true" />
            </button>

            <p className="eyebrow truncate text-center text-ink-muted">
              {zoomed ? "Kliknij, aby oddalić" : "Kliknij, aby przybliżyć"}
            </p>

            <button
              type="button"
              aria-label="Następne zdjęcie"
              onClick={() => step(1)}
              disabled={total < 2}
              className={CONTROL}
            >
              <ChevronRightIcon className="size-5" aria-hidden="true" />
            </button>
          </div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

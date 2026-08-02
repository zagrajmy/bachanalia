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
  "flex size-11 shrink-0 items-center justify-center text-ink transition-transform duration-150 ease-[var(--ease-out)] active:scale-[0.96] disabled:pointer-events-none disabled:opacity-35";

export function Lightbox({
  images,
  index,
  onIndexChange,
  onClose,
  finalFocus,
  morphName,
  thumbSizes,
}: {
  finalFocus: RefObject<HTMLElement | null>;
  images: WpGalleryImage[];
  index: number | null;
  morphName: string;
  onClose: () => void;
  onIndexChange: (index: number) => void;
  thumbSizes: string;
}) {
  const [zoomed, setZoomed] = useState(false);
  const [aspect, setAspect] = useState<number | null>(null);
  const stage = useRef<HTMLDivElement>(null);
  const touchStart = useRef<{ x: number; y: number } | null>(null);

  const lastIndex = useRef(0);
  if (index !== null) lastIndex.current = index;

  useEffect(() => {
    setZoomed(false);
    setAspect(null);
  }, [index]);

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
        <Dialog.Backdrop className="fixed inset-0 z-50 bg-paper/20 backdrop-blur-sm transition-opacity duration-200 ease-out data-ending-style:opacity-0 data-starting-style:opacity-0" />

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
          className="fixed inset-0 z-50 flex flex-col outline-none"
        >
          <div className="flex items-center justify-end px-4 py-3 sm:px-6">
            <Dialog.Title className="sr-only">
              Zdjęcie {shown + 1} z {total}
            </Dialog.Title>

            <Dialog.Close aria-label="Zamknij" className={CONTROL}>
              <XIcon className="size-5" aria-hidden="true" />
            </Dialog.Close>
          </div>

          <div
            ref={stage}
            onClick={onClose}
            className={cn(
              "relative min-h-0 flex-1",
              zoomed ? "overflow-auto" : "overflow-hidden",
            )}
          >
            <div
              className={cn(
                "flex items-center justify-center",
                zoomed ? "size-[250%]" : "size-full",
              )}
              style={{ containerType: "size" }}
            >
              {current && (
                <div
                  key={current.src}
                  onClick={(event) => {
                    event.stopPropagation();
                    toggleZoom(event);
                  }}
                  className={cn("relative", zoomed ? "cursor-zoom-out" : "cursor-zoom-in")}
                  style={
                    aspect
                      ? {
                          aspectRatio: `${aspect}`,
                          width: `min(100cqi, calc(${aspect} * 100cqh))`,
                          ...(zoomed ? undefined : { viewTransitionName: morphName }),
                        }
                      : { height: "100%", pointerEvents: "none", width: "100%" }
                  }
                >
                  <GalleryImage
                    src={current.src}
                    alt={current.alt}
                    fit="cover"
                    priority
                    reveal="instant"
                    sizes={thumbSizes}
                    blurDataURL={current.blurDataURL}
                    className="size-full bg-transparent"
                    onReady={(image) => setAspect(image.naturalWidth / image.naturalHeight)}
                  />
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center justify-center gap-3 p-4 sm:gap-5">
            <button
              type="button"
              aria-label="Poprzednie zdjęcie"
              onClick={() => step(-1)}
              disabled={total < 2}
              className={CONTROL}
            >
              <ChevronLeftIcon className="size-5" aria-hidden="true" />
            </button>

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

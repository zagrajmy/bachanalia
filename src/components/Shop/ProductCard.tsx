import Image from "next/image";
import Link from "next/link";

import { ShopProduct } from "./products";

/**
 * The image sits in a dashed plate because the covers and the ticket graphics
 * have different aspect ratios, and each keeps its own rather than being
 * cropped to a shared frame.
 *
 * Its height has to come from the `width`/`height` attributes, which the
 * browser turns into an aspect ratio through a UA rule. An author-level
 * `aspect-ratio` — including `aspect-auto` — outranks that rule, so the plate
 * would reserve nothing, the blur would paint into a zero-height box, and the
 * grid would jump as each picture decoded.
 */
export function ProductCard({ product }: { product: ShopProduct }) {
  const { href, image, name, price, soldOut } = product;

  return (
    <Link className="group block no-underline" href={href}>
      <div className="overflow-hidden rounded-card bg-paper-shade">
        {image ? (
          <Image
            alt=""
            blurDataURL={image.blurDataURL}
            className="h-auto w-full"
            height={image.height}
            placeholder={image.blurDataURL ? "blur" : "empty"}
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 30vw, 45vw"
            src={image.src}
            width={image.width}
          />
        ) : (
          <div className="aspect-4/5 w-full" />
        )}
      </div>

      <h3 className="display mt-4 text-[clamp(1.05rem,2.6vw,1.3rem)] text-ink transition-colors duration-200 group-hover:text-rose">
        {name}
      </h3>

      <p className="mt-1 flex flex-wrap items-baseline gap-x-3">
        {price && (
          <span
            className={`display text-lg tabular-nums ${soldOut ? "line-through opacity-60" : ""}`}
          >
            {price}
          </span>
        )}
        {soldOut && <span className="text-sm text-rose">Wyprzedane</span>}
      </p>
    </Link>
  );
}

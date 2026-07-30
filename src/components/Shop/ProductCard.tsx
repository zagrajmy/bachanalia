import Image from "next/image";
import Link from "next/link";

import { ShopProduct } from "./products";

/**
 * The image sits in a dashed plate because the covers and the ticket
 * graphics have different aspect ratios, and `object-contain` on a shared
 * frame keeps the grid on one baseline without cropping anyone's artwork.
 */
export function ProductCard({ product }: { product: ShopProduct }) {
  const { href, name, price, soldOut, image } = product;

  return (
    <Link href={href} className="group block no-underline">
      <div className="overflow-hidden rounded-card border border-dashed border-navy/25 bg-paper-shade">
        {image ? (
          <Image
            src={image.src}
            alt=""
            width={image.width}
            height={image.height}
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 30vw, 45vw"
            className="aspect-[4/5] w-full object-contain"
          />
        ) : (
          <div className="aspect-[4/5] w-full" />
        )}
      </div>

      <h3 className="display mt-4 text-[clamp(1.05rem,2.6vw,1.3rem)] text-ink transition-colors duration-200 group-hover:text-rose">
        {name}
      </h3>

      <p className="mt-1 flex flex-wrap items-baseline gap-x-3">
        <span
          className={`display text-lg tabular-nums ${soldOut ? "line-through opacity-60" : ""}`}
        >
          {price}
        </span>
        {soldOut && <span className="text-sm text-rose">Wyprzedane</span>}
      </p>
    </Link>
  );
}

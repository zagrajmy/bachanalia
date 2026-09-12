import Image, { type StaticImageData } from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

const SIZES = "(min-width: 1280px) 20vw, (min-width: 1024px) 27vw, (min-width: 640px) 45vw, 90vw";

/** One tile in the guests grid. Without `href` it is a plain, unlinked name. */
export function GuestCard({
  href,
  name,
  image,
  meta,
}: {
  href?: string;
  image?: {
    alt: string;
    blurDataURL?: string;
    focus?: string;
    height?: number;
    src: StaticImageData | string;
    width?: number;
  };
  meta?: ReactNode;
  name: string;
}) {
  const body = (
    <>
      <div className="overflow-hidden rounded-card bg-paper-shade">
        {image ? (
          <Image
            src={image.src}
            alt={image.alt}
            width={typeof image.src === "string" ? (image.width ?? 800) : undefined}
            height={typeof image.src === "string" ? (image.height ?? 600) : undefined}
            sizes={SIZES}
            placeholder={typeof image.src === "string" && !image.blurDataURL ? "empty" : "blur"}
            blurDataURL={image.blurDataURL}
            className="aspect-3/4 w-full object-cover"
            style={image.focus ? { objectPosition: image.focus } : undefined}
          />
        ) : (
          <div className="aspect-3/4 w-full" />
        )}
      </div>
      <h2
        className={`display mt-4 text-xl text-ink ${href ? "transition-colors duration-200 group-hover:text-rose" : ""}`}
      >
        {name}
      </h2>
      {meta}
    </>
  );

  return (
    <li>
      {href ? (
        <Link href={href} className="group block no-underline">
          {body}
        </Link>
      ) : (
        body
      )}
    </li>
  );
}

export function GuestsGrid({ children }: { children: ReactNode }) {
  return <ul className="mt-12 grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">{children}</ul>;
}

/** Guests we have no photo of yet: names only, linked when a bio exists. */
export function GuestNames({ guests }: { guests: { href?: string; name: string }[] }) {
  return (
    <ul className="mt-14 columns-2 gap-x-6 border-t-2 border-edge pt-8 text-lg/relaxed sm:columns-3 lg:columns-4">
      {guests.map(({ href, name }) => (
        <li key={name} className="break-inside-avoid">
          {href ? (
            <Link
              href={href}
              className="text-ink no-underline transition-colors duration-200 hover:text-rose"
            >
              {name}
            </Link>
          ) : (
            name
          )}
        </li>
      ))}
    </ul>
  );
}

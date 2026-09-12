import Image, { type ImageProps } from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { type Guest, guestPath } from "@/content/guests";

const SIZES = "(min-width: 1280px) 20vw, (min-width: 1024px) 27vw, (min-width: 640px) 45vw, 90vw";

/** One tile in the guests grid. Without `href` it is a plain, unlinked name. */
export function GuestCard({
  href,
  name,
  image,
  meta,
}: {
  href?: string;
  /** Passed straight to `next/image`; the caller knows whether it is static or remote. */
  image?: ImageProps;
  meta?: ReactNode;
  name: string;
}) {
  const body = (
    <>
      <div className="overflow-hidden rounded-card bg-paper-shade">
        {image ? (
          <Image sizes={SIZES} className="aspect-3/4 w-full object-cover" {...image} />
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
export function GuestNames({ guests }: { guests: Guest[] }) {
  return (
    <ul className="mt-14 columns-2 gap-x-6 border-t-2 border-edge pt-8 text-lg/relaxed sm:columns-3 lg:columns-4">
      {guests.map((guest) => {
        const href = guestPath(guest);

        return (
          <li key={guest.slug} className="break-inside-avoid">
            {href ? (
              <Link
                href={href}
                className="text-ink no-underline transition-colors duration-200 hover:text-rose"
              >
                {guest.name}
              </Link>
            ) : (
              guest.name
            )}
          </li>
        );
      })}
    </ul>
  );
}

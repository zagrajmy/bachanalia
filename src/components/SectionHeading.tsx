import type { ReactNode } from "react";

/**
 * The rule under a title, with whatever sits on its right.
 *
 * Five pages had this pasted in, already drifting: two spellings of the same
 * optical nudge, and two gap values that only differ when the aside wraps.
 */
const SIZES = {
  page: "text-[clamp(2.1rem,6.4vw,4rem)]",
  section: "text-[clamp(1.7rem,4.6vw,2.7rem)]",
};

export function SectionHeading({
  as: Tag = "h2",
  size = "section",
  id,
  aside,
  children,
}: {
  as?: "h1" | "h2";
  size?: keyof typeof SIZES;
  id?: string;
  /** A note or a link, set against the title on the same baseline. */
  aside?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-3 border-b-2 border-navy pb-3">
      <Tag className={`display -ml-[0.04em] ${SIZES[size]}`} id={id}>
        {children}
      </Tag>
      {aside}
    </div>
  );
}

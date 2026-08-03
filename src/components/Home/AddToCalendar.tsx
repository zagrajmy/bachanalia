"use client";

import { Calendar01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Popover } from "@base-ui/react/popover";

import { con } from "@/content/con";

const ICS = "/kalendarz.ics";

const compact = (iso: string) => iso.replaceAll("-", "");

/**
 * Google wants the day *after* the last one, the same exclusive end the `.ics`
 * uses. Built here rather than in `con` because it is one vendor's URL shape,
 * not a fact about the convention.
 */
const GOOGLE = (() => {
  const end = new Date(`${con.ends}T00:00:00Z`);
  end.setUTCDate(end.getUTCDate() + 1);

  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: `${con.name} ${con.edition}`,
    dates: `${compact(con.starts)}/${compact(end.toISOString().slice(0, 10))}`,
    location: `${con.venue}, ${con.address}`,
    details: "https://bachanaliafantastyczne.pl/",
  });

  return `https://calendar.google.com/calendar/render?${params}`;
})();

const item =
  "flex items-center justify-between gap-6 px-4 py-3 text-sm no-underline transition-colors duration-150 hover:bg-paper-shade focus-visible:bg-paper-shade focus-visible:outline-none";

/**
 * The date is the fact; this is the one thing a visitor can do with it. Two
 * destinations rather than the usual five — a `.ics` is what Apple, Outlook
 * and everything else actually consume, so listing them separately would be
 * five buttons pointing at two files.
 */
export function AddToCalendar() {
  return (
    <Popover.Root>
      <Popover.Trigger
        openOnHover
        className="inline-flex cursor-pointer items-center gap-1.5 text-sm text-accent underline decoration-2 decoration-accent/50 underline-offset-[0.2em] transition-colors duration-150 hover:decoration-ink hover:text-ink decoration-dashed hover:duration-0"
      >
        <HugeiconsIcon
          icon={Calendar01Icon}
          strokeWidth={2}
          className="size-4"
          aria-hidden="true"
        />
        Dodaj do kalendarza
      </Popover.Trigger>

      <Popover.Portal>
        <Popover.Positioner side="bottom" align="start" sideOffset={10}>
          <Popover.Popup className="w-64 origin-(--transform-origin) overflow-hidden border-2 border-navy bg-paper text-navy shadow-[0_18px_44px_-18px] shadow-navy/50 motion-safe:transition motion-safe:duration-150 motion-safe:data-ending-style:scale-95 motion-safe:data-ending-style:opacity-0 motion-safe:data-starting-style:scale-95 motion-safe:data-starting-style:opacity-0">
            <a className={item} href={GOOGLE} rel="noreferrer" target="_blank">
              Google Calendar
              <span className="text-xs text-ink-muted">nowa karta</span>
            </a>

            <a
              className={`${item} border-t border-dashed border-hairline`}
              download
              href={ICS}
            >
              Apple, Outlook…
              <span className="text-xs text-ink-muted">.ics</span>
            </a>
          </Popover.Popup>
        </Popover.Positioner>
      </Popover.Portal>
    </Popover.Root>
  );
}

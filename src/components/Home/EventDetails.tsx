import Link from "next/link";

import { AddToCalendar } from "@/components/Home/AddToCalendar";
import { con } from "@/content/con";
import { cn } from "@/lib/utils";

export function EventDetails({ className }: { className?: string }) {
  return (
    <dl
      className={cn(
        "grid max-w-136 gap-x-7 text-sm sm:grid-cols-[auto_1fr] sm:gap-y-3 sm:text-base",
        className,
      )}
    >
      <dt className="pt-0.75 text-sm text-accent max-sm:mb-1">Termin</dt>
      <dd className="flex flex-col items-start sm:flex-row sm:flex-wrap sm:items-center sm:gap-1 sm:gap-x-5">
        {con.dates}
        <AddToCalendar />
      </dd>
      <dt className="pt-0.75 text-sm text-accent max-sm:mt-4 max-sm:mb-1">Miejsce</dt>
      <dd>
        {con.venue},<br />
        <Link
          className="decoration-dashed underline decoration-2 decoration-accent/50 underline-offset-[0.2em] transition-colors duration-150 hover:text-ink hover:decoration-ink hover:duration-0"
          href="/czas-i-miejsce/"
        >
          {con.address}
        </Link>
      </dd>
    </dl>
  );
}

import Link from "next/link";
import { GUESTS_YEAR } from "@/content/guests";

const EDITIONS = [
  { year: GUESTS_YEAR, href: "/goscie/" },
  { year: 2025, href: "/goscie/2025/" },
];

export function EditionSwitch({ current }: { current: number }) {
  return (
    <p className="flex gap-4 text-sm text-ink-muted">
      {EDITIONS.map(({ year, href }) =>
        year === current ? (
          <span key={year} className="text-ink" aria-current="page">
            {year}
          </span>
        ) : (
          <Link key={year} href={href}>
            {year}
          </Link>
        ),
      )}
    </p>
  );
}

import Link from "next/link";

import { con } from "@/content/con";

import { PartnersCard } from "./PartnersCard";
import { footerNav } from "./siteNav";

const seria = `${con.edition} / ${con.datesShort}`;

export function SiteFooter() {
  return (
    <footer className="ink-inverted gutter relative mt-20 bg-navy pt-14 pb-12 sm:mt-28 sm:pt-16">
      <span aria-hidden="true" className="punched absolute inset-x-0 top-0 h-[8px]" />

      <div className="mx-auto max-w-6xl">
        <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
          <p className="display text-2xl tracking-[0.06em]">Rewers</p>
          <p className="eyebrow text-accent">Seria {seria}</p>
        </div>

        <div className="mt-10 grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {footerNav.map(({ title, links }) => (
            <nav key={title} aria-label={title}>
              <h2 className="eyebrow text-ink-muted">{title}</h2>
              <ul className="mt-4 flex flex-col gap-2.5">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      {...("external" in link && link.external
                        ? { target: "_blank", rel: "noreferrer" }
                        : {})}
                      className="text-[0.9375rem] text-ink-muted no-underline transition-colors duration-200 hover:text-ink"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <PartnersCard />

        <div className="mt-10 flex flex-col gap-3 border-t border-dashed border-hairline pt-6 text-sm text-ink-muted sm:flex-row sm:items-baseline sm:justify-between">
          <p>
            Organizator:{" "}
            <Link href="/organizator/" className="text-ink no-underline hover:text-accent">
              {con.organiser}
            </Link>
          </p>
          <p>
            <Link href="/polityka-prywatnosci/" className="no-underline hover:text-ink">
              Polityka prywatności
            </Link>
          </p>
        </div>
      </div>
    </footer>
  );
}

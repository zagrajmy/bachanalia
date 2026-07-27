import Link from "next/link";

import { footerNav } from "./siteNav";

export function SiteFooter() {
  return (
    <footer className="border-t border-hairline bg-navy-800">
      <div className="mx-auto max-w-[1400px] px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {footerNav.map(({ title, links }) => (
            <nav key={title} aria-label={title}>
              <h2 className="display text-[0.8125rem] tracking-[0.14em] text-ink uppercase">
                {title}
              </h2>
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

        <div className="mt-14 flex flex-col gap-3 border-t border-hairline pt-8 text-sm text-ink-muted sm:flex-row sm:items-baseline sm:justify-between">
          <p>
            Organizator:{" "}
            <Link href="/organizator/" className="text-link no-underline hover:text-ink">
              Zielonogórski Klub Fantastyki Ad Astra
            </Link>
          </p>
          <p>
            <Link href="/polityka-prywatnosci/" className="text-link no-underline hover:text-ink">
              Polityka prywatności
            </Link>
          </p>
        </div>
      </div>
    </footer>
  );
}

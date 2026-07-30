import Link from "next/link";

import { con } from "@/content/con";

import { primaryCta, primaryNav } from "./siteNav";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-hairline bg-paper/90 backdrop-blur-md">
      <div className="gutter mx-auto flex h-16 max-w-6xl items-center gap-6 sm:h-18">
        <Link
          href="/"
          aria-label={`${con.name} ${con.edition}, strona główna`}
          className="group flex shrink-0 items-baseline gap-2.5 no-underline"
        >
          <span className="display text-3xl text-accent transition-colors duration-200 group-hover:text-navy">
            {con.edition}
          </span>
          <span className="display text-[0.8125rem] leading-none tracking-[0.02em] text-ink uppercase sm:text-[0.9375rem]">
            Bachanalia
            <br />
            Fantastyczne
          </span>
        </Link>

        <nav aria-label="Główna nawigacja" className="ml-auto hidden lg:block">
          <ul className="flex items-center gap-6">
            {primaryNav.map(({ href, label }) => (
              <li key={href}>
                <Link
                  href={href}
                  className="text-sm text-ink-muted no-underline transition-colors duration-200 hover:text-ink"
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <Link
          href={primaryCta.href}
          className="ml-auto hidden shrink-0 rounded-full bg-accent px-5 py-2 text-xs font-semibold tracking-[0.12em] whitespace-nowrap text-on-accent uppercase no-underline transition-[transform,background-color] duration-150 ease-[var(--ease-out)] hover:bg-pink active:scale-[0.97] lg:ml-0 lg:block"
        >
          {primaryCta.label}
        </Link>

        <details className="relative ml-auto lg:hidden">
          <summary className="flex cursor-pointer list-none items-center rounded-full border border-hairline px-4 py-1.5 text-xs font-semibold tracking-[0.12em] uppercase transition-transform duration-150 ease-[var(--ease-out)] active:scale-[0.97]">
            Menu
          </summary>
          <div className="absolute end-0 top-[calc(100%+0.75rem)] w-64 rounded-card border border-hairline bg-paper p-2 shadow-[0_18px_50px_-18px] shadow-navy/40">
            <ul>
              {primaryNav.map(({ href, label }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="block rounded-sm px-3 py-2.5 text-[0.9375rem] text-ink-muted no-underline transition-colors duration-200 hover:bg-paper-shade hover:text-ink"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
            <Link
              href={primaryCta.href}
              className="mt-2 block rounded-full bg-accent px-4 py-2.5 text-center text-xs font-semibold tracking-[0.12em] text-on-accent uppercase no-underline transition-transform duration-150 ease-[var(--ease-out)] active:scale-[0.97]"
            >
              {primaryCta.label}
            </Link>
          </div>
        </details>
      </div>
    </header>
  );
}

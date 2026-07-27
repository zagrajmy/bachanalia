import Link from "next/link";

import { primaryCta, primaryNav } from "./siteNav";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-hairline bg-navy-700/85 backdrop-blur-md">
      <div className="mx-auto flex h-18 max-w-[1400px] items-center gap-8 px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          aria-label="Bachanalia Fantastyczne XL, strona główna"
          className="group flex shrink-0 items-center gap-2.5 no-underline"
        >
          <span className="display text-2xl text-accent transition-colors duration-200 group-hover:text-pink-300">
            XL
          </span>
          <span className="display hidden text-[0.8125rem] leading-[1.15] text-ink uppercase sm:block">
            Bachanalia
            <br />
            Fantastyczne
          </span>
        </Link>

        <nav aria-label="Główna nawigacja" className="ml-auto hidden lg:block">
          <ul className="flex items-center gap-7">
            {primaryNav.map(({ href, label }) => (
              <li key={href}>
                <Link
                  href={href}
                  className="text-[0.9375rem] text-ink-muted no-underline transition-colors duration-200 hover:text-ink"
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <Link
          href={primaryCta.href}
          className="ml-auto hidden shrink-0 rounded-full bg-accent px-5 py-2.5 text-[0.9375rem] font-semibold whitespace-nowrap text-on-accent no-underline transition-[transform,background-color] duration-150 ease-[var(--ease-out)] hover:bg-pink-300 active:scale-[0.97] lg:ml-0 lg:block"
        >
          {primaryCta.label}
        </Link>

        <details className="relative ml-auto lg:hidden">
          <summary className="flex cursor-pointer list-none items-center rounded-full border border-hairline px-4 py-2 text-[0.9375rem] transition-transform duration-150 ease-[var(--ease-out)] active:scale-[0.97]">
            Menu
          </summary>
          <div className="absolute end-0 top-[calc(100%+0.75rem)] w-64 rounded-card bg-navy-800 p-2 shadow-[0_18px_50px_-12px] shadow-navy-900">
            <ul>
              {primaryNav.map(({ href, label }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="block rounded-lg px-3 py-2.5 text-[0.9375rem] text-ink-muted no-underline transition-colors duration-200 hover:bg-navy-700 hover:text-ink"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
            <Link
              href={primaryCta.href}
              className="mt-2 block rounded-full bg-accent px-4 py-2.5 text-center text-[0.9375rem] font-semibold text-on-accent no-underline transition-transform duration-150 ease-[var(--ease-out)] active:scale-[0.97]"
            >
              {primaryCta.label}
            </Link>
          </div>
        </details>
      </div>
    </header>
  );
}

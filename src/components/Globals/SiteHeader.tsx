import Link from "next/link";

import { con } from "@/content/con";

import { NavLink, primaryCta, primaryNav } from "./siteNav";

const externalProps = ({ external }: NavLink) =>
  external ? { target: "_blank" as const, rel: "noreferrer" } : {};

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-hairline bg-paper">
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
          <ul className="flex items-center gap-5">
            {primaryNav.map((group) => (
              <li key={group.label} className="group relative">
                <Link
                  href={group.href}
                  {...externalProps(group)}
                  className="block py-2 text-sm whitespace-nowrap text-ink-muted no-underline transition-colors duration-200 group-hover:text-ink group-focus-within:text-ink"
                >
                  {group.label}
                </Link>

                {group.children && (
                  <div className="invisible absolute start-0 top-full pt-2 opacity-0 transition-opacity duration-150 group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
                    <ul className="min-w-56 rounded-card border border-hairline bg-paper py-2 shadow-[0_18px_50px_-24px] shadow-navy/50">
                      {group.children.map((link) => (
                        <li key={link.href}>
                          <Link
                            href={link.href}
                            {...externalProps(link)}
                            className="block px-4 py-2 text-sm whitespace-nowrap text-ink-muted no-underline transition-colors duration-150 hover:bg-paper-shade hover:text-ink"
                          >
                            {link.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
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
          <div className="absolute end-0 top-[calc(100%+0.75rem)] max-h-[70vh] w-72 overflow-y-auto rounded-card border border-hairline bg-paper p-2 shadow-[0_18px_50px_-18px] shadow-navy/40">
            <ul>
              {primaryNav.map((group) => (
                <li key={group.label} className="not-first:mt-1">
                  <Link
                    href={group.href}
                    {...externalProps(group)}
                    className="block rounded-sm px-3 py-2 text-[0.9375rem] text-ink no-underline transition-colors duration-200 hover:bg-paper-shade"
                  >
                    {group.label}
                  </Link>

                  {group.children && (
                    <ul className="mb-2 ms-3 border-l border-dashed border-hairline ps-3">
                      {group.children.map((link) => (
                        <li key={link.href}>
                          <Link
                            href={link.href}
                            {...externalProps(link)}
                            className="block rounded-sm px-2 py-1.5 text-sm text-ink-muted no-underline transition-colors duration-200 hover:bg-paper-shade hover:text-ink"
                          >
                            {link.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
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

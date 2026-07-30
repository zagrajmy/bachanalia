"use client";

import { useState } from "react";
import Link from "next/link";
import { MenuIcon } from "lucide-react";

import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { Button } from "@/components/ui/warcraftcn/button";
import { con } from "@/content/con";

import { NavLink, primaryCta, primaryNav } from "./siteNav";

const externalProps = ({ external }: NavLink) =>
  external ? { target: "_blank" as const, rel: "noreferrer" } : {};

export function SiteHeader() {
  /**
   * Radix opens a trigger on pointer move, never on focus. The parents here
   * are real links, so a keyboard user lands on one without any intent to
   * press it — focus has to open the panel or the children are mouse-only.
   */
  const [openGroup, setOpenGroup] = useState("");

  return (
    <header className="sticky top-0 z-40 border-b border-hairline bg-paper">
      <div className="gutter mx-auto flex h-16 max-w-6xl items-center gap-4 sm:h-18 xl:gap-6 min-[72rem]:px-0">
        <Link
          href="/"
          aria-label={`${con.name} ${con.edition}, strona główna`}
          className="shrink-0 no-underline"
        >
          <span className="display text-[0.9375rem] leading-none tracking-[0.02em] whitespace-nowrap text-ink uppercase sm:text-[1.0625rem]">
            Bachanalia Fantastyczne
          </span>
        </Link>

        {/**
         * Each panel lives inside its own item, which is the positioned
         * ancestor. Radix's shared viewport renders in a wrapper pinned to the
         * nav's left edge and exposes no offset of the open trigger, so it
         * cannot follow the group it belongs to.
         */}
        <NavigationMenu
          aria-label="Główna nawigacja"
          value={openGroup}
          onValueChange={setOpenGroup}
          onBlur={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget)) setOpenGroup("");
          }}
          viewport={false}
          className="ml-auto hidden lg:block"
        >
          <NavigationMenuList className="gap-0">
            {primaryNav.map((group) => (
              <NavigationMenuItem key={group.label} value={group.label}>
                {group.children ? (
                  <>
                    <NavigationMenuTrigger asChild onFocus={() => setOpenGroup(group.label)}>
                      <Link href={group.href} {...externalProps(group)}>
                        {group.label}
                      </Link>
                    </NavigationMenuTrigger>

                    <NavigationMenuContent>
                      <ul className="grid w-[15rem] gap-1">
                        {group.children.map((link) => (
                          <li key={link.href}>
                            <NavigationMenuLink asChild>
                              <Link href={link.href} {...externalProps(link)}>
                                {link.label}
                              </Link>
                            </NavigationMenuLink>
                          </li>
                        ))}
                      </ul>
                    </NavigationMenuContent>
                  </>
                ) : (
                  <NavigationMenuLink asChild className={navigationMenuTriggerStyle()}>
                    <Link href={group.href} {...externalProps(group)}>
                      {group.label}
                    </Link>
                  </NavigationMenuLink>
                )}
              </NavigationMenuItem>
            ))}
          </NavigationMenuList>
        </NavigationMenu>

        <Button asChild variant="frame" className="ml-auto hidden lg:ml-0 lg:inline-flex">
          <Link href={primaryCta.href} target="_blank" rel="noreferrer">
            {primaryCta.label}
          </Link>
        </Button>

        <details className="relative ml-auto lg:hidden">
          <summary
            aria-label="Menu"
            className="flex size-10 cursor-pointer list-none items-center justify-center rounded-full border border-hairline text-ink transition-transform duration-150 ease-[var(--ease-out)] active:scale-[0.97]"
          >
            <MenuIcon className="size-5" aria-hidden="true" />
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
                            className="block rounded-sm px-2 py-1.5 text-sm text-ink no-underline transition-colors duration-200 hover:bg-paper-shade"
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
              target="_blank"
              rel="noreferrer"
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

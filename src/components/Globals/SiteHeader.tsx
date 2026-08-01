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
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/warcraftcn/button";
import { con } from "@/content/con";

import { NavLink, primaryCta, primaryNav } from "./siteNav";

const externalProps = ({ external }: NavLink) =>
  external ? { target: "_blank" as const, rel: "noreferrer" } : {};

export function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const closeMenu = () => setMenuOpen(false);

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

        <NavigationMenu aria-label="Główna nawigacja" className="ml-auto hidden lg:block">
          <NavigationMenuList>
            {primaryNav.map((group) => (
              <NavigationMenuItem key={group.label} value={group.label}>
                {group.children ? (
                  <>
                    <NavigationMenuTrigger
                      nativeButton={false}
                      /**
                       * Base UI's useButton stamps role="button" on anything
                       * that is not a native button, links included, which
                       * hides the destination from assistive tech. The group
                       * heading is a real page, so it stays a link.
                       */
                      role="link"
                      render={<Link href={group.href} {...externalProps(group)} />}
                    >
                      {group.label}
                    </NavigationMenuTrigger>

                    <NavigationMenuContent>
                      <ul className="grid w-[15rem] gap-1">
                        {group.children.map((link) => (
                          <li key={link.href}>
                            <NavigationMenuLink
                              render={<Link href={link.href} {...externalProps(link)} />}
                            >
                              {link.label}
                            </NavigationMenuLink>
                          </li>
                        ))}
                      </ul>
                    </NavigationMenuContent>
                  </>
                ) : (
                  <NavigationMenuLink
                    className={navigationMenuTriggerStyle()}
                    render={<Link href={group.href} {...externalProps(group)} />}
                  >
                    {group.label}
                  </NavigationMenuLink>
                )}
              </NavigationMenuItem>
            ))}
          </NavigationMenuList>
        </NavigationMenu>

        <Button asChild className="ml-auto hidden lg:ml-0 lg:inline-flex">
          <Link href={primaryCta.href} target="_blank" rel="noreferrer">
            {primaryCta.label}
          </Link>
        </Button>

        <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
          <SheetTrigger
            aria-label="Menu"
            className="ml-auto flex size-10 shrink-0 items-center justify-center rounded-full active:border hover:border border-hairline text-ink transition-transform duration-150 ease-out active:scale-[0.97] lg:hidden"
          >
            <MenuIcon className="size-5" aria-hidden="true" />
          </SheetTrigger>

          <SheetContent side="right" className="data-[side=right]:w-[min(21rem,88vw)]">
            <SheetHeader className="h-16 flex-row items-center border-b border-dashed border-hairline py-0 sm:h-18">
              <SheetTitle className="sr-only">Menu</SheetTitle>
            </SheetHeader>

            <nav
              aria-label="Główna nawigacja"
              className="scrollview-fade scrollview-fade-y-6 min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-3"
            >
              <ul>
                {primaryNav.map((group) => (
                  <li
                    key={group.label}
                    className="not-first:mt-2 not-first:border-t not-first:border-dashed not-first:border-hairline not-first:pt-2"
                  >
                    <Link
                      href={group.href}
                      {...externalProps(group)}
                      onClick={closeMenu}
                      className="block rounded-card px-2 py-2 text-[0.9375rem] font-semibold text-ink no-underline transition-colors duration-150 hover:bg-paper-shade"
                    >
                      {group.label}
                    </Link>

                    {group.children && (
                      <ul className="ms-2 border-l border-dotted border-hairline ps-3">
                        {group.children.map((link) => (
                          <li key={link.href}>
                            <Link
                              href={link.href}
                              {...externalProps(link)}
                              onClick={closeMenu}
                              className="block rounded-card px-2 py-1.5 text-sm text-ink-muted no-underline transition-colors duration-150 hover:bg-paper-shade hover:text-ink"
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
            </nav>

            <SheetFooter>
              <Button asChild className="w-full">
                <Link href={primaryCta.href} target="_blank" rel="noreferrer" onClick={closeMenu}>
                  {primaryCta.label}
                </Link>
              </Button>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}

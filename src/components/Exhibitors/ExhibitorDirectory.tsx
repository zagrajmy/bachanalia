"use client";

import { useDeferredValue, useMemo, useState } from "react";
import Image from "next/image";
import ArrowUpDownIcon from "@hugeicons/core-free-icons/ArrowUpDownIcon";
import Search01Icon from "@hugeicons/core-free-icons/Search01Icon";
import Store01Icon from "@hugeicons/core-free-icons/Store01Icon";
import { HugeiconsIcon } from "@hugeicons/react";

import type { Exhibitor } from "@/content/exhibitors";

type SortOrder = "az" | "za";

const collator = new Intl.Collator("pl", { sensitivity: "base" });

function Awning() {
  return (
    <span aria-hidden="true" className="flex h-5 overflow-hidden border-b border-navy">
      {Array.from({ length: 10 }, (_, index) => (
        <span
          className={`relative flex-1 border-r border-navy last:border-r-0 ${
            index % 2 === 0 ? "bg-coral" : "bg-paper"
          } after:absolute after:top-full after:left-1/2 after:size-2 after:-translate-1/2 after:rounded-full after:border after:border-navy after:bg-inherit`}
          key={index}
        />
      ))}
    </span>
  );
}

function ExhibitorCard({ exhibitor }: { exhibitor: Exhibitor }) {
  return (
    <article className="flex h-full flex-col overflow-hidden rounded-card border border-navy bg-paper transition-[transform,box-shadow] duration-200 hover:-translate-y-1 hover:shadow-[3px_5px_0_var(--color-coral)]">
      <Awning />
      <div className="flex-1 p-5">
        <h3 className="display text-[1.9rem] break-words text-ink">{exhibitor.name}</h3>
        {exhibitor.description && (
          <p className="mt-3 text-sm/relaxed text-ink-muted">{exhibitor.description}</p>
        )}
      </div>
      <div className="flex items-center justify-between gap-4 border-t border-dashed border-navy/40 px-5 py-3.5">
        {exhibitor.logoUrl ? (
          <span className="flex h-9 max-w-[45%] items-center">
            <Image
              alt=""
              className="max-h-9 w-auto max-w-full object-contain"
              height={320}
              sizes="160px"
              src={exhibitor.logoUrl}
              width={640}
            />
          </span>
        ) : (
          <span className="flex h-9 items-center text-navy/55">
            <HugeiconsIcon
              aria-hidden="true"
              className="size-6"
              icon={Store01Icon}
              strokeWidth={1.6}
            />
          </span>
        )}
        {exhibitor.links.length > 0 && (
          <ul className="flex flex-wrap justify-end gap-x-4 gap-y-2">
            {exhibitor.links.map((link) => (
              <li key={link.href}>
                <a
                  className="text-sm font-semibold text-ink underline decoration-coral decoration-2 underline-offset-4 transition-colors hover:text-rose"
                  href={link.href}
                  rel="noreferrer"
                  target="_blank"
                >
                  {link.label}
                  <span className="sr-only"> — otwiera się w nowej karcie</span>
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>
    </article>
  );
}

export function ExhibitorDirectory({ exhibitors }: { exhibitors: Exhibitor[] }) {
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortOrder>("az");
  const deferredQuery = useDeferredValue(query.trim().toLocaleLowerCase("pl"));

  const results = useMemo(() => {
    const filtered = exhibitors.filter((item) => {
      const haystack = `${item.name} ${item.description ?? ""}`.toLocaleLowerCase("pl");
      return haystack.includes(deferredQuery);
    });

    return filtered.sort((a, b) =>
      sort === "az" ? collator.compare(a.name, b.name) : collator.compare(b.name, a.name),
    );
  }, [deferredQuery, exhibitors, sort]);

  const hasFilters = query.length > 0;

  return (
    <div className="mt-7">
      <div className="grid gap-4 bg-paper-shade p-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end sm:p-5">
        <label className="block">
          <span className="mb-2 block text-sm font-semibold text-ink">Wyszukaj</span>
          <span className="relative block">
            <HugeiconsIcon
              aria-hidden="true"
              className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-ink-muted"
              icon={Search01Icon}
              strokeWidth={2}
            />
            <input
              className="h-12 w-full rounded-card border border-navy/35 bg-paper pr-4 pl-12 text-base text-ink outline-none placeholder:text-slate focus:border-navy"
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Nazwa, produkt…"
              type="search"
              value={query}
            />
          </span>
        </label>

        <div>
          <span className="mb-2 block text-sm font-semibold text-ink">Sortowanie</span>
          <button
            aria-label={sort === "az" ? "Zmień kolejność na Z–A" : "Zmień kolejność na A–Z"}
            className="flex h-12 min-w-28 items-center justify-center gap-3 rounded-card border border-navy bg-paper px-4 font-semibold text-ink transition-colors hover:bg-navy hover:text-paper"
            onClick={() => setSort((current) => (current === "az" ? "za" : "az"))}
            type="button"
          >
            <span>{sort === "az" ? "A–Z" : "Z–A"}</span>
            <HugeiconsIcon
              aria-hidden="true"
              className="size-5"
              icon={ArrowUpDownIcon}
              strokeWidth={2}
            />
          </button>
        </div>
      </div>

      <p aria-live="polite" className="mt-4 text-sm text-ink-muted">
        {results.length === 1 ? "1 wystawca" : `${results.length} wystawców`}
      </p>

      {results.length > 0 ? (
        <ul className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {results.map((exhibitor) => (
            <li key={exhibitor.name}>
              <ExhibitorCard exhibitor={exhibitor} />
            </li>
          ))}
        </ul>
      ) : hasFilters ? (
        <div className="mt-5 border-y border-dashed border-navy/30 py-12 text-center">
          <p className="display text-2xl">Nic tu nie znaleźliśmy</p>
          <p className="mt-2 text-ink-muted">Spróbuj innej nazwy lub kategorii.</p>
          <button
            className="mt-5 text-sm font-semibold text-ink underline decoration-coral decoration-2 underline-offset-4 hover:text-rose"
            onClick={() => setQuery("")}
            type="button"
          >
            Wyczyść filtry
          </button>
        </div>
      ) : (
        <div className="mt-5 overflow-hidden rounded-card border border-navy bg-paper">
          <Awning />
          <div className="flex flex-col items-center px-6 py-12 text-center sm:py-16">
            <span className="flex size-14 items-center justify-center rounded-full bg-coral text-navy">
              <HugeiconsIcon
                aria-hidden="true"
                className="size-7"
                icon={Store01Icon}
                strokeWidth={2}
              />
            </span>
            <p className="display mt-5 text-[clamp(1.55rem,4vw,2.25rem)]">
              Stoisko czeka na pierwszych wystawców
            </p>
            <p className="mt-3 max-w-[48ch] text-ink-muted">
              Lista wystawców XL edycji jest w przygotowaniu. Ogłoszone stoiska pojawią się tutaj
              wraz z kategoriami i wyszukiwarką.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

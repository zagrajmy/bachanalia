"use client";

import { useDeferredValue, useMemo, useState } from "react";
import Image from "next/image";
import ArrowUpDownIcon from "@hugeicons/core-free-icons/ArrowUpDownIcon";
import Store01Icon from "@hugeicons/core-free-icons/Store01Icon";
import { HugeiconsIcon } from "@hugeicons/react";

import type { Exhibitor } from "@/content/exhibitors";
import { counted } from "@/utils/plural";

type SortOrder = "az" | "za";

const collator = new Intl.Collator("pl", { sensitivity: "base" });

function Awning() {
  return (
    <span aria-hidden="true" className="flex h-1 overflow-hidden border-b border-edge">
      {Array.from({ length: 10 }, (_, index) => (
        <span className={`flex-1 ${index % 2 === 0 ? "bg-coral/50" : "bg-surface"}`} key={index} />
      ))}
    </span>
  );
}

function ExhibitorCard({ exhibitor }: { exhibitor: Exhibitor }) {
  return (
    <article className="flex h-full flex-col overflow-hidden rounded-card border border-edge bg-surface">
      <Awning />
      <div className="flex flex-1 flex-col sm:flex-row sm:items-stretch">
        <div className="flex flex-1 flex-col p-5">
          <h3 className="display wrap-break-word text-[1.6rem] text-ink">{exhibitor.name}</h3>
          {exhibitor.description && (
            <p className="mt-2.5 text-sm/relaxed text-ink-muted">{exhibitor.description}</p>
          )}
        </div>
        {(exhibitor.logoUrl || exhibitor.links.length > 0) && (
          <div className="perforated-top flex flex-col p-px pl-0.5 sm:basis-[25%] sm:shrink-0 sm:perforated-start">
            {exhibitor.links.length > 0 && (
              <ul className="p-3.5 sm:p-5 sm:pt-3.5 flex sm:flex-col gap-x-3 items-end gap-0.5 text-end last:mb-0">
                {exhibitor.links.map((link) => (
                  <li key={link.href}>
                    <a
                      className="marked-link text-sm"
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
            {exhibitor.logoUrl && (
              <span
                className={`block sm:mt-auto relative after:absolute after:inset-0 sm:after:-top-0.5 sm:after:perforated-top ${exhibitor.logoNeedsPlate ? "bg-paper p-1.5" : ""}`}
              >
                <Image
                  alt=""
                  className="h-auto w-full object-contain"
                  height={320}
                  sizes="(min-width: 640px) 200px, 82vw"
                  src={exhibitor.logoUrl}
                  width={640}
                />
              </span>
            )}
          </div>
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
      <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
        <label className="block">
          <span className="sr-only">Wyszukaj</span>
          <input
            className="h-11 w-full rounded-none border-b-2 border-hairline bg-transparent px-0.5 text-base text-ink transition-colors placeholder:text-ink-muted focus-visible:border-transparent focus-visible:duration-0 indent-2"
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Szukaj wystawcy…"
            type="search"
            value={query}
          />
        </label>
        <button
          aria-label={sort === "az" ? "Zmień kolejność na Z–A" : "Zmień kolejność na A–Z"}
          className="flex h-11 cursor-pointer hover:bg-ink/5 items-center justify-center gap-2 rounded-card px-3.5 text-sm text-ink-muted transition-colors hover:text-ink hover:duration-0"
          onClick={() => setSort((current) => (current === "az" ? "za" : "az"))}
          type="button"
        >
          <span>{sort === "az" ? "A–Z" : "Z–A"}</span>
          <HugeiconsIcon
            aria-hidden="true"
            className="size-4"
            icon={ArrowUpDownIcon}
            strokeWidth={1.75}
          />
        </button>
      </div>

      <p aria-live="polite" className="sr-only">
        {counted(results.length, { one: "wystawca", few: "wystawcy", many: "wystawców" })}
      </p>

      {results.length > 0 ? (
        <ul className="mt-6 grid gap-5 sm:grid-cols-2">
          {results.map((exhibitor) => (
            <li key={exhibitor.logoUrl ?? exhibitor.links[0]?.href ?? exhibitor.name}>
              <ExhibitorCard exhibitor={exhibitor} />
            </li>
          ))}
        </ul>
      ) : hasFilters ? (
        <div className="mt-5 border-y border-dashed border-hairline py-12 text-center">
          <p className="display text-2xl">Nic tu nie znaleźliśmy</p>
          <p className="mt-2 text-ink-muted">Spróbuj innej nazwy lub kategorii.</p>
          <button
            className="marked-link mt-5 cursor-pointer text-sm"
            onClick={() => setQuery("")}
            type="button"
          >
            Wyczyść filtry
          </button>
        </div>
      ) : (
        <div className="mt-5 overflow-hidden rounded-card border border-edge bg-surface">
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

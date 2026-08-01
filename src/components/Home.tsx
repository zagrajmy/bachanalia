import Image from "next/image";
import Link from "next/link";

import { blocks, con, KEY_ART, marks } from "@/content/con";
import { Ticket } from "@/content/shop";
import { primaryCta } from "@/components/Globals/siteNav";
import { NewsEntry } from "@/components/News/news";
import { NewsSection } from "@/components/News/NewsSection";
import { Button } from "@/components/ui/warcraftcn/button";

const [nameHead, ...nameTail] = con.name.split(" ");

const idx = (i: number) => String(i + 1).padStart(2, "0");

export function Home({
  news,
  tickets,
}: {
  news: NewsEntry[];
  tickets: Ticket[];
}) {
  return (
    <>
      <section>
        <article className="ink-inverted relative overflow-hidden bg-navy">
          <span
            aria-hidden="true"
            className="screened pointer-events-none absolute inset-0 z-10"
          />

          <div className="relative min-w-0">
            <div className="relative">
              {}
              <div className="relative aspect-5/4 overflow-hidden border-b border-dashed border-hairline sm:aspect-video lg:absolute lg:inset-0 lg:aspect-auto lg:border-b-0">
                <Image
                  alt="Kosmiczny kogut o niebieskim ogonie wśród gwiazd na granatowym niebie"
                  className="object-cover object-[78%_45%] lg:object-[right_center]"
                  fill
                  priority
                  sizes="100vw"
                  src={KEY_ART}
                />
              </div>

              <span
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 hidden bg-linear-to-r from-navy from-25% to-transparent to-70% lg:block"
              />

              <div className="gutter relative mx-auto max-w-6xl px-5 pt-7 pb-10 sm:px-8 sm:pt-9 sm:pb-14 lg:flex lg:min-h-[calc(100vw/2.62)] lg:flex-col lg:justify-center lg:py-16">
                <ul className="mb-7 flex items-center sm:mb-9">
                  {marks.map(({ href, name, src }) => (
                    <li
                      className="px-5 first:pl-0 not-first:border-l not-first:border-dashed not-first:border-hairline last:pr-0"
                      key={name}
                    >
                      <Link
                        href={href}
                        {...(href.startsWith("http")
                          ? { rel: "noreferrer", target: "_blank" }
                          : {})}
                        className="block no-underline opacity-90 transition-opacity duration-200 hover:opacity-100"
                      >
                        <Image
                          alt={name}
                          className="h-[clamp(52px,7.6vw,66px)] w-auto"
                          priority
                          src={src}
                        />
                      </Link>
                    </li>
                  ))}
                </ul>

                <h1 className="display relative ml-[-0.045em] max-w-[16ch] text-[clamp(2.1rem,5.6vw,3.6rem)] leading-[0.88]">
                  <span className="block">
                    {nameHead} {nameTail.join(" ")}
                  </span>
                  <span className="text-coral">{con.edition}</span>
                </h1>

                <dl className="relative mt-7 grid max-w-136 gap-x-7 gap-y-1 text-sm sm:grid-cols-[auto_1fr] sm:gap-y-3 sm:text-base">
                  <dt className="text-sm text-accent">Termin</dt>
                  <dd className="mb-3 sm:mb-0">{con.dates}</dd>
                  <dt className="text-sm text-accent">Miejsce</dt>
                  <dd>
                    {con.venue}, {con.address}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </article>
      </section>

      <section className="gutter pt-12 sm:pt-16">
        <div className="mx-auto max-w-6xl">
          <div className="border-b-2 border-navy pb-3">
            <h2 className="display ml-[-0.04em] text-[clamp(2.1rem,6.4vw,4rem)]">
              Wejściówki
            </h2>
          </div>

          {}
          <ol className="mt-1">
            {tickets.map(({ href, label, note, price, soldOut }) => {
              const golden = label === "Golden Ticket";
              return (
                <li
                  className="border-b border-dashed border-navy/30"
                  key={href}
                >
                  <Link
                    className="group -mx-3 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 rounded-card p-3 no-underline transition-colors hover:duration-0 duration-150 hover:before:bg-paper-shade sm:gap-x-8 sm:py-3.5 before:inset-0.5 before:absolute relative before:-z-10"
                    href={href}
                  >
                    <span className="min-w-0">
                      <span className="display block text-[clamp(1.2rem,3.4vw,2rem)] text-ink">
                        {label}
                      </span>
                      <span className="mt-0.5 block text-sm text-ink-muted">
                        {soldOut ? "Wyprzedane" : note}
                      </span>
                    </span>
                    <span
                      className={`display text-[clamp(1.5rem,4.6vw,2.6rem)] whitespace-nowrap tabular-nums ${
                        golden ? "gold" : ""
                      } ${soldOut ? "line-through opacity-60" : ""}`}
                    >
                      {price}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ol>

          <Button
            asChild
            className="mt-9 px-8 py-3.5 text-[clamp(0.85rem,2.2vw,1rem)]"
          >
            <Link href={primaryCta.href}>Kup akredytację</Link>
          </Button>
        </div>
      </section>

      <section className="ink-inverted gutter mt-16 bg-petrol py-14 sm:mt-24 sm:py-20">
        <div className="mx-auto max-w-6xl">
          <p className="eyebrow text-accent">Bramy otwieramy</p>
          <ul className="mt-8 grid gap-10 sm:grid-cols-3 sm:gap-8">
            {con.hours.map(({ day, from }) => (
              <li key={day}>
                <p className="eyebrow text-ink-muted">{day}</p>
                <p className="display mt-2 text-[clamp(2.6rem,7.6vw,4.6rem)] tabular-nums">
                  od {from}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="gutter pt-14 sm:pt-20">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-2 border-b-2 border-navy pb-3">
            <h2 className="display ml-[-0.04em] text-[clamp(1.7rem,4.6vw,2.7rem)]">
              Program
            </h2>
            <p className="eyebrow text-ink-muted">
              {blocks.length} bloków tematycznych
            </p>
          </div>

          <ul className="grid sm:grid-cols-2 sm:gap-x-12">
            {blocks.map(({ href, label, note }, i) => (
              <li className="border-b border-dashed border-navy/25" key={href}>
                <Link
                  className="group flex items-baseline gap-4 py-4 no-underline"
                  href={href}
                >
                  <span className="w-6 shrink-0 text-[0.62rem] tracking-[0.18em] text-ink-muted tabular-nums">
                    {idx(i)}
                  </span>
                  <span className="min-w-0">
                    <span className="display block text-[clamp(1.1rem,3vw,1.5rem)] text-ink transition-colors duration-200 group-hover:text-rose">
                      {label}
                    </span>
                    <span className="mt-1 block text-sm text-ink-muted">
                      {note}
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <NewsSection items={news} />

      {}
      <section className="gutter pt-16 sm:pt-24">
        <div className="mx-auto flex max-w-6xl flex-col gap-8 border-t-2 border-navy pt-8 sm:flex-row sm:items-end sm:justify-between sm:gap-12">
          <div>
            <p className="display text-[clamp(2.1rem,6.4vw,4rem)] leading-[0.9]">
              {con.dates}
            </p>
            <p className="mt-3 max-w-[38ch] text-ink-muted">
              {con.venue}, {con.address}
            </p>
          </div>

          <Button
            asChild
            className="self-start px-8 py-3.5 text-[clamp(0.85rem,2.2vw,1rem)] sm:self-auto"
          >
            <Link href={primaryCta.href}>Kup akredytację</Link>
          </Button>
        </div>
      </section>
    </>
  );
}

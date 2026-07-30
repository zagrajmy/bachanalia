import Image from "next/image";
import Link from "next/link";

import { accreditation, blocks, con, KEY_ART, marks } from "@/content/con";
import { primaryCta } from "@/components/Globals/siteNav";
import { NewsEntry } from "@/components/News/news";
import { NewsSection } from "@/components/News/NewsSection";

const [nameHead, ...nameTail] = con.name.split(" ");
const seria = `${con.edition} / ${con.datesShort}`;

const idx = (i: number) => String(i + 1).padStart(2, "0");

export function Home({ news }: { news: NewsEntry[] }) {
  return (
    <>
      <section className="gutter pt-5 sm:pt-8">
        <article className="ink-inverted relative mx-auto grid max-w-6xl grid-cols-[minmax(0,1fr)_auto] overflow-hidden rounded-card bg-navy">
          <span aria-hidden="true" className="screened pointer-events-none absolute inset-0 z-10" />

          <div className="relative min-w-0">
            <div className="flex flex-wrap items-baseline justify-between gap-x-5 gap-y-1 border-b border-dashed border-hairline px-5 py-3 sm:px-8">
              <span className="eyebrow text-ink-muted">Akredytacja · {con.edition} edycja</span>
              <span className="eyebrow text-accent">
                {con.rank} · {con.attendance}
              </span>
            </div>

            <div className="grid lg:grid-cols-[1.02fr_0.98fr]">
              <div className="relative order-1 overflow-hidden border-b border-dashed border-hairline lg:order-2 lg:border-b-0 lg:border-l">
                <div className="relative aspect-[5/4] overflow-hidden sm:aspect-[4/3] lg:h-full lg:aspect-auto">
                  <Image
                    src={KEY_ART}
                    alt="Kosmiczny kogut wśród gwiazd na granatowym niebie, plakat XL Bachanaliów Fantastycznych"
                    fill
                    sizes="(min-width: 1024px) 48vw, 100vw"
                    priority
                    className="scale-[1.3] object-cover object-[100%_30%] lg:scale-[1.06] lg:object-[88%_28%]"
                  />
                </div>
              </div>

              <div className="relative order-2 px-5 pt-7 pb-10 sm:px-8 sm:pt-9 sm:pb-14 lg:order-1">
                <ul className="mb-7 flex items-center sm:mb-9">
                  {marks.map(({ name, src, href }) => (
                    <li
                      key={name}
                      className="px-5 first:pl-0 not-first:border-l not-first:border-dashed not-first:border-hairline last:pr-0"
                    >
                      <Link
                        href={href}
                        {...(href.startsWith("http")
                          ? { target: "_blank", rel: "noreferrer" }
                          : {})}
                        className="block no-underline opacity-90 transition-opacity duration-200 hover:opacity-100"
                      >
                        <Image
                          src={src}
                          alt={name}
                          priority
                          className="h-[clamp(52px,7.6vw,66px)] w-auto"
                        />
                      </Link>
                    </li>
                  ))}
                </ul>

                <h1 className="display relative -ml-[0.045em] text-[clamp(2.1rem,7.2vw,3.9rem)] leading-[0.86]">
                  <span className="block">{nameHead}</span>
                  <span className="block">{nameTail.join(" ")}</span>
                  <span className="-ml-[0.02em] block text-[1.75em] leading-[0.8] text-coral">
                    {con.edition}
                  </span>
                </h1>

                <dl className="relative mt-8 grid gap-x-7 gap-y-1 text-sm sm:grid-cols-[auto_1fr] sm:gap-y-3 sm:text-base">
                  <dt className="eyebrow text-accent sm:pt-[0.4em]">Termin</dt>
                  <dd className="mb-3 sm:mb-0">{con.dates}</dd>
                  <dt className="eyebrow text-accent sm:pt-[0.4em]">Miejsce</dt>
                  <dd>
                    {con.venue}, {con.address}
                  </dd>
                </dl>
              </div>
            </div>
          </div>

          <aside className="relative w-[52px] shrink-0 overflow-hidden border-l-2 border-dashed border-hairline sm:w-[74px] lg:w-[118px]">
            <span
              aria-hidden="true"
              className="absolute -top-4 -left-[15px] h-8 w-8 rounded-full bg-paper"
            />
            <span
              aria-hidden="true"
              className="absolute -bottom-4 -left-[15px] h-8 w-8 rounded-full bg-paper"
            />
            <span className="absolute inset-0 flex items-center justify-center overflow-hidden py-5">
              <span
                className="eyebrow text-center text-ink-muted"
                style={{ writingMode: "vertical-rl", rotate: "180deg" }}
              >
                Odcinek kontrolny · {seria}
              </span>
            </span>
          </aside>
        </article>
      </section>

      <section className="gutter pt-12 sm:pt-16">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-3 border-b-2 border-navy pb-3">
            <h2 className="display -ml-[0.04em] text-[clamp(2.1rem,6.4vw,4rem)]">Taryfikator</h2>
            <p className="max-w-[34ch] text-sm text-ink-muted">
              Ceny wejściówek na {con.dates}. Golden Ticket obejmuje cały konwent.
            </p>
          </div>

          <ol className="mt-1">
            {accreditation.map(({ label, price }, i) => {
              const golden = label === "Golden Ticket";
              return (
                <li
                  key={label}
                  className={
                    golden
                      ? "ink-inverted mt-4 rounded-card bg-petrol px-4 sm:px-6"
                      : "border-b border-dashed border-navy/30"
                  }
                >
                  <div className="flex items-baseline gap-3 py-2 sm:gap-5 sm:py-2.5">
                    <span
                      className={`w-6 shrink-0 text-[0.62rem] tracking-[0.18em] tabular-nums ${
                        golden ? "text-accent" : "text-ink-muted"
                      }`}
                    >
                      {idx(i)}
                    </span>
                    <span className="display text-[clamp(1.2rem,3.8vw,2.1rem)] whitespace-nowrap">
                      {label}
                    </span>
                    <span
                      aria-hidden="true"
                      className="mb-[0.4em] hidden flex-1 self-end border-b border-dotted border-hairline sm:block"
                    />
                    <span
                      className={`display ml-auto text-[clamp(1.6rem,5.2vw,2.8rem)] whitespace-nowrap tabular-nums sm:ml-0 ${
                        golden ? "text-coral" : ""
                      }`}
                    >
                      {price}
                    </span>
                  </div>
                </li>
              );
            })}
          </ol>

          <div className="mt-9 flex flex-col items-start gap-5 sm:flex-row sm:items-center sm:justify-between sm:gap-10">
            <Link
              href={primaryCta.href}
              className="display rounded-full bg-accent px-9 py-4 text-[clamp(1.2rem,3.6vw,1.65rem)] text-on-accent no-underline transition-[transform,background-color] duration-150 ease-[var(--ease-out)] hover:bg-pink active:scale-[0.98]"
            >
              Kup akredytację
            </Link>
            <p className="max-w-[46ch] text-sm text-ink-muted">
              Akredytacje sprzedaje sklep konwentu, płatność obsługuje Paynow. Na tej stronie nie
              kupisz biletu - link przenosi Cię do sklepu.
            </p>
          </div>
        </div>
      </section>

      <section className="ink-inverted gutter mt-16 bg-petrol py-20 sm:mt-24 sm:py-28">
        <div className="mx-auto max-w-6xl">
          <p className="eyebrow text-accent">Bramy otwieramy</p>
          <ul className="mt-12 grid gap-12 sm:grid-cols-3 sm:gap-8">
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
            <h2 className="display -ml-[0.04em] text-[clamp(1.7rem,4.6vw,2.7rem)]">
              Co dostajesz w cenie
            </h2>
            <p className="eyebrow text-ink-muted">{blocks.length} bloków programu</p>
          </div>

          <ul className="grid sm:grid-cols-2 sm:gap-x-12">
            {blocks.map(({ href, label, note }, i) => (
              <li key={href} className="border-b border-dashed border-navy/25">
                <Link href={href} className="group flex items-baseline gap-4 py-4 no-underline">
                  <span className="w-6 shrink-0 text-[0.62rem] tracking-[0.18em] text-ink-muted tabular-nums">
                    {idx(i)}
                  </span>
                  <span className="min-w-0">
                    <span className="display block text-[clamp(1.1rem,3vw,1.5rem)] text-ink transition-colors duration-200 group-hover:text-rose">
                      {label}
                    </span>
                    <span className="mt-1 block text-sm text-ink-muted">{note}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <NewsSection items={news} />
    </>
  );
}

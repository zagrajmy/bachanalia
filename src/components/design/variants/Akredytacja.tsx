import Image, { type StaticImageData } from "next/image";
import Link from "next/link";
import { Bebas_Neue, Familjen_Grotesk } from "next/font/google";

import {
  accreditation,
  blocks,
  cityFunding,
  con,
  NewsItem,
  PartnerLogo,
  partners,
} from "@/content/con";

const bebas = Bebas_Neue({
  subsets: ["latin", "latin-ext"],
  weight: "400",
  variable: "--v-display",
});
const familjen = Familjen_Grotesk({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "600"],
  variable: "--v-body",
});

const display = { fontFamily: "var(--v-display)" } as const;

const PUNCH_ROW =
  "radial-gradient(circle at 50% 50%, #f2efe9 0 3.5px, transparent 3.5px) 0 0 / 16px 16px repeat-x";

const PRINT_TEXTURE = {
  backgroundImage: "radial-gradient(rgba(242,239,233,0.06) 1px, transparent 1px)",
  backgroundSize: "4px 4px",
};

const [nameHead, ...nameTail] = con.name.split(" ");
const seria = `${con.edition} / ${con.datesShort}`;

const idx = (i: number) => String(i + 1).padStart(2, "0");

/** Wordmarks carry their weight in width; compact marks need more height to match. */
function logoHeight({ width, height }: PartnerLogo["src"]) {
  const ratio = width / height;
  if (ratio >= 3.5) return "clamp(22px, 4.2vw, 32px)";
  if (ratio >= 1.5) return "clamp(28px, 5vw, 40px)";
  return "clamp(38px, 6.6vw, 54px)";
}

export function Akredytacja({ news, artSrc }: { news: NewsItem[]; artSrc: StaticImageData }) {
  return (
    <div
      className={`${bebas.variable} ${familjen.variable} min-h-screen bg-[#f2efe9] text-[#191f5c]`}
      style={{ fontFamily: "var(--v-body)" }}
    >
      <header className="flex items-center justify-between gap-4 border-b border-[#191f5c]/20 px-5 py-3 sm:px-8 lg:px-10">
        <span style={display} className="text-xl leading-none tracking-[0.16em]">
          Ad Astra
        </span>
        <Link
          href="/akredytacja/"
          className="rounded-full bg-[#ee7489] px-5 py-2 text-xs font-semibold tracking-[0.12em] text-[#191f5c] uppercase no-underline"
        >
          Kup akredytację
        </Link>
      </header>

      <section className="px-5 pt-5 pb-2 sm:px-8 sm:pt-8 lg:px-10">
        <article className="relative mx-auto grid max-w-6xl grid-cols-[minmax(0,1fr)_auto] overflow-hidden rounded-[3px] bg-[#191f5c] text-[#f2efe9]">
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 z-10"
            style={PRINT_TEXTURE}
          />

          <div className="relative min-w-0">
            <div className="flex flex-wrap items-baseline justify-between gap-x-5 gap-y-1 border-b border-dashed border-[#f2efe9]/25 px-5 py-3 sm:px-8">
              <span className="text-[0.62rem] tracking-[0.34em] text-[#cbbbcf] uppercase">
                Akredytacja · {con.edition} edycja
              </span>
              <span className="text-[0.62rem] tracking-[0.34em] text-[#ff9cb3] uppercase">
                {con.rank} · {con.attendance}
              </span>
            </div>

            <div className="grid lg:grid-cols-[1.02fr_0.98fr]">
              <div className="relative order-1 overflow-hidden border-b border-dashed border-[#f2efe9]/25 lg:order-2 lg:border-b-0 lg:border-l">
                <div className="relative aspect-[5/4] overflow-hidden sm:aspect-[4/3] lg:h-full lg:aspect-auto">
                  <Image
                    src={artSrc}
                    alt="Kosmiczny kogut wśród gwiazd na granatowym niebie, plakat XL Bachanaliów Fantastycznych"
                    fill
                    sizes="(min-width: 1024px) 48vw, 100vw"
                    priority
                    className="scale-[1.3] object-cover object-[100%_30%] lg:scale-[1.06] lg:object-[88%_28%]"
                  />
                </div>
              </div>

              <div className="relative order-2 px-5 pt-8 pb-10 sm:px-8 sm:pt-10 sm:pb-14 lg:order-1">
                <h1
                  style={display}
                  className="relative -ml-[0.045em] text-[clamp(2.5rem,8.6vw,4.6rem)] leading-[0.83] tracking-[0.01em]"
                >
                  <span className="block">{nameHead}</span>
                  <span className="block">{nameTail.join(" ")}</span>
                  <span className="-ml-[0.02em] block text-[1.75em] leading-[0.76] text-[#ee7489]">
                    {con.edition}
                  </span>
                </h1>

                <dl className="relative mt-8 grid gap-x-7 gap-y-1 text-sm sm:grid-cols-[auto_1fr] sm:gap-y-3 sm:text-base">
                  <dt className="text-[0.62rem] tracking-[0.28em] text-[#ff9cb3] uppercase sm:pt-[0.3em]">
                    Termin
                  </dt>
                  <dd className="mb-3 sm:mb-0">{con.dates}</dd>
                  <dt className="text-[0.62rem] tracking-[0.28em] text-[#ff9cb3] uppercase sm:pt-[0.3em]">
                    Miejsce
                  </dt>
                  <dd>
                    {con.venue}, {con.address}
                  </dd>
                </dl>
              </div>
            </div>
          </div>

          <aside className="relative w-[52px] shrink-0 overflow-hidden border-l-2 border-dashed border-[#f2efe9]/40 sm:w-[74px] lg:w-[118px]">
            <span
              aria-hidden="true"
              className="absolute -top-4 -left-[15px] h-8 w-8 rounded-full bg-[#f2efe9]"
            />
            <span
              aria-hidden="true"
              className="absolute -bottom-4 -left-[15px] h-8 w-8 rounded-full bg-[#f2efe9]"
            />
            <span className="absolute inset-0 flex items-center justify-center overflow-hidden py-5">
              <span
                className="text-center text-[0.6rem] tracking-[0.36em] text-[#cbbbcf] uppercase"
                style={{ writingMode: "vertical-rl", rotate: "180deg" }}
              >
                Odcinek kontrolny · {seria}
              </span>
            </span>
          </aside>
        </article>
      </section>

      <section className="px-5 pt-12 sm:px-8 sm:pt-16 lg:px-10">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-3 border-b-2 border-[#191f5c] pb-3">
            <h2
              style={display}
              className="-ml-[0.04em] text-[clamp(2.4rem,7.4vw,4.75rem)] leading-[0.82]"
            >
              Taryfikator
            </h2>
            <p className="max-w-[34ch] text-sm text-[#4e5079]">
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
                      ? "mt-4 rounded-[3px] bg-[#191f5c] px-4 text-[#f2efe9] sm:px-6"
                      : "border-b border-dashed border-[#191f5c]/30"
                  }
                >
                  <div className="flex items-baseline gap-3 py-2 sm:gap-5 sm:py-2.5">
                    <span
                      className={`w-6 shrink-0 text-[0.62rem] tracking-[0.18em] tabular-nums ${
                        golden ? "text-[#ff9cb3]" : "text-[#4e5079]"
                      }`}
                    >
                      {idx(i)}
                    </span>
                    <span
                      style={display}
                      className="text-[clamp(1.45rem,4.6vw,2.6rem)] leading-none whitespace-nowrap"
                    >
                      {label}
                    </span>
                    <span
                      aria-hidden="true"
                      className={`mb-[0.4em] hidden flex-1 self-end border-b border-dotted sm:block ${
                        golden ? "border-[#f2efe9]/45" : "border-[#191f5c]/35"
                      }`}
                    />
                    <span
                      style={display}
                      className={`ml-auto text-[clamp(1.9rem,6.4vw,3.4rem)] leading-none whitespace-nowrap tabular-nums sm:ml-0 ${
                        golden ? "text-[#ee7489]" : ""
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
              href="/akredytacja/"
              style={display}
              className="rounded-full bg-[#ee7489] px-9 py-4 text-[clamp(1.35rem,4vw,1.9rem)] leading-none tracking-[0.06em] text-[#191f5c] no-underline"
            >
              Kup akredytację
            </Link>
            <p className="max-w-[46ch] text-sm text-[#4e5079]">
              Akredytacje sprzedaje sklep konwentu, płatność obsługuje Paynow. Na tej stronie nie
              kupisz biletu - link przenosi Cię do sklepu.
            </p>
          </div>
        </div>
      </section>

      <section className="mt-16 bg-[#191f5c] px-5 py-20 text-[#f2efe9] sm:mt-24 sm:px-8 sm:py-28 lg:px-10">
        <div className="mx-auto max-w-6xl">
          <p className="text-[0.62rem] tracking-[0.36em] text-[#ff9cb3] uppercase">
            Bramy otwieramy
          </p>
          <ul className="mt-12 grid gap-12 sm:grid-cols-3 sm:gap-8">
            {con.hours.map(({ day, from }) => (
              <li key={day}>
                <p className="text-[0.62rem] tracking-[0.28em] text-[#cbbbcf] uppercase">{day}</p>
                <p
                  style={display}
                  className="mt-2 text-[clamp(3rem,9vw,5.5rem)] leading-[0.8] tabular-nums"
                >
                  od {from}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="px-5 pt-14 sm:px-8 sm:pt-20 lg:px-10">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-2 border-b-2 border-[#191f5c] pb-3">
            <h2
              style={display}
              className="-ml-[0.04em] text-[clamp(1.9rem,5.2vw,3.1rem)] leading-[0.85]"
            >
              Co dostajesz w cenie
            </h2>
            <p className="text-[0.62rem] tracking-[0.3em] text-[#4e5079] uppercase">
              {blocks.length} bloków programu
            </p>
          </div>

          <ul className="grid sm:grid-cols-2 sm:gap-x-12">
            {blocks.map(({ href, label, note }, i) => (
              <li key={href} className="border-b border-dashed border-[#191f5c]/25">
                <Link href={href} className="flex items-baseline gap-4 py-4 no-underline">
                  <span className="w-6 shrink-0 text-[0.62rem] tracking-[0.18em] text-[#4e5079] tabular-nums">
                    {idx(i)}
                  </span>
                  <span className="min-w-0">
                    <span
                      style={display}
                      className="block text-[clamp(1.2rem,3.4vw,1.7rem)] leading-none text-[#191f5c]"
                    >
                      {label}
                    </span>
                    <span className="mt-1 block text-sm text-[#4e5079]">{note}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="px-5 pt-14 pb-16 sm:px-8 sm:pt-20 lg:px-10">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-[0.62rem] tracking-[0.36em] text-[#4e5079] uppercase">Aktualności</h2>
          <ul className="mt-4 border-t-2 border-[#191f5c]">
            {news.slice(0, 3).map((item) => (
              <li key={item.href} className="border-b border-dashed border-[#191f5c]/25">
                <Link
                  href={item.href}
                  className="flex flex-wrap items-baseline gap-x-5 gap-y-1 py-3 no-underline"
                >
                  <span className="w-[7.5rem] shrink-0 text-xs text-[#4e5079] tabular-nums">
                    {item.date}
                  </span>
                  <span
                    style={display}
                    className="text-[clamp(1.2rem,3.4vw,1.7rem)] leading-none text-[#191f5c]"
                  >
                    {item.title}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <footer className="relative bg-[#191f5c] px-5 pt-14 pb-12 text-[#f2efe9] sm:px-8 sm:pt-16 lg:px-10">
        <span
          aria-hidden="true"
          className="absolute inset-x-0 top-0 h-[8px]"
          style={{ background: PUNCH_ROW }}
        />

        <div className="mx-auto max-w-6xl">
          <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
            <p style={display} className="text-2xl leading-none tracking-[0.1em]">
              Rewers
            </p>
            <p className="text-[0.62rem] tracking-[0.3em] text-[#ff9cb3] uppercase">
              Seria {seria}
            </p>
          </div>

          <div className="relative mt-5 overflow-hidden rounded-[3px] bg-[#f2efe9] px-5 py-8 text-[#191f5c] sm:px-8 sm:py-10">
            <span
              aria-hidden="true"
              className="absolute -top-[13px] left-1/2 h-[26px] w-[26px] -translate-x-1/2 rounded-full bg-[#191f5c]"
            />
            <span
              aria-hidden="true"
              className="absolute -bottom-[13px] left-1/2 h-[26px] w-[26px] -translate-x-1/2 rounded-full bg-[#191f5c]"
            />

            <ul className="grid gap-9 sm:grid-cols-3 sm:gap-8">
              {partners.map(({ tier, logos }) => (
                <li key={tier}>
                  <p className="text-[0.62rem] tracking-[0.28em] text-[#4e5079] uppercase">
                    {tier}
                  </p>
                  <div className="mt-4 flex flex-wrap items-center gap-x-7 gap-y-5">
                    {logos.map((logo) => (
                      <Image
                        key={logo.name}
                        src={logo.src}
                        alt={logo.name}
                        className={`w-auto ${logo.src.src.endsWith(".jpg") ? "mix-blend-multiply" : ""}`}
                        style={{ height: logoHeight(logo.src) }}
                      />
                    ))}
                  </div>
                </li>
              ))}
            </ul>

            <div className="mt-9 flex items-center gap-4 border-t border-dashed border-[#191f5c]/30 pt-6">
              <Image
                src={cityFunding.src}
                alt={cityFunding.name}
                className="w-auto shrink-0"
                style={{ height: "clamp(36px, 6vw, 48px)" }}
              />
              <p className="max-w-[42ch] text-xs text-[#4e5079]">{cityFunding.name}</p>
            </div>
          </div>

          <p className="mt-10 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2 border-t border-dashed border-[#f2efe9]/25 pt-6 text-sm text-[#cbbbcf]">
            <span>{con.organiser}</span>
            <span className="text-[0.62rem] tracking-[0.3em] uppercase">
              {con.venue}, {con.address}
            </span>
          </p>
        </div>
      </footer>
    </div>
  );
}

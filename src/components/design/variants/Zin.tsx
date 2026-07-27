import Image from "next/image";
import Link from "next/link";
import { Archivo_Black, Courier_Prime } from "next/font/google";

import { accreditation, blocks, cityFunding, con, NewsItem, partners } from "../content";

const archivo = Archivo_Black({
  subsets: ["latin", "latin-ext"],
  weight: "400",
  variable: "--v-display",
});
const courier = Courier_Prime({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "700"],
  variable: "--v-body",
});

const PAPER =
  "radial-gradient(rgba(18,20,63,0.10) 1px, transparent 1px) 0 0 / 4px 4px," +
  "radial-gradient(rgba(238,116,137,0.14) 1px, transparent 1px) 2px 2px / 4px 4px";

const HALFTONE =
  "radial-gradient(rgba(239,233,220,0.85) 1.1px, transparent 1.2px) 0 0 / 5px 5px," +
  "radial-gradient(rgba(238,116,137,0.55) 1.1px, transparent 1.2px) 2.5px 2.5px / 5px 5px";

function RegMark({ className = "", ink = "#141642" }: { className?: string; ink?: string }) {
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true" focusable="false" className={className} fill="none">
      <g transform="translate(1.6 1.4)">
        <circle cx="15" cy="15" r="7.5" stroke="#ee7489" strokeWidth="1.6" />
        <path d="M15 1v28M1 15h28" stroke="#ee7489" strokeWidth="1.6" />
      </g>
      <circle cx="15" cy="15" r="7.5" stroke={ink} strokeWidth="1.6" />
      <path d="M15 1v28M1 15h28" stroke={ink} strokeWidth="1.6" />
    </svg>
  );
}

const TITLE = (
  <>
    <span className="block">Bachanalia</span>
    <span className="block">Fantastyczne</span>
    <span className="mt-[0.02em] block text-[1.9em] leading-[0.68]">{con.edition}</span>
  </>
);

export function Zin({ news, artSrc }: { news: NewsItem[]; artSrc: string }) {
  return (
    <div
      className={`${archivo.variable} ${courier.variable} min-h-screen overflow-x-clip bg-[#efe9dc] text-[#141642]`}
      style={{ fontFamily: "var(--v-body)", backgroundImage: PAPER }}
    >
      <header className="relative">
        <div className="flex items-center justify-between gap-4 px-4 py-2.5 sm:px-6">
          <span className="text-[0.62rem] tracking-[0.28em] uppercase sm:text-xs">
            nr 40 · 2026 · egz. bezpłatny
          </span>
          <Link
            href="/akredytacja/"
            className="bg-[#141642] px-3 py-1.5 text-[0.62rem] tracking-[0.2em] text-[#efe9dc] uppercase no-underline shadow-[-4px_4px_0_#ee7489] sm:text-xs"
          >
            Akredytacja
          </Link>
        </div>
        <div className="h-px bg-[#141642]" />
        <div className="mt-[3px] h-[7px] bg-[#141642]" />
      </header>

      <section className="relative px-3 pt-10 pb-8 sm:px-5 sm:pt-14">
        <RegMark className="absolute top-4 right-3 h-6 w-6 sm:right-5 sm:h-8 sm:w-8" />
        <h1
          style={{ fontFamily: "var(--v-display)" }}
          className="relative text-[clamp(2.05rem,10.4vw,8.5rem)] leading-[0.8] uppercase"
        >
          <span
            aria-hidden="true"
            className="absolute top-0 left-0 w-full origin-top-left translate-x-[-0.085em] translate-y-[0.07em] rotate-[-1.6deg] text-[#ee7489] mix-blend-multiply"
          >
            {TITLE}
          </span>
          <span className="relative block">{TITLE}</span>
        </h1>

        <div className="mt-8 flex flex-wrap items-start gap-x-6 gap-y-4">
          <p
            style={{ fontFamily: "var(--v-display)" }}
            className="rotate-[-1.4deg] bg-[#ee7489] px-3 py-1.5 text-lg leading-none tracking-tight uppercase sm:text-2xl"
          >
            {con.datesShort}
          </p>
          <p className="max-w-[46ch] text-[0.8rem] leading-relaxed">
            {con.venue}, {con.address}. Organizuje {con.organiser}. Ranga {con.rank}.
          </p>
        </div>
      </section>

      <figure className="relative">
        <div className="relative w-full overflow-hidden border-y-[7px] border-[#141642]">
          <Image
            src={artSrc}
            alt="Kosmiczny kogut z czerwonym grzebieniem na granatowym gwiaździstym niebie, plakat XL Bachanaliów Fantastycznych"
            width={1300}
            height={500}
            priority
            className="aspect-[4/3] w-full object-cover object-[74%_50%] contrast-125 saturate-150 sm:aspect-[13/5] sm:object-center"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 opacity-30"
            style={{ backgroundImage: HALFTONE }}
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-[#ee7489] opacity-15 mix-blend-screen"
          />
        </div>
        <figcaption className="absolute -bottom-3 left-3 rotate-[-2deg] bg-[#141642] px-3 py-1.5 text-[0.6rem] tracking-[0.24em] text-[#efe9dc] uppercase sm:left-6 sm:text-xs">
          okładka numeru
        </figcaption>
      </figure>

      <section className="border-b border-[#141642] pt-8">
        <h2 className="px-4 text-[0.62rem] tracking-[0.3em] uppercase sm:px-6">Godziny otwarcia</h2>
        <ul className="mt-3 grid grid-cols-3 border-y border-[#141642]">
          {con.hours.map(({ day, from }) => (
            <li
              key={day}
              className="border-l border-[#141642] px-2 py-4 first:border-l-0 sm:px-6 sm:py-6"
            >
              <p className="text-[0.6rem] tracking-[0.18em] uppercase sm:text-xs">{day}</p>
              <p
                style={{ fontFamily: "var(--v-display)" }}
                className="mt-1 text-[clamp(1.35rem,5.4vw,2.75rem)] leading-none"
              >
                {from}
              </p>
            </li>
          ))}
        </ul>
        <p className="mx-3 -mt-2 mb-6 rotate-[0.5deg] bg-[#ee7489] px-4 py-3 text-[0.78rem] leading-snug sm:mx-6 sm:max-w-[60ch]">
          Budynek zamykamy o 20:00. W piątek i sobotę kończymy w knajpie konwentowej.
        </p>
      </section>

      <section className="relative border-b-[10px] border-[#141642] px-4 py-8 sm:px-6">
        <span
          aria-hidden="true"
          className="absolute top-16 -left-[2px] h-8 w-3 rotate-[-4deg] bg-[#141642]"
        />
        <span
          aria-hidden="true"
          className="absolute bottom-16 -left-[2px] h-8 w-3 rotate-[3deg] bg-[#141642]"
        />
        <div
          aria-hidden="true"
          className="absolute inset-y-6 left-1/2 hidden border-l border-dashed border-[#141642]/40 md:block"
        />
        <div className="flex items-end justify-between gap-4 border-b-[5px] border-[#141642] pb-2">
          <h2 style={{ fontFamily: "var(--v-display)" }} className="text-2xl uppercase sm:text-4xl">
            Spis treści
          </h2>
          <p className="pb-1 text-[0.62rem] tracking-[0.22em] uppercase">
            {blocks.length} bloków programu
          </p>
        </div>
        <ol className="md:grid md:grid-cols-2 md:gap-x-10">
          {blocks.map(({ href, label, note }, i) => (
            <li key={href} className="border-b border-[#141642]/45">
              <Link
                href={href}
                className="flex items-baseline gap-2 py-[0.42rem] no-underline sm:gap-3"
              >
                <span
                  style={{ fontFamily: "var(--v-display)" }}
                  className="w-5 shrink-0 text-[0.7rem] tabular-nums"
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="text-[0.78rem] font-bold tracking-[0.06em] uppercase">
                  {label}
                </span>
                <span
                  aria-hidden="true"
                  className="mb-[0.18rem] flex-1 border-b border-dotted border-[#141642]/50"
                />
                <span className="hidden shrink-0 text-[0.7rem] sm:block">{note}</span>
              </Link>
            </li>
          ))}
        </ol>
      </section>

      <section className="relative border-b border-[#141642] px-4 py-14 sm:px-6 sm:py-24">
        <p
          style={{ fontFamily: "var(--v-display)" }}
          className="relative text-[clamp(2.4rem,10vw,6.5rem)] leading-[0.86] uppercase"
        >
          <span
            aria-hidden="true"
            className="absolute top-0 left-0 translate-x-[-0.05em] translate-y-[0.05em] text-[#ee7489] mix-blend-multiply"
          >
            {con.attendance}
          </span>
          <span className="relative">{con.attendance}</span>
        </p>
        <p className="mt-4 text-[0.72rem] tracking-[0.26em] uppercase">
          Nakład zależny od frekwencji
        </p>
      </section>

      <section className="bg-[#141642] px-4 py-12 text-[#efe9dc] sm:px-6">
        <div className="flex items-end justify-between gap-4 border-b-2 border-[#efe9dc] pb-2">
          <h2 style={{ fontFamily: "var(--v-display)" }} className="text-2xl uppercase sm:text-4xl">
            Cennik wejściówek
          </h2>
          <RegMark className="mb-1 h-6 w-6 shrink-0" ink="#efe9dc" />
        </div>
        <ul className="mt-6 grid grid-cols-2 border-t border-[#efe9dc]/45 sm:grid-cols-3 lg:grid-cols-5">
          {accreditation.map(({ label, price }) => (
            <li key={label} className="border-r border-b border-[#efe9dc]/45 px-3 py-5">
              <p className="text-[0.62rem] tracking-[0.2em] uppercase">{label}</p>
              <p
                style={{ fontFamily: "var(--v-display)" }}
                className="mt-2 text-2xl text-[#ee7489] sm:text-3xl"
              >
                {price}
              </p>
            </li>
          ))}
        </ul>
        <Link
          href="/akredytacja/"
          className="mt-8 inline-block border-2 border-[#efe9dc] px-5 py-2.5 text-xs tracking-[0.24em] uppercase no-underline"
        >
          Kup wejściówkę
        </Link>
      </section>

      <section className="grid border-b border-[#141642] md:grid-cols-[1.4fr_1fr]">
        <div className="border-b border-[#141642] px-4 py-8 md:border-r md:border-b-0 sm:px-6">
          <h2 className="text-[0.62rem] tracking-[0.3em] uppercase">Z ostatniej chwili</h2>
          <ul className="mt-4">
            {news.slice(0, 3).map((item) => (
              <li key={item.href} className="border-t border-[#141642]/45 first:border-t-0">
                <Link href={item.href} className="flex gap-3 py-2.5 no-underline">
                  <span className="w-[5.5rem] shrink-0 text-[0.62rem] tracking-[0.12em] uppercase">
                    {item.date}
                  </span>
                  <span className="text-[0.82rem] font-bold">{item.title}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div className="px-4 py-8 text-[0.72rem] leading-relaxed sm:px-6">
          <p className="font-bold tracking-[0.22em] uppercase">Stopka redakcyjna</p>
          <p className="mt-2">
            Wydaje {con.organiser}. Ranga {con.rank}. {con.dates}, {con.venue}, {con.address}.
          </p>
          <div className="mt-5 flex items-center gap-3 border-t border-[#141642]/45 pt-4">
            <Image
              src={cityFunding.src}
              alt=""
              aria-hidden="true"
              width={cityFunding.width}
              height={cityFunding.height}
              className="h-12 w-12 shrink-0 object-contain mix-blend-multiply"
            />
            <p className="max-w-[24ch] leading-snug">{cityFunding.name}</p>
          </div>
        </div>
      </section>

      <footer className="relative px-4 py-10 text-[0.7rem] sm:px-6">
        <p className="text-[0.62rem] tracking-[0.3em] uppercase">Druga strona okładki</p>
        <ul className="mt-5 grid gap-x-8 gap-y-7 sm:grid-cols-3">
          {partners.map(({ tier, logos }) => (
            <li key={tier} className="border-t-[3px] border-[#141642] pt-2">
              <p className="font-bold tracking-[0.2em] uppercase">{tier}</p>
              <ul className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-4">
                {logos.map((logo) => (
                  <li key={logo.name}>
                    <Image
                      src={logo.src}
                      alt={logo.name}
                      width={logo.width}
                      height={logo.height}
                      className="h-10 w-auto mix-blend-multiply"
                    />
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
        <div className="mt-10 flex items-center justify-between gap-4 border-t border-[#141642] pt-4">
          <p className="tracking-[0.2em] uppercase">{con.organiser}</p>
          <RegMark className="h-6 w-6 shrink-0" />
        </div>
      </footer>
    </div>
  );
}

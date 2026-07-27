import Image from "next/image";
import Link from "next/link";
import { Anton, Familjen_Grotesk } from "next/font/google";

import { accreditation, blocks, cityFunding, con, NewsItem, partners } from "../content";

const anton = Anton({ subsets: ["latin", "latin-ext"], weight: "400", variable: "--v-display" });
const familjen = Familjen_Grotesk({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "600"],
  variable: "--v-body",
});

const display = { fontFamily: "var(--v-display)" } as const;

export function Plakat({ news, artSrc }: { news: NewsItem[]; artSrc: string }) {
  return (
    <div
      className={`${anton.variable} ${familjen.variable} min-h-screen bg-[#12143f] text-[#f3eee6]`}
      style={{ fontFamily: "var(--v-body)" }}
    >
      <header className="flex items-center justify-between gap-6 px-5 py-4 lg:px-10">
        <span style={display} className="text-[13px] tracking-[0.24em] text-[#ff9cb3] uppercase">
          Ad Astra
        </span>
        <nav className="hidden gap-7 text-[11px] tracking-[0.18em] text-[#f3eee6]/75 uppercase md:flex">
          {["O konwencie", "Program", "Wystawcy", "Noclegi"].map((label) => (
            <span key={label}>{label}</span>
          ))}
        </nav>
        <Link
          href="/akredytacja/"
          className="border-b border-[#ee7489] pb-px text-[11px] tracking-[0.18em] text-[#ff9cb3] uppercase no-underline"
        >
          Akredytacja
        </Link>
      </header>

      <section>
        <Image
          src={artSrc}
          alt={`Plakat ${con.edition} Bachanaliów Fantastycznych: kosmiczny kogut z rozłożonym niebieskim ogonem na granatowym, rozgwieżdżonym niebie. ${con.dates}, ${con.venue}.`}
          width={1300}
          height={500}
          priority
          sizes="100vw"
          className="block w-full"
        />

        <div className="relative overflow-hidden pt-3 pb-1 lg:pt-5">
          <h1
            style={display}
            className="pl-4 text-[clamp(3.6rem,13.6vw,12rem)] leading-[0.8] tracking-[-0.015em] whitespace-nowrap uppercase lg:pl-9"
          >
            Czterdziesta edycja
            <span className="sr-only">
              {" "}
              Bachanaliów Fantastycznych, {con.dates}, {con.venue}
            </span>
          </h1>
        </div>

        <div className="mt-6 grid gap-x-10 gap-y-5 px-5 sm:grid-cols-[auto_1fr] sm:items-end lg:px-10">
          <p className="text-sm leading-relaxed text-[#f3eee6]/85">
            <span className="block text-[11px] tracking-[0.22em] text-[#ff9cb3] uppercase">
              {con.rank} · {con.datesShort} · {con.attendance}
            </span>
            {con.venue}
            <br />
            {con.address}
          </p>
          <p className="sm:justify-self-end">
            <Link
              href="/akredytacja/"
              className="inline-block bg-[#ee7489] px-5 py-2.5 text-sm font-semibold tracking-[0.08em] text-[#12143f] uppercase no-underline"
            >
              Kup wejściówkę
            </Link>
          </p>
        </div>
      </section>

      <section className="mt-8 border-y border-[#ee7489]/45 px-5 py-2.5 lg:px-10">
        <ul className="flex flex-wrap gap-x-8 gap-y-1 text-sm">
          {con.hours.map(({ day, from }) => (
            <li key={day} className="flex items-baseline gap-2">
              <span className="text-[11px] tracking-[0.2em] text-[#ff9cb3] uppercase">{day}</span>
              <span className="tabular-nums">od {from}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="px-5 pt-20 pb-14 lg:px-10 lg:pt-36 lg:pb-20">
        <h2
          style={display}
          className="text-[clamp(1.9rem,5.2vw,4rem)] leading-[0.9] tracking-tight uppercase"
        >
          Osiem bloków,
          <br className="sm:hidden" /> trzy dni
        </h2>
        <ul className="mt-7 border-t border-[#ee7489]/45">
          {blocks.map(({ href, label, note }, i) => (
            <li key={href} className="border-b border-[#ee7489]/45">
              <Link
                href={href}
                className="group grid grid-cols-[1.9rem_1fr] items-baseline gap-x-4 gap-y-1 py-2.5 no-underline transition-colors hover:bg-[#ee7489]/10 sm:grid-cols-[1.9rem_minmax(0,20rem)_1fr] sm:py-2"
              >
                <span className="text-[11px] tabular-nums text-[#ff9cb3]">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3
                  style={display}
                  className="text-[clamp(1.35rem,3.6vw,2.35rem)] leading-none text-[#f3eee6] uppercase transition-colors group-hover:text-[#ff9cb3]"
                >
                  {label}
                </h3>
                <p className="col-start-2 text-sm text-[#f3eee6]/70 sm:col-start-3 sm:text-right">
                  {note}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="relative [--panel:2.5rem] lg:[--panel:8rem]">
        <div
          aria-hidden
          className="absolute inset-y-0 right-0 bg-[#ee7489]"
          style={{ left: "var(--panel)" }}
        />

        <div className="relative pt-9 pb-10 lg:pt-14 lg:pb-12">
          <div className="relative">
            <h2
              style={display}
              className="pl-5 text-[clamp(2.6rem,10.5vw,8.5rem)] leading-[0.85] tracking-[-0.015em] text-[#ee7489] uppercase lg:pl-10"
            >
              Akredytacja
            </h2>
            <span
              aria-hidden
              className="pointer-events-none absolute inset-0 select-none"
              style={{ clipPath: "inset(0 0 0 var(--panel))" }}
            >
              <span
                style={display}
                className="block pl-5 text-[clamp(2.6rem,10.5vw,8.5rem)] leading-[0.85] tracking-[-0.015em] text-[#12143f] uppercase lg:pl-10"
              >
                Akredytacja
              </span>
            </span>
          </div>

          <div className="mt-7 pr-5 pl-14 text-[#12143f] lg:mt-10 lg:pr-10 lg:pl-40">
            <ul className="grid grid-cols-2 gap-x-6 gap-y-5 sm:grid-cols-3 lg:grid-cols-5">
              {accreditation.map(({ label, price }) => (
                <li key={label} className="border-t-2 border-[#12143f] pt-2">
                  <p className="text-[11px] tracking-[0.16em] uppercase">{label}</p>
                  <p style={display} className="mt-0.5 text-2xl tabular-nums lg:text-3xl">
                    {price}
                  </p>
                </li>
              ))}
            </ul>
            <div className="mt-7 flex justify-end lg:mt-9">
              <Link
                href="/akredytacja/"
                className="inline-block bg-[#12143f] px-6 py-3 text-sm font-semibold tracking-[0.08em] text-[#f3eee6] uppercase no-underline"
              >
                Kup wejściówkę
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="px-5 pt-16 pb-14 lg:px-10 lg:pt-24">
        <h2 className="text-[11px] tracking-[0.3em] text-[#ff9cb3] uppercase">Ogłoszenia</h2>
        <ul className="mt-5 grid gap-x-10 gap-y-6 border-t border-[#ee7489]/45 pt-5 md:grid-cols-3">
          {news.slice(0, 3).map((item) => (
            <li key={item.href}>
              <Link href={item.href} className="group no-underline">
                <p className="text-xs tabular-nums text-[#f3eee6]/70">{item.date}</p>
                <h3
                  style={display}
                  className="mt-1 text-xl leading-tight text-[#f3eee6] uppercase transition-colors group-hover:text-[#ff9cb3]"
                >
                  {item.title}
                </h3>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <footer className="border-t border-[#ee7489]/45 px-5 py-8 lg:px-10">
        <ul className="grid gap-x-10 gap-y-7 sm:grid-cols-3">
          {partners.map(({ tier, logos }) => (
            <li key={tier}>
              <p className="text-[10px] tracking-[0.2em] text-[#ff9cb3] uppercase">{tier}</p>
              <ul className="mt-3 flex flex-wrap items-center gap-3">
                {logos.map((logo) => (
                  <li
                    key={logo.name}
                    className={logo.needsPlate ? "bg-[#f3eee6] px-2 py-1.5" : undefined}
                  >
                    <Image
                      src={logo.src}
                      alt={logo.name}
                      width={logo.width}
                      height={logo.height}
                      className="h-7 w-auto object-contain"
                    />
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
        <div className="mt-9 flex flex-wrap items-center gap-x-4 gap-y-3 border-t border-[#ee7489]/25 pt-5 text-xs text-[#f3eee6]/70">
          <p>{con.organiser}</p>
          <span aria-hidden className="hidden text-[#ee7489]/60 sm:inline">
            ·
          </span>
          <span className="flex items-center gap-2">
            <Image
              src={cityFunding.src}
              alt=""
              width={cityFunding.width}
              height={cityFunding.height}
              className="h-9 w-auto bg-[#f3eee6] object-contain p-0.5"
            />
            {cityFunding.name}
          </span>
        </div>
      </footer>
    </div>
  );
}

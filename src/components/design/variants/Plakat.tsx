import Image from "next/image";
import Link from "next/link";
import { Anton, Familjen_Grotesk } from "next/font/google";

import { accreditation, blocks, con, NewsItem, partners } from "../content";

const anton = Anton({ subsets: ["latin", "latin-ext"], weight: "400", variable: "--v-display" });
const familjen = Familjen_Grotesk({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "600"],
  variable: "--v-body",
});

export function Plakat({ news, artSrc }: { news: NewsItem[]; artSrc: string }) {
  return (
    <div
      className={`${anton.variable} ${familjen.variable} min-h-screen bg-[#12143f] text-[#f3eee6]`}
      style={{ fontFamily: "var(--v-body)" }}
    >
      <header className="flex items-baseline justify-between gap-6 border-b-4 border-[#ee7489] px-6 py-5 lg:px-12">
        <span
          style={{ fontFamily: "var(--v-display)" }}
          className="text-2xl tracking-wide text-[#ee7489] uppercase"
        >
          Ad Astra
        </span>
        <nav className="hidden gap-7 text-sm tracking-[0.12em] uppercase md:flex">
          {["O konwencie", "Program", "Wystawcy", "Noclegi"].map((label) => (
            <span key={label} className="opacity-80">
              {label}
            </span>
          ))}
        </nav>
        <Link
          href="/akredytacja/"
          className="bg-[#ee7489] px-4 py-2 text-sm font-semibold tracking-wide text-[#12143f] uppercase no-underline"
        >
          Akredytacja
        </Link>
      </header>

      <section>
        <Image
          src={artSrc}
          alt={`Plakat ${con.edition} Bachanaliów Fantastycznych: kosmiczny kogut na granatowym niebie. ${con.dates}, ${con.venue}.`}
          width={1300}
          height={500}
          priority
          sizes="100vw"
          className="w-full"
        />

        <div className="grid gap-8 border-y-4 border-[#ee7489] px-6 py-10 lg:grid-cols-[1.35fr_1fr] lg:px-12 lg:py-14">
          <div>
            <p className="text-sm tracking-[0.3em] text-[#ff9cb3] uppercase">
              {con.rank} · {con.attendance}
            </p>
            <h1
              style={{ fontFamily: "var(--v-display)" }}
              className="mt-3 text-[clamp(2.5rem,6.5vw,5.5rem)] leading-[0.88] tracking-tight uppercase"
            >
              Czterdziesta edycja
              <br />
              <span className="text-[#ee7489]">{con.dates}</span>
            </h1>
          </div>

          <div className="self-end">
            <p className="text-lg text-[#f3eee6]/85">
              {con.venue}
              <br />
              {con.address}
            </p>
            <Link
              href="/akredytacja/"
              className="mt-6 inline-block bg-[#ee7489] px-6 py-3 font-semibold tracking-wide text-[#12143f] uppercase no-underline"
            >
              Kup wejściówkę
            </Link>
          </div>
        </div>
      </section>

      <section className="grid gap-px bg-[#ee7489]/30 md:grid-cols-3">
        {con.hours.map(({ day, from }) => (
          <div key={day} className="bg-[#12143f] px-6 py-7 lg:px-12">
            <p className="text-sm tracking-[0.2em] text-[#ff9cb3] uppercase">{day}</p>
            <p style={{ fontFamily: "var(--v-display)" }} className="mt-1 text-4xl">
              od {from}
            </p>
          </div>
        ))}
      </section>

      <section className="px-6 py-16 lg:px-12 lg:py-24">
        <h2
          style={{ fontFamily: "var(--v-display)" }}
          className="text-[clamp(2rem,4vw,3.5rem)] uppercase"
        >
          Osiem bloków, trzy dni
        </h2>
        <ul className="mt-10 grid gap-x-10 gap-y-8 sm:grid-cols-2 lg:grid-cols-4">
          {blocks.map(({ href, label, note }) => (
            <li key={href} className="border-t-2 border-[#ee7489] pt-4">
              <Link href={href} className="no-underline">
                <h3
                  style={{ fontFamily: "var(--v-display)" }}
                  className="text-2xl text-[#f3eee6] uppercase"
                >
                  {label}
                </h3>
                <p className="mt-2 text-sm text-[#f3eee6]/70">{note}</p>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="bg-[#ee7489] px-6 py-16 text-[#12143f] lg:px-12 lg:py-24">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <h2
            style={{ fontFamily: "var(--v-display)" }}
            className="text-[clamp(2rem,4vw,3.5rem)] uppercase"
          >
            Akredytacja
          </h2>
          <Link
            href="/akredytacja/"
            className="border-2 border-[#12143f] px-5 py-2.5 font-semibold tracking-wide uppercase no-underline"
          >
            Kup wejściówkę
          </Link>
        </div>
        <ul className="mt-10 grid gap-6 sm:grid-cols-3 lg:grid-cols-5">
          {accreditation.map(({ label, price }) => (
            <li key={label} className="border-t-2 border-[#12143f] pt-3">
              <p className="text-sm tracking-[0.16em] uppercase">{label}</p>
              <p style={{ fontFamily: "var(--v-display)" }} className="mt-1 text-3xl">
                {price}
              </p>
            </li>
          ))}
        </ul>
      </section>

      <section className="px-6 py-16 lg:px-12 lg:py-24">
        <h2
          style={{ fontFamily: "var(--v-display)" }}
          className="text-[clamp(2rem,4vw,3.5rem)] uppercase"
        >
          Ogłoszenia
        </h2>
        <ul className="mt-10 grid gap-8 md:grid-cols-3">
          {news.slice(0, 3).map((item) => (
            <li key={item.href}>
              <Link href={item.href} className="no-underline">
                <p className="text-sm text-[#ff9cb3]">{item.date}</p>
                <h3
                  style={{ fontFamily: "var(--v-display)" }}
                  className="mt-2 text-2xl text-[#f3eee6]"
                >
                  {item.title}
                </h3>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <footer className="border-t-4 border-[#ee7489] px-6 py-14 lg:px-12">
        <ul className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {partners.map(({ tier, names }) => (
            <li key={tier}>
              <p className="text-xs tracking-[0.2em] text-[#ff9cb3] uppercase">{tier}</p>
              <ul className="mt-2 space-y-1">
                {names.map((n) => (
                  <li key={n} className="text-[#f3eee6]/85">
                    {n}
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
        <p className="mt-12 text-sm text-[#f3eee6]/60">{con.organiser}</p>
      </footer>
    </div>
  );
}

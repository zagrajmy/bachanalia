import Image from "next/image";
import Link from "next/link";
import { Fira_Code, Unbounded } from "next/font/google";

import { accreditation, blocks, con, NewsItem, partnerNames as partners } from "../../content";

const unbounded = Unbounded({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "700"],
  variable: "--v-display",
});
const fira = Fira_Code({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500"],
  variable: "--v-body",
});

const GRID =
  "repeating-linear-gradient(0deg,transparent,transparent 39px,rgba(203,187,207,0.12) 39px,rgba(203,187,207,0.12) 40px)," +
  "repeating-linear-gradient(90deg,transparent,transparent 39px,rgba(203,187,207,0.12) 39px,rgba(203,187,207,0.12) 40px)";

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-baseline justify-between gap-6 border-b border-[#cbbbcf]/20 py-3">
      <span className="text-xs tracking-[0.22em] text-[#cbbbcf] uppercase">{k}</span>
      <span className="text-right text-sm text-[#f4f2f7] tabular-nums">{v}</span>
    </div>
  );
}

export function Atlas({ news, artSrc }: { news: NewsItem[]; artSrc: string }) {
  return (
    <div
      className={`${unbounded.variable} ${fira.variable} min-h-screen bg-[#080b28] text-[#f4f2f7]`}
      style={{ fontFamily: "var(--v-body)", backgroundImage: GRID }}
    >
      <header className="flex items-center justify-between gap-6 border-b border-[#cbbbcf]/25 px-6 py-4 lg:px-10">
        <span className="text-xs tracking-[0.3em] text-[#cbbbcf] uppercase">
          52°44′N 15°14′E · Zielona Góra
        </span>
        <Link
          href="/akredytacja/"
          className="border border-[#ee7489] px-4 py-2 text-xs tracking-[0.2em] text-[#ee7489] uppercase no-underline"
        >
          Akredytacja
        </Link>
      </header>

      <section className="grid items-center gap-10 px-6 py-16 lg:grid-cols-[1.05fr_0.95fr] lg:px-10 lg:py-24">
        <div>
          <p className="text-xs tracking-[0.3em] text-[#6d8fce] uppercase">
            Katalog {con.edition} · {con.rank}
          </p>
          <h1
            style={{ fontFamily: "var(--v-display)" }}
            className="mt-5 text-[clamp(2.5rem,6vw,5rem)] leading-[1.02] font-bold"
          >
            {con.name}
          </h1>
          <p className="mt-6 max-w-[52ch] text-[#cbbbcf]">
            Czterdziesta edycja. Trzy doby obserwacji, osiem bloków programowych, jeden kampus.
          </p>

          <dl className="mt-10 max-w-lg">
            <Row k="Termin" v={con.datesShort} />
            <Row k="Miejsce" v={con.venue} />
            <Row k="Adres" v={con.address} />
            <Row k="Frekwencja" v={con.attendance} />
          </dl>
        </div>

        <figure className="relative">
          <div className="absolute -inset-3 border border-[#cbbbcf]/25" />
          <Image
            src={artSrc}
            alt="Kosmiczny kogut na granatowym niebie, plakat XL Bachanaliów"
            width={1300}
            height={500}
            priority
            className="relative w-full object-cover"
          />
          <figcaption className="relative mt-4 text-xs tracking-[0.18em] text-[#cbbbcf] uppercase">
            Tabl. I · plakat edycji {con.edition}
          </figcaption>
        </figure>
      </section>

      <section className="border-t border-[#cbbbcf]/25 px-6 py-16 lg:px-10">
        <h2 className="text-xs tracking-[0.3em] text-[#6d8fce] uppercase">Efemeryda dnia</h2>
        <table className="mt-8 w-full text-sm">
          <thead>
            <tr className="border-b border-[#cbbbcf]/30 text-left text-xs tracking-[0.2em] text-[#cbbbcf] uppercase">
              <th className="py-3 font-normal">Dzień</th>
              <th className="py-3 font-normal">Otwarcie</th>
              <th className="py-3 font-normal">Zamknięcie budynku</th>
            </tr>
          </thead>
          <tbody>
            {con.hours.map(({ day, from }) => (
              <tr key={day} className="border-b border-[#cbbbcf]/15">
                <td className="py-3">{day}</td>
                <td className="py-3 tabular-nums">{from}</td>
                <td className="py-3 tabular-nums text-[#cbbbcf]">20:00</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="border-t border-[#cbbbcf]/25 px-6 py-16 lg:px-10">
        <h2 className="text-xs tracking-[0.3em] text-[#6d8fce] uppercase">Bloki programowe</h2>
        <ul className="mt-8 grid gap-x-10 sm:grid-cols-2">
          {blocks.map(({ href, label, note }, i) => (
            <li key={href} className="border-b border-[#cbbbcf]/15">
              <Link href={href} className="flex items-baseline gap-4 py-4 no-underline">
                <span className="text-xs text-[#6d8fce] tabular-nums">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="flex-1 text-[#f4f2f7]">{label}</span>
                <span className="hidden max-w-[24ch] text-right text-xs text-[#cbbbcf] sm:block">
                  {note}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="border-t border-[#cbbbcf]/25 px-6 py-16 lg:px-10">
        <div className="flex flex-wrap items-baseline justify-between gap-4">
          <h2 className="text-xs tracking-[0.3em] text-[#6d8fce] uppercase">Taryfa</h2>
          <Link href="/akredytacja/" className="text-sm text-[#ee7489] no-underline">
            Przejdź do sklepu →
          </Link>
        </div>
        <dl className="mt-8 max-w-2xl">
          {accreditation.map(({ label, price }) => (
            <Row key={label} k={label} v={price} />
          ))}
        </dl>
      </section>

      <section className="border-t border-[#cbbbcf]/25 px-6 py-16 lg:px-10">
        <h2 className="text-xs tracking-[0.3em] text-[#6d8fce] uppercase">Komunikaty</h2>
        <ul className="mt-8 space-y-4">
          {news.slice(0, 4).map((item) => (
            <li key={item.href}>
              <Link href={item.href} className="flex items-baseline gap-5 no-underline">
                <span className="text-xs text-[#cbbbcf] tabular-nums">{item.date}</span>
                <span className="text-[#f4f2f7]">{item.title}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <footer className="border-t border-[#cbbbcf]/25 px-6 py-12 lg:px-10">
        <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {partners.map(({ tier, names }) => (
            <li key={tier}>
              <p className="text-xs tracking-[0.2em] text-[#6d8fce] uppercase">{tier}</p>
              <p className="mt-2 text-sm text-[#cbbbcf]">{names.join(" · ")}</p>
            </li>
          ))}
        </ul>
        <p className="mt-10 text-xs tracking-[0.2em] text-[#cbbbcf] uppercase">{con.organiser}</p>
      </footer>
    </div>
  );
}

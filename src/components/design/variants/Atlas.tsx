import Image from "next/image";
import Link from "next/link";
import { Fira_Code, Unbounded } from "next/font/google";

import { accreditation, blocks, cityFunding, con, NewsItem, partners } from "../content";

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
  "repeating-linear-gradient(0deg,transparent,transparent 47px,rgba(203,187,207,0.09) 47px,rgba(203,187,207,0.09) 48px)," +
  "repeating-linear-gradient(90deg,transparent,transparent 47px,rgba(203,187,207,0.09) 47px,rgba(203,187,207,0.09) 48px)";

const DISPLAY = { fontFamily: "var(--v-display)" } as const;

/** con.dates = "25-27 września 2026", con.hours = piątek, sobota, niedziela */
const EPHEMERIS = con.hours.map((h, i) => ({
  n: String(i + 1).padStart(2, "0"),
  day: h.day,
  date: `${25 + i} IX 2026`,
  from: h.from,
}));

const SPEC = [
  { k: "Termin", v: con.datesShort },
  { k: "Miejsce", v: con.venue },
  { k: "Adres", v: con.address },
  { k: "Frekwencja", v: con.attendance },
];

function Tick({ className }: { className: string }) {
  return (
    <span aria-hidden className={`pointer-events-none absolute h-3 w-3 ${className}`}>
      <span className="absolute top-1/2 left-0 h-px w-full bg-[#cbbbcf]/60" />
      <span className="absolute top-0 left-1/2 h-full w-px bg-[#cbbbcf]/60" />
    </span>
  );
}

export function Atlas({ news, artSrc }: { news: NewsItem[]; artSrc: string }) {
  return (
    <div
      className={`${unbounded.variable} ${fira.variable} min-h-screen bg-[#080b28] text-[#f4f2f7]`}
      style={{ fontFamily: "var(--v-body)", backgroundImage: GRID }}
    >
      <header className="flex items-center justify-between gap-6 border-b border-[#cbbbcf]/25 px-6 py-4 lg:px-10">
        <span className="text-[0.6875rem] tracking-[0.28em] text-[#cbbbcf] uppercase">
          52°44′N 15°14′E
          <span className="hidden sm:inline"> · Zielona Góra</span>
        </span>
        <Link
          href="/akredytacja/"
          className="border border-[#ee7489] px-4 py-2 text-[0.6875rem] tracking-[0.2em] text-[#ee7489] uppercase no-underline transition-colors hover:bg-[#ee7489] hover:text-[#080b28]"
        >
          Akredytacja
        </Link>
      </header>
      <section className="overflow-hidden px-6 pt-[clamp(3.5rem,11vw,8rem)] pb-[clamp(2.5rem,6vw,4.5rem)] lg:px-10">
        <p className="text-[0.6875rem] tracking-[0.32em] text-[#8fa9dd] uppercase">
          Katalog {con.edition} · {con.rank}
        </p>
        <h1
          style={DISPLAY}
          className="mt-[clamp(1.5rem,4vw,3rem)] -ml-[0.03em] text-[clamp(2.5rem,10.4vw,10rem)] leading-[0.92] font-bold tracking-[-0.035em]"
        >
          Bachanalia
          <br />
          Fantastyczne
        </h1>
      </section>
      <figure className="relative mt-2 border-y border-[#cbbbcf]/25">
        <Tick className="-top-1.5 left-0" />
        <Tick className="-top-1.5 right-0" />
        <Tick className="-bottom-1.5 left-0" />
        <Tick className="-bottom-1.5 right-0" />
        <Image
          src={artSrc}
          alt="Plakat XL Bachanaliów Fantastycznych: kogut o pióropuszu z gwiazd na granatowym nocnym niebie, obok logo Polconu i data konwentu"
          width={1300}
          height={500}
          priority
          sizes="100vw"
          className="block h-auto w-full"
        />
        <figcaption className="grid grid-cols-1 gap-x-8 gap-y-1 border-t border-[#cbbbcf]/25 px-6 py-4 text-[0.6875rem] tracking-[0.18em] text-[#cbbbcf] uppercase sm:grid-cols-[auto_1fr_auto] lg:px-10">
          <span className="text-[#f4f2f7]">Tabl. I</span>
          <span>Plakat edycji {con.edition}</span>
          <span className="tabular-nums sm:text-right">{con.datesShort}</span>
        </figcaption>
      </figure>
      <section aria-labelledby="spec" className="border-b border-[#cbbbcf]/25">
        <h2 id="spec" className="sr-only">
          Specyfikacja konwentu
        </h2>
        <dl className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          {SPEC.map(({ k, v }, i) => (
            <div
              key={k}
              className={`px-6 py-5 lg:px-10 ${i > 0 ? "border-t border-[#cbbbcf]/15 sm:border-t-0 sm:border-l" : ""} ${i === 1 ? "sm:border-t-0" : ""} ${i === 2 ? "sm:border-t sm:border-l-0 lg:border-t-0 lg:border-l" : ""} ${i === 3 ? "sm:border-t lg:border-t-0" : ""} `}
            >
              <dt className="text-[0.625rem] tracking-[0.24em] text-[#8fa9dd] uppercase">{k}</dt>
              <dd className="mt-2 text-sm leading-snug text-[#f4f2f7] tabular-nums">{v}</dd>
            </div>
          ))}
        </dl>
      </section>
      <section className="border-b border-[#cbbbcf]/25 px-6 py-10 lg:px-10 lg:py-12">
        <div className="flex flex-wrap items-baseline justify-between gap-x-8 gap-y-2">
          <h2 className="text-[0.6875rem] tracking-[0.3em] text-[#8fa9dd] uppercase">
            Efemeryda dnia
          </h2>
          <p className="text-[0.6875rem] tracking-[0.2em] text-[#cbbbcf] uppercase">
            Godziny otwarcia akredytacji
          </p>
        </div>

        <div className="-mx-6 mt-6 overflow-x-auto px-6 lg:-mx-10 lg:px-10">
          <table className="w-full min-w-[20rem] border-collapse text-sm">
            <caption className="sr-only">
              Godziny otwarcia akredytacji w kolejnych dobach konwentu
            </caption>
            <thead>
              <tr className="border-y border-[#cbbbcf]/30 text-left text-[0.625rem] tracking-[0.22em] text-[#cbbbcf] uppercase">
                <th scope="col" className="w-12 py-2 font-normal sm:w-16">
                  Doba
                </th>
                <th scope="col" className="py-2 font-normal">
                  Dzień
                </th>
                <th scope="col" className="py-2 font-normal">
                  Data
                </th>
                <th scope="col" className="py-2 text-right font-normal">
                  Otwarcie
                </th>
              </tr>
            </thead>
            <tbody>
              {EPHEMERIS.map(({ n, day, date, from }) => (
                <tr key={day} className="border-b border-[#cbbbcf]/15">
                  <td className="py-2.5 text-[#8fa9dd] tabular-nums">{n}</td>
                  <td className="py-2.5 text-[#f4f2f7]">{day}</td>
                  <td className="py-2.5 text-[#cbbbcf] tabular-nums">{date}</td>
                  <td
                    style={DISPLAY}
                    className="py-2.5 text-right text-lg text-[#f4f2f7] tabular-nums"
                  >
                    {from}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      <section className="relative overflow-hidden border-b border-[#cbbbcf]/25 px-6 py-[clamp(4.5rem,14vw,11rem)] lg:px-10">
        <span
          aria-hidden
          style={{ ...DISPLAY, WebkitTextStroke: "1.5px rgba(143,169,221,0.42)" }}
          className="pointer-events-none absolute -right-[0.22em] -bottom-[0.34em] text-[clamp(11rem,34vw,30rem)] leading-none font-bold text-transparent"
        >
          {con.edition}
        </span>
        <p className="relative text-[0.6875rem] tracking-[0.3em] text-[#8fa9dd] uppercase">Nota</p>
        <p
          style={DISPLAY}
          className="relative mt-6 max-w-[20ch] text-[clamp(1.35rem,4.4vw,3rem)] leading-[1.12] tracking-[-0.02em] text-[#f4f2f7]"
        >
          Czterdziesta edycja. Trzy doby obserwacji, osiem bloków programowych, jeden kampus.
        </p>
      </section>
      <section className="border-b border-[#cbbbcf]/25 px-6 py-14 lg:px-10 lg:py-20">
        <div className="flex flex-wrap items-baseline justify-between gap-x-8 gap-y-2">
          <h2 className="text-[0.6875rem] tracking-[0.3em] text-[#8fa9dd] uppercase">
            Bloki programowe
          </h2>
          <p className="text-[0.6875rem] tracking-[0.2em] text-[#cbbbcf] uppercase tabular-nums">
            Poz. 01-{String(blocks.length).padStart(2, "0")}
          </p>
        </div>

        <ul className="mt-8 border-t border-[#cbbbcf]/25">
          {blocks.map(({ href, label, note }, i) => (
            <li key={href} className="border-b border-[#cbbbcf]/15">
              <Link
                href={href}
                className="group grid grid-cols-[2.75rem_minmax(0,1fr)] items-baseline gap-x-4 py-5 no-underline md:grid-cols-[4.5rem_minmax(0,1fr)_minmax(0,26ch)] md:gap-x-8 md:py-6"
              >
                <span
                  style={DISPLAY}
                  className="text-sm text-[#8fa9dd] tabular-nums transition-colors group-hover:text-[#ee7489]"
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span
                  style={DISPLAY}
                  className="text-[clamp(1.1rem,2.6vw,1.75rem)] leading-tight tracking-[-0.02em] text-[#f4f2f7] transition-colors group-hover:text-[#ee7489]"
                >
                  {label}
                </span>
                <span className="col-start-2 mt-1.5 text-xs leading-relaxed text-[#cbbbcf] md:col-start-3 md:mt-0 md:text-right">
                  {note}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
      <section className="border-b border-[#cbbbcf]/25 px-6 py-10 lg:px-10 lg:py-12">
        <div className="flex flex-wrap items-baseline justify-between gap-x-8 gap-y-2">
          <h2 className="text-[0.6875rem] tracking-[0.3em] text-[#8fa9dd] uppercase">Taryfa</h2>
          <Link
            href="/akredytacja/"
            className="text-[0.6875rem] tracking-[0.2em] text-[#ee7489] uppercase no-underline hover:underline"
          >
            Przejdź do sklepu →
          </Link>
        </div>

        <dl className="mt-6 border-t border-[#cbbbcf]/30">
          {accreditation.map(({ label, price }) => {
            const pop = label === "Golden Ticket";
            return (
              <div
                key={label}
                className="flex items-baseline justify-between gap-6 border-b border-[#cbbbcf]/15 py-2.5"
              >
                <dt
                  className={`text-[0.6875rem] tracking-[0.22em] uppercase ${pop ? "text-[#ee7489]" : "text-[#cbbbcf]"}`}
                >
                  {label}
                </dt>
                <dd
                  style={DISPLAY}
                  className={`text-right text-lg tabular-nums ${pop ? "text-[#ee7489]" : "text-[#f4f2f7]"}`}
                >
                  {price}
                </dd>
              </div>
            );
          })}
        </dl>
      </section>
      <section className="border-b border-[#cbbbcf]/25 px-6 py-14 lg:px-10 lg:py-16">
        <h2 className="text-[0.6875rem] tracking-[0.3em] text-[#8fa9dd] uppercase">Komunikaty</h2>
        <ul className="mt-6">
          {news.slice(0, 4).map((item) => (
            <li key={item.href} className="border-b border-[#cbbbcf]/15">
              <Link
                href={item.href}
                className="group grid grid-cols-1 items-baseline gap-x-6 py-3.5 no-underline sm:grid-cols-[8rem_minmax(0,1fr)]"
              >
                <span className="text-[0.6875rem] tracking-[0.14em] text-[#cbbbcf] uppercase tabular-nums">
                  {item.date}
                </span>
                <span className="mt-1 text-[#f4f2f7] transition-colors group-hover:text-[#ee7489] sm:mt-0">
                  {item.title}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <footer className="px-6 py-12 lg:px-10 lg:py-14">
        <h2 className="text-[0.6875rem] tracking-[0.3em] text-[#8fa9dd] uppercase">Wykaz</h2>
        <ul className="mt-6 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {partners.map(({ tier, logos }) => (
            <li key={tier} className="border-t border-[#cbbbcf]/25 pt-4">
              <p className="text-[0.625rem] tracking-[0.24em] text-[#8fa9dd] uppercase">{tier}</p>
              <ul className="mt-4 flex flex-wrap gap-x-6 gap-y-5">
                {logos.map(({ name, src, width, height, needsPlate }) => (
                  <li key={name} className="max-w-full">
                    <div
                      className={`flex h-16 min-w-[9rem] items-center justify-center border border-[#cbbbcf]/25 px-4 ${needsPlate ? "bg-[#f4f2f7]" : "bg-[#0d1234]"}`}
                    >
                      <Image
                        src={src}
                        alt={name}
                        width={width}
                        height={height}
                        className="h-9 w-auto max-w-[11rem] object-contain"
                      />
                    </div>
                    <p className="mt-2 text-[0.625rem] tracking-[0.16em] text-[#cbbbcf] uppercase">
                      {name}
                    </p>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
        <p className="mt-10 border-t border-[#cbbbcf]/25 pt-4 text-xs leading-relaxed text-[#cbbbcf]">
          {cityFunding.name}
        </p>
        <p className="mt-8 text-[0.6875rem] tracking-[0.24em] text-[#cbbbcf] uppercase">
          {con.organiser} · 52°44′N 15°14′E
        </p>
      </footer>
    </div>
  );
}

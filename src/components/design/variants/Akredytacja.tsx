import Image from "next/image";
import Link from "next/link";
import { Bebas_Neue, Familjen_Grotesk } from "next/font/google";

import { accreditation, blocks, con, NewsItem, partners } from "../content";

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

const PERFORATION =
  "radial-gradient(circle at 50% 50%, #191f5c 0 3px, transparent 3px) 0 0 / 14px 14px repeat-x";

function Stub({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative rounded-lg bg-[#f4f2f7] text-[#191f5c]">
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-[7px]"
        style={{ background: PERFORATION }}
      />
      {children}
    </div>
  );
}

export function Akredytacja({ news, artSrc }: { news: NewsItem[]; artSrc: string }) {
  return (
    <div
      className={`${bebas.variable} ${familjen.variable} min-h-screen bg-[#191f5c] text-[#f4f2f7]`}
      style={{ fontFamily: "var(--v-body)" }}
    >
      <header className="flex items-center justify-between gap-4 px-6 py-4 lg:px-10">
        <span
          style={{ fontFamily: "var(--v-display)" }}
          className="text-xl tracking-[0.14em] text-[#ee7489]"
        >
          Ad Astra
        </span>
        <Link
          href="/akredytacja/"
          className="rounded-full bg-[#ee7489] px-5 py-2 text-sm font-semibold text-[#191f5c] no-underline"
        >
          Kup akredytację
        </Link>
      </header>

      <section className="px-6 pb-14 lg:px-10">
        <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="overflow-hidden rounded-2xl bg-[#151b50]">
            <Image
              src={artSrc}
              alt="Kosmiczny kogut na granatowym niebie, plakat XL Bachanaliów"
              width={1300}
              height={500}
              priority
              className="w-full object-cover"
            />
            <div className="p-7">
              <p className="text-xs tracking-[0.24em] text-[#ff9cb3] uppercase">
                {con.rank} · {con.attendance}
              </p>
              <h1
                style={{ fontFamily: "var(--v-display)" }}
                className="mt-3 text-[clamp(2.5rem,6vw,4.5rem)] leading-[0.95] tracking-[0.02em]"
              >
                {con.name} {con.edition}
              </h1>
              <p className="mt-4 max-w-[46ch] text-[#cbbbcf]">
                {con.dates}. {con.venue}, {con.address}.
              </p>
            </div>
          </div>

          <Stub>
            <div className="p-7 pt-9">
              <p className="text-xs tracking-[0.24em] uppercase opacity-70">Wejściówka</p>
              <p style={{ fontFamily: "var(--v-display)" }} className="mt-2 text-5xl">
                {con.edition} · {con.datesShort}
              </p>

              <dl className="mt-7 space-y-3">
                {accreditation.map(({ label, price }) => (
                  <div
                    key={label}
                    className="flex items-baseline justify-between border-b border-dashed border-[#191f5c]/30 pb-2"
                  >
                    <dt className="text-sm">{label}</dt>
                    <dd style={{ fontFamily: "var(--v-display)" }} className="text-2xl">
                      {price}
                    </dd>
                  </div>
                ))}
              </dl>

              <Link
                href="/akredytacja/"
                className="mt-7 block rounded-full bg-[#191f5c] px-5 py-3 text-center font-semibold text-[#f4f2f7] no-underline"
              >
                Przejdź do sklepu
              </Link>
              <p className="mt-3 text-center text-xs opacity-60">
                Sprzedaż prowadzi sklep konwentu. Płatność przez Paynow.
              </p>
            </div>
          </Stub>
        </div>
      </section>

      <section className="px-6 py-14 lg:px-10">
        <div className="mx-auto max-w-6xl">
          <h2 style={{ fontFamily: "var(--v-display)" }} className="text-3xl tracking-[0.06em]">
            Co dostajesz
          </h2>
          <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {blocks.map(({ href, label, note }) => (
              <li key={href}>
                <Link
                  href={href}
                  className="block h-full rounded-xl border border-[#cbbbcf]/25 p-5 no-underline"
                >
                  <p style={{ fontFamily: "var(--v-display)" }} className="text-xl text-[#f4f2f7]">
                    {label}
                  </p>
                  <p className="mt-2 text-sm text-[#cbbbcf]">{note}</p>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="px-6 py-14 lg:px-10">
        <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-3">
          {con.hours.map(({ day, from }) => (
            <div key={day} className="rounded-xl bg-[#151b50] p-6">
              <p className="text-xs tracking-[0.2em] text-[#ff9cb3] uppercase">{day}</p>
              <p style={{ fontFamily: "var(--v-display)" }} className="mt-2 text-4xl">
                od {from}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="px-6 py-14 lg:px-10">
        <div className="mx-auto max-w-6xl">
          <h2 style={{ fontFamily: "var(--v-display)" }} className="text-3xl tracking-[0.06em]">
            Aktualności
          </h2>
          <ul className="mt-8 grid gap-6 md:grid-cols-3">
            {news.slice(0, 3).map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="no-underline">
                  <p className="text-sm text-[#ff9cb3]">{item.date}</p>
                  <p
                    style={{ fontFamily: "var(--v-display)" }}
                    className="mt-1 text-2xl text-[#f4f2f7]"
                  >
                    {item.title}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <footer className="mt-6 border-t border-[#cbbbcf]/20 px-6 py-12 lg:px-10">
        <ul className="mx-auto grid max-w-6xl gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {partners.map(({ tier, names }) => (
            <li key={tier}>
              <p className="text-xs tracking-[0.2em] text-[#ff9cb3] uppercase">{tier}</p>
              <p className="mt-2 text-sm text-[#cbbbcf]">{names.join(" · ")}</p>
            </li>
          ))}
        </ul>
        <p className="mx-auto mt-10 max-w-6xl text-sm text-[#cbbbcf]">{con.organiser}</p>
      </footer>
    </div>
  );
}

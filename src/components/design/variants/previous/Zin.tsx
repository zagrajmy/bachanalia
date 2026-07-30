import Image, { type StaticImageData } from "next/image";
import Link from "next/link";
import { Archivo_Black, Courier_Prime } from "next/font/google";

import { accreditation, blocks, con, NewsItem, partnerNames as partners } from "@/content/con";

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

export function Zin({ news, artSrc }: { news: NewsItem[]; artSrc: StaticImageData }) {
  return (
    <div
      className={`${archivo.variable} ${courier.variable} min-h-screen bg-[#efe9dc] text-[#141642]`}
      style={{ fontFamily: "var(--v-body)", backgroundImage: PAPER }}
    >
      <header className="flex items-center justify-between gap-4 border-b-[3px] border-[#141642] px-5 py-3">
        <span className="text-xs tracking-[0.2em] uppercase">nr 40 · 2026 · egz. bezpłatny</span>
        <Link
          href="/akredytacja/"
          className="bg-[#141642] px-3 py-1.5 text-xs tracking-[0.16em] text-[#efe9dc] uppercase no-underline"
        >
          Akredytacja
        </Link>
      </header>

      <section className="border-b-[3px] border-[#141642] px-5 py-8">
        <h1
          style={{ fontFamily: "var(--v-display)" }}
          className="relative text-[clamp(2.6rem,11vw,7rem)] leading-[0.82] uppercase"
        >
          <span
            aria-hidden="true"
            className="absolute inset-0 translate-x-[0.055em] translate-y-[0.045em] text-[#ee7489] mix-blend-multiply"
          >
            Bachanalia
            <br />
            Fantastyczne {con.edition}
          </span>
          <span className="relative block">
            Bachanalia
            <br />
            Fantastyczne {con.edition}
          </span>
        </h1>
        <p className="mt-6 max-w-[54ch] text-sm leading-relaxed">
          {con.dates} · {con.venue}, {con.address}. Organizuje {con.organiser}. Ranga {con.rank}.
        </p>
      </section>

      <section className="grid border-b-[3px] border-[#141642] md:grid-cols-2">
        <figure className="border-b-[3px] border-[#141642] md:border-r-[3px] md:border-b-0">
          <Image
            src={artSrc}
            alt="Kosmiczny kogut na granatowym niebie, plakat XL Bachanaliów"
            priority
            className="w-full object-cover contrast-125 saturate-150"
          />
          <figcaption className="border-t-[3px] border-[#141642] px-5 py-2 text-xs uppercase">
            okładka numeru
          </figcaption>
          <div className="border-t-[3px] border-[#141642] px-5 py-4 text-xs leading-relaxed">
            <p className="font-bold uppercase">Stopka redakcyjna</p>
            <p className="mt-1">
              Wydaje {con.organiser}. Ranga {con.rank}. Nakład zależny od frekwencji:{" "}
              {con.attendance}.
            </p>
          </div>
        </figure>
        <ul className="divide-y-[3px] divide-[#141642]">
          {con.hours.map(({ day, from }) => (
            <li key={day} className="flex items-baseline justify-between px-5 py-6">
              <span className="text-sm tracking-[0.16em] uppercase">{day}</span>
              <span style={{ fontFamily: "var(--v-display)" }} className="text-3xl">
                {from}
              </span>
            </li>
          ))}
          <li className="bg-[#ee7489] px-5 py-6 text-sm">
            Budynek zamykamy o 20:00. W piątek i sobotę kończymy w knajpie konwentowej.
          </li>
        </ul>
      </section>

      <section className="border-b-[3px] border-[#141642] px-5 py-10">
        <h2 style={{ fontFamily: "var(--v-display)" }} className="text-3xl uppercase">
          Spis treści
        </h2>
        <ol className="mt-6 space-y-0">
          {blocks.map(({ href, label, note }, i) => (
            <li key={href} className="border-b border-dashed border-[#141642]/50">
              <Link href={href} className="flex items-baseline gap-3 py-3 no-underline">
                <span className="w-6 text-sm">{i + 1}.</span>
                <span className="flex-1 text-sm font-bold tracking-wide uppercase">{label}</span>
                <span className="hidden text-xs sm:block">{note}</span>
              </Link>
            </li>
          ))}
        </ol>
      </section>

      <section className="border-b-[3px] border-[#141642] bg-[#141642] px-5 py-10 text-[#efe9dc]">
        <h2 style={{ fontFamily: "var(--v-display)" }} className="text-3xl uppercase">
          Cennik wejściówek
        </h2>
        <ul className="mt-6 grid gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {accreditation.map(({ label, price }) => (
            <li key={label} className="border-2 border-[#efe9dc] px-3 py-4">
              <p className="text-xs tracking-[0.16em] uppercase">{label}</p>
              <p
                style={{ fontFamily: "var(--v-display)" }}
                className="mt-1 text-2xl text-[#ee7489]"
              >
                {price}
              </p>
            </li>
          ))}
        </ul>
      </section>

      <section className="border-b-[3px] border-[#141642] px-5 py-10">
        <h2 style={{ fontFamily: "var(--v-display)" }} className="text-3xl uppercase">
          Z ostatniej chwili
        </h2>
        <ul className="mt-6 space-y-4">
          {news.slice(0, 3).map((item) => (
            <li key={item.href} className="border-l-4 border-[#ee7489] pl-4">
              <Link href={item.href} className="no-underline">
                <p className="text-xs uppercase">{item.date}</p>
                <p className="text-sm font-bold">{item.title}</p>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <footer className="px-5 py-10 text-xs">
        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {partners.map(({ tier, names }) => (
            <li key={tier}>
              <p className="font-bold tracking-[0.16em] uppercase">{tier}</p>
              <p className="mt-1">{names.join(", ")}</p>
            </li>
          ))}
        </ul>
        <p className="mt-8 border-t-[3px] border-[#141642] pt-4 uppercase">{con.organiser}</p>
      </footer>
    </div>
  );
}

import Image, { type StaticImageData } from "next/image";
import Link from "next/link";
import { Silkscreen, VT323 } from "next/font/google";

import { accreditation, blocks, con, NewsItem, partnerNames as partners } from "@/content/con";

const silkscreen = Silkscreen({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "700"],
  variable: "--v-display",
});
const vt = VT323({ subsets: ["latin", "latin-ext"], weight: "400", variable: "--v-body" });

const SCANLINES =
  "repeating-linear-gradient(0deg,rgba(0,0,0,0.30),rgba(0,0,0,0.30) 1px,transparent 1px,transparent 3px)";

const BARS = ["#ee7489", "#ff9cb3", "#cbbbcf", "#6d8fce", "#3f6bbc", "#263b87"];

export function Demoscena({ news, artSrc }: { news: NewsItem[]; artSrc: StaticImageData }) {
  return (
    <div
      className={`${silkscreen.variable} ${vt.variable} relative min-h-screen bg-[#0b0d33] text-[#cbe3ff]`}
      style={{ fontFamily: "var(--v-body)", fontSize: "1.35rem", lineHeight: 1.35 }}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-50 opacity-60"
        style={{ backgroundImage: SCANLINES }}
      />

      <div className="flex" aria-hidden="true">
        {BARS.map((c) => (
          <div key={c} className="h-3 flex-1" style={{ background: c }} />
        ))}
      </div>

      <header className="flex items-center justify-between gap-4 border-b-2 border-[#3f6bbc] px-5 py-3">
        <span style={{ fontFamily: "var(--v-display)" }} className="text-[0.7rem] text-[#ff9cb3]">
          AD ASTRA / 1986-2026
        </span>
        <Link
          href="/akredytacja/"
          style={{ fontFamily: "var(--v-display)" }}
          className="bg-[#ee7489] px-3 py-1.5 text-[0.7rem] text-[#0b0d33] no-underline"
        >
          AKREDYTACJA
        </Link>
      </header>

      <section className="px-5 py-10 lg:px-10">
        <p style={{ fontFamily: "var(--v-display)" }} className="text-[0.7rem] text-[#6d8fce]">
          LOADING {con.edition}...
        </p>
        <h1
          style={{ fontFamily: "var(--v-display)" }}
          className="mt-4 text-[clamp(1.5rem,5vw,3.5rem)] leading-[1.15] text-[#ff9cb3]"
        >
          BACHANALIA
          <br />
          FANTASTYCZNE {con.edition}
        </h1>

        <div className="mt-6 border-2 border-[#3f6bbc] p-1">
          <div className="h-4 w-[86%] bg-[#ee7489]" />
        </div>
        <p className="mt-2 text-[#6d8fce]">READY. 86% — {con.dates}</p>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <Image
            src={artSrc}
            alt="Kosmiczny kogut na granatowym niebie, plakat XL Bachanaliów"
            priority
            className="w-full border-2 border-[#3f6bbc] object-cover"
          />
          <dl className="border-2 border-[#3f6bbc] p-4">
            {[
              ["MIEJSCE", con.venue],
              ["ADRES", con.address],
              ["RANGA", con.rank],
              ["FREKWENCJA", con.attendance],
            ].map(([k, v]) => (
              <div key={k} className="flex gap-3 border-b border-[#3f6bbc]/40 py-2 last:border-0">
                <dt
                  style={{ fontFamily: "var(--v-display)" }}
                  className="w-28 text-[0.62rem] text-[#6d8fce]"
                >
                  {k}
                </dt>
                <dd className="flex-1">{v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className="border-t-2 border-[#3f6bbc] px-5 py-10 lg:px-10">
        <h2 style={{ fontFamily: "var(--v-display)" }} className="text-[0.85rem] text-[#ff9cb3]">
          &gt; DIR PROGRAM
        </h2>
        <ul className="mt-5">
          {blocks.map(({ href, label, note }, i) => (
            <li key={href}>
              <Link
                href={href}
                className="flex items-baseline gap-3 border-b border-[#3f6bbc]/40 py-2 no-underline"
              >
                <span className="text-[#6d8fce]">{String(i + 1).padStart(2, "0")}</span>
                <span className="flex-1 text-[#cbe3ff] uppercase">{label}</span>
                <span className="hidden text-[#6d8fce] sm:block">{note}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="border-t-2 border-[#3f6bbc] px-5 py-10 lg:px-10">
        <h2 style={{ fontFamily: "var(--v-display)" }} className="text-[0.85rem] text-[#ff9cb3]">
          &gt; PRICE LIST
        </h2>
        <ul className="mt-5 grid gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {accreditation.map(({ label, price }) => (
            <li key={label} className="border-2 border-[#3f6bbc] px-3 py-3">
              <p className="text-[#6d8fce] uppercase">{label}</p>
              <p
                style={{ fontFamily: "var(--v-display)" }}
                className="mt-1 text-base text-[#ee7489]"
              >
                {price}
              </p>
            </li>
          ))}
        </ul>
      </section>

      <section className="border-t-2 border-[#3f6bbc] px-5 py-10 lg:px-10">
        <h2 style={{ fontFamily: "var(--v-display)" }} className="text-[0.85rem] text-[#ff9cb3]">
          &gt; NEWS
        </h2>
        <ul className="mt-5 space-y-2">
          {news.slice(0, 4).map((item) => (
            <li key={item.href}>
              <Link href={item.href} className="flex gap-3 no-underline">
                <span className="text-[#6d8fce]">[{item.date}]</span>
                <span className="text-[#cbe3ff]">{item.title}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <footer className="border-t-2 border-[#3f6bbc] px-5 py-8 lg:px-10">
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {partners.map(({ tier, names }) => (
            <li key={tier}>
              <p
                style={{ fontFamily: "var(--v-display)" }}
                className="text-[0.62rem] text-[#6d8fce]"
              >
                {tier.toUpperCase()}
              </p>
              <p className="mt-1">{names.join(" / ")}</p>
            </li>
          ))}
        </ul>
        <p className="mt-8 text-[#6d8fce]">{con.organiser.toUpperCase()}</p>
      </footer>
    </div>
  );
}

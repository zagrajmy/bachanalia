import Image from "next/image";
import Link from "next/link";
import { Silkscreen, VT323 } from "next/font/google";

import { accreditation, blocks, cityFunding, con, NewsItem, partners } from "../content";

const silkscreen = Silkscreen({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "700"],
  variable: "--v-display",
});
const vt = VT323({ subsets: ["latin", "latin-ext"], weight: "400", variable: "--v-body" });

const DISPLAY = { fontFamily: "var(--v-display)" } as const;
const BODY = { fontFamily: "var(--v-body)" } as const;

const OUTSIDE_BITMAP = /[^ -~]/;

/** Silkscreen carries no Polish diacritics, so those strings render in the terminal face. */
function Bitmap({ children, className = "" }: { children: string; className?: string }) {
  const drawable = !OUTSIDE_BITMAP.test(children);
  return (
    <span className={className}>
      <span
        style={drawable ? DISPLAY : BODY}
        className={drawable ? undefined : "text-[1.45em] tracking-[0.12em]"}
      >
        {children}
      </span>
    </span>
  );
}

const SCANLINES = [
  "repeating-linear-gradient(0deg,rgba(0,0,0,0.55) 0px,rgba(0,0,0,0.55) 1px,rgba(0,0,0,0) 1px,rgba(0,0,0,0) 3px)",
  "repeating-linear-gradient(90deg,rgba(0,0,0,0.1) 0px,rgba(0,0,0,0.1) 1px,rgba(0,0,0,0) 1px,rgba(0,0,0,0) 3px)",
].join(",");

const BARS = [
  "#ffd9e2",
  "#ff9cb3",
  "#ee7489",
  "#cbbbcf",
  "#8fb0e8",
  "#6d8fce",
  "#3f6bbc",
  "#263b87",
];

const CURSOR_CSS = `
@keyframes demoscena-blink { 0%,49% { opacity: 1 } 50%,100% { opacity: 0 } }
.demoscena-cursor { animation: demoscena-blink 1.06s step-end infinite }
@media (prefers-reduced-motion: reduce) { .demoscena-cursor { animation: none } }
`;

function Cursor() {
  return (
    <span
      aria-hidden="true"
      className="demoscena-cursor ml-1 inline-block h-[0.9em] w-[0.55em] translate-y-[0.08em] bg-[#ff9cb3]"
    />
  );
}

function ColourBars({ className = "" }: { className?: string }) {
  return (
    <div className={`flex ${className}`} aria-hidden="true">
      {BARS.map((c) => (
        <div key={c} className="flex-1" style={{ background: c }} />
      ))}
    </div>
  );
}

export function Demoscena({ news, artSrc }: { news: NewsItem[]; artSrc: string }) {
  const facts: [string, string][] = [
    ["MIEJSCE", con.venue],
    ["ADRES", con.address],
    ["RANGA", con.rank],
    ["FREKWENCJA", con.attendance],
    ["START", con.hours.map(({ day, from }) => `${day} ${from}`).join(" / ")],
  ];

  return (
    <div
      className={`${silkscreen.variable} ${vt.variable} min-h-screen bg-[#04051a] p-2.5 sm:p-4`}
      style={{ ...BODY, fontSize: "1.35rem", lineHeight: 1.3 }}
    >
      <style>{CURSOR_CSS}</style>

      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-50"
        style={{ backgroundImage: SCANLINES }}
      />

      <div className="relative overflow-hidden rounded-lg bg-[#0b0d33] text-[#cbe3ff] shadow-[inset_0_0_90px_rgba(0,0,0,0.6)]">
        <ColourBars className="h-2.5 sm:h-3.5" />

        <header className="flex items-center justify-between gap-4 border-b border-[#3f6bbc]/60 px-5 py-3 sm:px-8 lg:px-12">
          <Bitmap className="text-[0.62rem] text-[#9db8ea] sm:text-[0.7rem]">
            AD ASTRA / 1986-2026
          </Bitmap>
          <Link
            href="/akredytacja/"
            style={DISPLAY}
            className="bg-[#ff9cb3] px-3 py-1.5 text-[0.62rem] text-[#0b0d33] no-underline sm:text-[0.7rem]"
          >
            AKREDYTACJA
          </Link>
        </header>

        <section className="px-5 pt-10 pb-8 sm:px-8 sm:pt-14 lg:px-12">
          <div className="text-[#9db8ea]">
            <p>LOAD &quot;BACHANALIA&quot;,8,1</p>
            <p>SEARCHING FOR BACHANALIA</p>
            <p>LOADING</p>
          </div>

          <h1
            style={{ ...DISPLAY, textShadow: "0 0 24px rgba(255,156,179,0.35)" }}
            className="-mx-5 mt-6 leading-[0.84] whitespace-nowrap text-[clamp(2.9rem,14.1vw,15rem)] sm:-mx-8 lg:-mx-12"
          >
            <span className="-ml-[0.11em] block text-[#ff9cb3]">BACHANALIA</span>{" "}
            <span className="-ml-[0.11em] block text-[#cbe3ff]">FANTASTYCZNE</span>{" "}
            <span className="mt-5 ml-5 flex items-center gap-5 text-[0.3em] text-[#9db8ea] sm:ml-8 lg:ml-12">
              <span>XL</span>
              <ColourBars className="h-[0.42em] flex-1" />
            </span>
          </h1>

          <p className="mt-6 text-[#cbe3ff]">
            <Bitmap className="text-[0.62rem] text-[#ff9cb3] sm:text-[0.7rem]">
              {`${con.rank.toUpperCase()} / ${con.datesShort}`}
            </Bitmap>
            <Cursor />
          </p>
        </section>

        <Image
          src={artSrc}
          alt="Kosmiczny kogut w rozgwieżdżonym niebie, plakat XL Bachanaliów Fantastycznych"
          width={1300}
          height={500}
          priority
          sizes="100vw"
          className="block h-[74vw] w-full object-cover object-right sm:h-auto"
        />

        <section
          aria-label="Informacje praktyczne"
          className="grid grid-cols-2 border-y border-[#3f6bbc]/60 sm:grid-cols-3 lg:grid-cols-5"
        >
          {facts.map(([key, value]) => (
            <div
              key={key}
              className="border-r border-b border-[#3f6bbc]/30 px-5 py-4 last:border-r-0 sm:px-6 lg:border-b-0"
            >
              <Bitmap className="text-[0.62rem] text-[#9db8ea]">{key}</Bitmap>
              <p className="mt-1.5 text-[1.15rem] leading-tight text-[#cbe3ff]">{value}</p>
            </div>
          ))}
        </section>

        <section className="px-5 py-12 sm:px-8 lg:px-12">
          <div className="flex items-baseline justify-between gap-4">
            <h2 style={DISPLAY} className="text-[0.8rem] text-[#ff9cb3] sm:text-[0.95rem]">
              &gt; DIR PROGRAM
            </h2>
            <Bitmap className="text-[0.62rem] text-[#9db8ea]">{`${blocks.length} POZYCJI`}</Bitmap>
          </div>

          <div className="mt-4 flex h-2" aria-hidden="true">
            {blocks.map((block, i) => (
              <div
                key={block.href}
                className="flex-1 border-r-2 border-[#0b0d33] last:border-r-0"
                style={{ background: BARS[i % BARS.length] }}
              />
            ))}
          </div>

          <ul className="mt-6 border-t border-[#3f6bbc]/30">
            {blocks.map(({ href, label, note }, i) => (
              <li key={href} className="border-b border-[#3f6bbc]/30">
                <Link
                  href={href}
                  className="group flex items-baseline gap-3 px-2 py-1.5 leading-tight no-underline hover:bg-[#ff9cb3] hover:text-[#0b0d33] focus-visible:bg-[#ff9cb3] focus-visible:text-[#0b0d33] focus-visible:outline-none"
                >
                  <span
                    style={DISPLAY}
                    className="text-[0.62rem] text-[#9db8ea] group-hover:text-[#0b0d33] group-focus-visible:text-[#0b0d33]"
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="flex-1 uppercase">{label}</span>
                  <span className="hidden text-right text-[#9db8ea] group-hover:text-[#0b0d33] group-focus-visible:text-[#0b0d33] sm:block">
                    {note}
                  </span>
                </Link>
              </li>
            ))}
          </ul>

          <p className="mt-5 text-[#9db8ea]">
            READY.
            <Cursor />
          </p>
        </section>

        <section className="bg-[#ff9cb3] px-5 py-12 text-[#0b0d33] sm:px-8 lg:px-12">
          <div className="flex flex-wrap items-baseline justify-between gap-4">
            <h2 style={DISPLAY} className="text-[0.8rem] sm:text-[0.95rem]">
              &gt; AKREDYTACJA
            </h2>
            <Link
              href="/akredytacja/"
              style={DISPLAY}
              className="bg-[#0b0d33] px-4 py-2 text-[0.62rem] text-[#ffd9e2] no-underline sm:text-[0.7rem]"
            >
              ZAPISY ONLINE
            </Link>
          </div>

          <ul className="mt-8 grid grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-3 lg:grid-cols-5">
            {accreditation.map(({ label, price }) => {
              const [amount, ...unit] = price.split(" ");
              return (
                <li key={label} className="border-t-2 border-[#0b0d33] pt-3">
                  <p className="text-[1.05rem] tracking-[0.12em] uppercase">{label}</p>
                  <p className="mt-1 flex items-baseline gap-1.5">
                    <span
                      style={DISPLAY}
                      className="text-[clamp(1.5rem,4.5vw,2.4rem)] leading-none"
                    >
                      {amount}
                    </span>
                    <span className="text-[1.15rem] leading-none">{unit.join(" ")}</span>
                  </p>
                </li>
              );
            })}
          </ul>
        </section>

        <section className="px-5 py-12 sm:px-8 lg:px-12">
          <h2 style={DISPLAY} className="text-[0.8rem] text-[#ff9cb3] sm:text-[0.95rem]">
            &gt; NEWS
          </h2>
          <ul className="mt-8 grid gap-8 sm:grid-cols-2">
            {news.slice(0, 4).map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="block no-underline hover:text-[#ff9cb3] focus-visible:text-[#ff9cb3]"
                >
                  <span className="text-[1.05rem] tracking-[0.12em] text-[#9db8ea] uppercase">
                    {item.date}
                  </span>
                  <span className="mt-2 block text-[1.6rem] leading-tight">{item.title}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section className="px-5 pb-12 sm:px-8 lg:px-12">
          <h2 style={DISPLAY} className="text-[0.8rem] text-[#ff9cb3] sm:text-[0.95rem]">
            &gt; PARTNERZY
          </h2>
          <div className="mt-6 border-t-4 border-[#ff9cb3] bg-white px-6 py-7 text-[#0b0d33] sm:px-8">
            <ul className="flex flex-wrap gap-x-12 gap-y-8">
              {partners.map(({ tier, logos }) => (
                <li key={tier}>
                  <p className="text-[1.05rem] tracking-[0.12em] text-[#263b87] uppercase">
                    {tier}
                  </p>
                  <ul className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-5">
                    {logos.map(({ name, src, width, height }) => (
                      <li key={name}>
                        <Image
                          src={src}
                          alt={name}
                          width={width}
                          height={height}
                          sizes="240px"
                          className="h-11 w-auto"
                        />
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>

            <div className="mt-8 flex items-center gap-4 border-t border-[#0b0d33]/25 pt-6">
              <Image
                src={cityFunding.src}
                alt=""
                aria-hidden="true"
                width={cityFunding.width}
                height={cityFunding.height}
                sizes="88px"
                className="h-11 w-auto shrink-0"
              />
              <p className="text-[1.05rem] leading-tight text-[#263b87]">{cityFunding.name}</p>
            </div>
          </div>
        </section>

        <footer className="border-t border-[#3f6bbc]/60 px-5 py-8 sm:px-8 lg:px-12">
          <p className="text-[#9db8ea] uppercase">{con.organiser}</p>
          <p className="mt-2 text-[#cbe3ff]">{con.dates}</p>
        </footer>

        <ColourBars className="h-2.5 sm:h-3.5" />
      </div>
    </div>
  );
}

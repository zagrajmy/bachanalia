import type { Metadata } from "next";
import Link from "next/link";
import Mail02Icon from "@hugeicons/core-free-icons/Mail02Icon";
import { HugeiconsIcon } from "@hugeicons/react";

import { ExhibitorDirectory } from "@/components/Exhibitors/ExhibitorDirectory";
import { fetchExhibitors } from "@/components/Exhibitors/exhibitors";
import { EventDetails } from "@/components/Home/EventDetails";
import { SectionHeading } from "@/components/SectionHeading";

export const metadata: Metadata = {
  title: "Wystawcy",
  description: "Lista wystawców oraz informacje dla wystawców XL Bachanaliów Fantastycznych.",
  alternates: { canonical: `${process.env.NEXT_PUBLIC_BASE_URL}/wystawcy/` },
};

export const revalidate = 10_800;

export default async function WystawcyPage() {
  const exhibitors = await fetchExhibitors();
  const directoryCount = exhibitors.length;

  return (
    <>
      <section className="ink-inverted relative overflow-hidden bg-navy">
        <span aria-hidden="true" className="screened pointer-events-none absolute inset-0" />
        <div className="gutter relative mx-auto max-w-6xl py-12 sm:py-16 lg:py-20">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_24rem] lg:items-end lg:gap-16">
            <div>
              <h1 className="display ml-[-0.04em] text-[clamp(3rem,9vw,6rem)]">Wystawcy</h1>
              <p className="mt-5 max-w-[58ch] text-base/relaxed text-ink-muted sm:text-lg">
                W jednym miejscu: lista stoisk, informacje o zgłoszeniach i regulamin dla wystawców
                Bachanaliów Fantastycznych.
              </p>
            </div>
            <EventDetails />
          </div>

          <nav aria-label="Na tej stronie" className="mt-10">
            <ul className="flex flex-wrap gap-x-7 gap-y-3 text-sm font-semibold">
              <li>
                <Link className="text-ink no-underline hover:text-accent" href="#lista">
                  Lista wystawców ↓
                </Link>
              </li>
              <li>
                <Link className="text-ink no-underline hover:text-accent" href="#zgloszenia">
                  Zgłoszenia ↓
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      </section>

      <section className="gutter mx-auto max-w-6xl scroll-mt-24 pt-12 sm:pt-16" id="lista">
        <SectionHeading
          as="h2"
          size="page"
          aside={
            <p className="eyebrow text-ink-muted tabular-nums">
              {directoryCount === 1 ? "1 stoisko" : `${directoryCount} stoisk`}
            </p>
          }
        >
          Lista wystawców
        </SectionHeading>
        <ExhibitorDirectory exhibitors={exhibitors} />
      </section>

      <section className="gutter mx-auto max-w-6xl scroll-mt-24 pt-16 sm:pt-24" id="zgloszenia">
        <div className="border-t border-navy/30 py-8 sm:flex sm:items-start sm:justify-between sm:gap-12 sm:py-10">
          <div>
            <p className="eyebrow text-rose">Zgłoszenia wystawców</p>
            <h2 className="display mt-2 text-[clamp(1.55rem,3.4vw,2rem)]">
              Dziękujemy za zgłoszenia!
            </h2>
            <p className="mt-3 max-w-[58ch] text-sm/relaxed text-ink-muted">
              Nabór wystawców XL edycji został zakończony. W sprawach dotyczących zgłoszeń
              skontaktuj się z zespołem wystawców.
            </p>
          </div>
          <Link
            className="mt-5 flex max-w-full shrink-0 items-start gap-2 font-semibold text-ink underline decoration-coral decoration-2 underline-offset-4 hover:text-rose sm:mt-7"
            href="mailto:wystawcy@bachanaliafantastyczne.pl"
          >
            <HugeiconsIcon
              aria-hidden="true"
              className="mt-0.5 size-5 shrink-0"
              icon={Mail02Icon}
              strokeWidth={2}
            />
            <span>Napisz do nas</span>
          </Link>
        </div>
      </section>
    </>
  );
}

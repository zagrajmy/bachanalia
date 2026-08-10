import type { Metadata } from "next";
import Link from "next/link";
import Download04Icon from "@hugeicons/core-free-icons/Download04Icon";
import { HugeiconsIcon } from "@hugeicons/react";

import { fetchExhibitorRulesPdf } from "@/components/Exhibitors/rules";
import { SectionHeading } from "@/components/SectionHeading";

export const metadata: Metadata = {
  title: "Regulamin wystawców",
  description: "Regulamin dla wystawców XL Bachanaliów Fantastycznych.",
  alternates: {
    canonical: `${process.env.NEXT_PUBLIC_BASE_URL}/regulamin-wystawcow/`,
  },
};

export const revalidate = 10_800;

export default async function RegulaminWystawcowPage() {
  const pdfUrl = await fetchExhibitorRulesPdf();

  return (
    <section className="gutter mx-auto max-w-6xl pt-12 pb-16 sm:pt-16 sm:pb-24">
      <SectionHeading as="h1" size="page">
        Regulamin wystawców
      </SectionHeading>

      <div className="mt-8 max-w-[60ch]">
        <p className="text-base/relaxed text-ink-muted sm:text-lg">
          Zasady udziału w kiermaszu XL Bachanaliów Fantastycznych, obowiązujące każde stoisko.
        </p>

        {pdfUrl ? (
          <a
            className="mt-7 inline-flex items-center gap-2.5 font-semibold text-ink underline decoration-coral decoration-2 underline-offset-4 transition-colors hover:text-rose"
            href={pdfUrl}
            rel="noreferrer"
            target="_blank"
          >
            <HugeiconsIcon
              aria-hidden="true"
              className="size-5 shrink-0"
              icon={Download04Icon}
              strokeWidth={2}
            />
            <span>
              Pobierz regulamin (PDF)
              <span className="sr-only"> — otwiera się w nowej karcie</span>
            </span>
          </a>
        ) : (
          <p className="mt-7 border-y border-dashed border-navy/30 py-5 text-ink-muted">
            Plik regulaminu jest chwilowo niedostępny. Napisz na{" "}
            <a
              className="font-semibold text-ink underline decoration-coral decoration-2 underline-offset-4 hover:text-rose"
              href="mailto:wystawcy@bachanaliafantastyczne.pl"
            >
              wystawcy@bachanaliafantastyczne.pl
            </a>
            , wyślemy go w odpowiedzi.
          </p>
        )}

        <p className="mt-10 border-t border-navy/30 pt-6 text-sm">
          <Link
            className="font-semibold text-ink underline decoration-coral decoration-2 underline-offset-4 hover:text-rose"
            href="/wystawcy/"
          >
            Lista wystawców i zgłoszenia
          </Link>
        </p>
      </div>
    </section>
  );
}

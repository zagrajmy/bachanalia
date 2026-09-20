import type { Metadata } from "next";

import { GuardianConsentDownload } from "@/components/GuardianConsentDownload";
import { SectionHeading } from "@/components/SectionHeading";
import { REGULATIONS_TITLE, regulationSections } from "@/content/regulations";

export const metadata: Metadata = {
  title: "Regulamin",
  description: "Regulamin XL Bachanaliów Fantastycznych 2026.",
  alternates: {
    canonical: `${process.env.NEXT_PUBLIC_BASE_URL}/regulamin/`,
  },
};

function RegulationsContents() {
  return (
    <nav aria-labelledby="regulations-contents-heading">
      <h2 className="display text-xl" id="regulations-contents-heading">
        Spis treści
      </h2>
      <ol className="mt-3">
        {regulationSections.map(({ id, title, start, end }) => (
          <li className="border-b border-dashed border-hairline" key={id}>
            <a
              className="group flex gap-3 py-2.5 text-sm text-ink no-underline hover:underline hover:decoration-dashed hover:underline-offset-4"
              href={`#${id}`}
            >
              <span className="w-12 shrink-0 text-mark tabular-nums">
                {start}–{end}
              </span>
              <span>{title}</span>
            </a>
          </li>
        ))}
        <li>
          <a
            className="group flex gap-3 py-2.5 text-sm text-ink no-underline hover:underline hover:decoration-dashed hover:underline-offset-4"
            href="#zalacznik-nr-1"
          >
            <span className="w-12 shrink-0 text-mark">PDF</span>
            <span>Oświadczenie opiekuna</span>
          </a>
        </li>
      </ol>
    </nav>
  );
}

export default function RegulationsPage() {
  return (
    <article className="gutter mx-auto max-w-6xl pt-12 pb-4 sm:pt-16">
      <SectionHeading as="h1" size="page">
        Regulamin
      </SectionHeading>

      <p className="display mt-8 max-w-[34ch] text-[clamp(1.35rem,3vw,2rem)] leading-tight">
        {REGULATIONS_TITLE}
      </p>

      <div className="mt-10 lg:grid lg:grid-cols-[minmax(0,70ch)_minmax(13rem,16rem)] lg:items-start lg:gap-16">
        <aside className="mb-12 border-y border-hairline py-5 lg:sticky lg:top-[calc(var(--header-h)+2rem)] lg:col-start-2 lg:row-start-1 lg:mb-0">
          <RegulationsContents />
        </aside>

        <div className="min-w-0 lg:col-start-1 lg:row-start-1">
          <div className="wp-content wrap-anywhere" data-regulations>
            {regulationSections.map(({ id, title, start, end, rules }, sectionIndex) => (
              <section
                aria-labelledby={`${id}-heading`}
                className="scroll-mt-(--below-header)"
                id={id}
                key={id}
              >
                <h2
                  className={`flex items-baseline justify-between gap-4 border-b border-hairline pb-2 text-[clamp(1.35rem,2.5vw,1.8rem)] ${sectionIndex === 0 ? "mt-0" : ""}`}
                  id={`${id}-heading`}
                >
                  <span>{title}</span>
                  <span className="hidden shrink-0 text-sm font-normal text-ink-muted tabular-nums sm:block">
                    {start}–{end}
                  </span>
                </h2>
                <ol className="[&>li+li]:mt-4" start={start}>
                  {rules.map(({ text, listLead, items, after }, index) => (
                    <li key={start + index}>
                      {text}
                      {listLead && <p>{listLead}</p>}
                      {items && (
                        <ul>
                          {items.map((item) => (
                            <li key={item}>{item}</li>
                          ))}
                        </ul>
                      )}
                      {after && <p>{after}</p>}
                    </li>
                  ))}
                </ol>
              </section>
            ))}
          </div>

          <section
            className="scroll-mt-(--below-header) mt-12 border-t border-hairline py-8 sm:flex sm:items-start sm:justify-between sm:gap-12 sm:py-10"
            id="zalacznik-nr-1"
          >
            <div>
              <h2 className="display text-[clamp(1.55rem,3.4vw,2rem)]">Załącznik nr 1</h2>
              <p className="mt-3 max-w-[58ch] text-sm/relaxed text-ink-muted">
                Oświadczenie opiekuna prawnego uczestnika poniżej 16 roku życia, do pobrania,
                wydrukowania i podpisania.
              </p>
            </div>
            <GuardianConsentDownload className="mt-5 shrink-0 sm:mt-2" />
          </section>
        </div>
      </div>
    </article>
  );
}

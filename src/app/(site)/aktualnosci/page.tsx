import type { Metadata } from "next";

import { fetchNews, NEWS_PATH } from "@/components/News/news";
import { NewsList } from "@/components/News/NewsList";
import { SectionHeading } from "@/components/SectionHeading";

export const metadata: Metadata = {
  alternates: { canonical: `${process.env.NEXT_PUBLIC_BASE_URL}${NEWS_PATH}` },
  description: "Ogłoszenia i zapowiedzi gości Bachanaliów Fantastycznych.",
};

export const revalidate = 3600;

export default async function AktualnosciPage() {
  const items = await fetchNews();

  return (
    <div className="gutter mx-auto max-w-6xl pt-12 pb-4 sm:pt-16 lg:px-0">
      <SectionHeading as="h1" size="page">
        Aktualności
      </SectionHeading>

      {items.length === 0 ? (
        <p className="mt-8 max-w-[55ch] text-lg text-ink-muted">
          Pierwsze ogłoszenia XL edycji pojawią się tutaj.
        </p>
      ) : (
        <NewsList items={items} titleAs="h2" />
      )}
    </div>
  );
}

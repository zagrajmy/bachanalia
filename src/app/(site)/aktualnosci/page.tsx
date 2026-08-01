import type { Metadata } from "next";

import { fetchNews, NEWS_PATH } from "@/components/News/news";
import { NewsList } from "@/components/News/NewsList";

export const metadata: Metadata = {
  alternates: { canonical: `${process.env.NEXT_PUBLIC_BASE_URL}${NEWS_PATH}` },
  description: "Ogłoszenia, zapowiedzi gości i wieści z Bachanaliów Fantastycznych.",
  alternates: { canonical: `${process.env.NEXT_PUBLIC_BASE_URL}${NEWS_PATH}` },
};

export const revalidate = 3600;

export default async function AktualnosciPage() {
  const items = await fetchNews();

  return (
    <div className="gutter mx-auto max-w-6xl pt-12 pb-4 sm:pt-16 lg:px-0">
      <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-3 border-b-2 border-navy pb-3">
        <h1 className="display -ml-[0.04em] text-[clamp(2.1rem,6.4vw,4rem)]">Aktualności</h1>
      </div>

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

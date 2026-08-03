import type { Metadata } from "next";

import { Home } from "@/components/Home";
import { fetchNews } from "@/components/News/news";
import { fetchAccreditation } from "@/content/shop";

export const metadata: Metadata = {
  alternates: { canonical: `${process.env.NEXT_PUBLIC_BASE_URL}/` },
};

export const revalidate = 10800;

export default async function HomePage() {
  const [news, tickets] = await Promise.all([fetchNews(6), fetchAccreditation()]);

  return <Home news={news} tickets={tickets} />;
}

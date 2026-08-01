import type { Metadata } from "next";
import Link from "next/link";

import { Button } from "@/components/ui/warcraftcn/button";

export const metadata: Metadata = {
  title: "Nie znaleziono strony",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <main className="gutter mx-auto flex min-h-screen max-w-6xl flex-col justify-center py-24">
      <p className="eyebrow text-ink-muted">404</p>
      <h1 className="display mt-3 border-b-2 border-navy pb-3 text-[clamp(2.1rem,6.4vw,4rem)]">
        Nie znaleziono strony
      </h1>
      <p className="mt-6">
        <Button asChild className="px-8 py-3.5 text-[clamp(0.85rem,2.2vw,1rem)]">
          <Link href="/">Wróć na stronę główną</Link>
        </Button>
      </p>
    </main>
  );
}

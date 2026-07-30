import type { Metadata } from "next";
import Link from "next/link";

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
        <Link
          href="/"
          className="display inline-block rounded-full bg-accent px-8 py-3.5 text-[clamp(1.1rem,3vw,1.4rem)] text-on-accent no-underline transition-[transform,background-color] duration-150 ease-[var(--ease-out)] hover:bg-pink active:scale-[0.98]"
        >
          Wróć na stronę główną
        </Link>
      </p>
    </main>
  );
}

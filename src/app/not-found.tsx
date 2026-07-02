import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Nie znaleziono strony",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <main className="mx-auto max-w-xl px-4 py-24 text-center">
      <h1 className="text-2xl font-bold">Nie znaleziono strony</h1>
      <p className="mt-4">
        <Link href="/">Wróć na stronę główną</Link>
      </p>
    </main>
  );
}

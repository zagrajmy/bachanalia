import type { Metadata } from "next";
import Link from "next/link";

import { CART_PATH } from "@/components/Cart/paths";
import { ProductCard } from "@/components/Shop/ProductCard";
import { fetchShop } from "@/components/Shop/products";

export const metadata: Metadata = {
  title: "Sklep",
  alternates: { canonical: `${process.env.NEXT_PUBLIC_BASE_URL}/sklep/` },
};

export const revalidate = 10800;

export default async function SklepPage() {
  const categories = await fetchShop();

  return (
    <div className="gutter mx-auto max-w-6xl pt-12 sm:pt-16">
      <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-2 border-b-2 border-navy pb-3">
        <h1 className="display -ml-[0.04em] text-[clamp(2.1rem,6.4vw,4rem)]">Sklep</h1>
        <Link
          href={CART_PATH}
          className="eyebrow text-ink-muted no-underline underline-offset-[0.25em] hover:text-rose hover:underline"
        >
          Koszyk →
        </Link>
      </div>

      {categories.length === 0 && (
        <p className="mt-8 max-w-[55ch] text-lg text-ink-muted">Sklep jest chwilowo pusty.</p>
      )}

      {categories.map(({ slug, label, products }) => (
        <section key={slug} className="mt-12 sm:mt-16">
          <h2 className="display border-b border-navy pb-2 text-[clamp(1.4rem,3.4vw,2rem)]">
            {label}
          </h2>

          <ul className="mt-8 grid grid-cols-2 gap-x-5 gap-y-9 sm:grid-cols-3 sm:gap-x-6 sm:gap-y-10 lg:grid-cols-4">
            {products.map((product) => (
              <li key={product.slug}>
                <ProductCard product={product} />
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}

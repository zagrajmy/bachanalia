import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { AddToCartForm } from "@/components/Cart/AddToCartForm";
import { SHOP_PATH } from "@/components/Globals/siteNav";
import { fetchProduct, fetchProductSlugs } from "@/components/Shop/products";
import { hasVisibleContent, prepareWpContent } from "@/utils/prepareWpContent";

type Props = { params: Promise<{ slug: string }> };

export const revalidate = 10_800;

export async function generateStaticParams() {
  return (await fetchProductSlugs()).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const product = await fetchProduct((await params).slug);

  if (!product) return notFound();

  return {
    title: product.name,
    alternates: { canonical: `${process.env.NEXT_PUBLIC_BASE_URL}${product.href}` },
  };
}

export default async function ProduktPage({ params }: Props) {
  const product = await fetchProduct((await params).slug);

  if (!product) notFound();

  const { name, price, soldOut, image, category, description, variants } = product;
  const { productId, variations, attributeLabels, soldIndividually } = product;
  /** Eleven t-shirt sizes at one price are a choice, not a price list. */
  const pricedVariants = new Set(variants.map((variant) => variant.price)).size > 1;
  /** The picker states the same options as the list below, only buyable. */
  const showPicker = !soldOut && productId > 0;

  return (
    <div className="gutter mx-auto max-w-6xl pt-10 sm:pt-14">
      <Link
        href={SHOP_PATH}
        className="eyebrow text-ink-muted no-underline underline-offset-[0.25em] hover:text-rose hover:underline"
      >
        ← Sklep
      </Link>

      <div className="mt-6 grid gap-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16">
        <div className="overflow-hidden rounded-card lg:sticky lg:top-(--below-header) lg:self-start">
          {image ? (
            <Image
              src={image.src}
              alt={image.alt || name}
              width={image.width}
              height={image.height}
              placeholder={image.blurDataURL ? "blur" : "empty"}
              blurDataURL={image.blurDataURL}
              sizes="(min-width: 1024px) 40vw, 92vw"
              priority
              className="h-auto w-full"
            />
          ) : (
            <div className="aspect-4/5 w-full" />
          )}
        </div>

        <div className="min-w-0">
          {category && <p className="eyebrow text-rose">{category.label}</p>}

          <h1 className="display mt-2 ml-[-0.04em] text-[clamp(2rem,5.4vw,3.2rem)]">{name}</h1>

          <p
            className={`display mt-5 text-[clamp(1.6rem,4vw,2.2rem)] tabular-nums ${
              soldOut ? "line-through opacity-60" : ""
            }`}
          >
            {price}
          </p>

          {showPicker && (
            <AddToCartForm
              productId={productId}
              slug={product.slug}
              variations={variations}
              attributeLabels={attributeLabels}
              soldOut={soldOut}
              soldIndividually={soldIndividually}
            />
          )}

          {variants.length > 1 && !showPicker && (
            <div className="mt-8">
              <p className="eyebrow text-ink-muted">Do wyboru</p>

              {pricedVariants ? (
                <ul className="mt-3 border-t border-hairline">
                  {variants.map(({ label, price: variantPrice, soldOut: variantSoldOut }) => (
                    <li
                      key={label}
                      className="flex items-baseline justify-between gap-6 border-b border-dashed border-hairline py-2.5"
                    >
                      <span className="text-sm">{label}</span>
                      <span
                        className={`display whitespace-nowrap tabular-nums ${
                          variantSoldOut ? "line-through opacity-60" : ""
                        }`}
                      >
                        {variantPrice}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <ul className="mt-3 flex flex-wrap gap-2">
                  {variants.map(({ label, soldOut: variantSoldOut }) => (
                    <li
                      key={label}
                      className={`rounded-full border border-hairline px-3 py-1 text-xs ${
                        variantSoldOut ? "text-ink-muted line-through" : ""
                      }`}
                    >
                      {label}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {soldOut && (
            <p className="display mt-9 text-[clamp(1.2rem,3.6vw,1.65rem)] text-ink-muted">
              Wyprzedane
            </p>
          )}

          {hasVisibleContent(description) && (
            <div
              className="wp-content mt-10 border-t border-dashed border-hairline pt-8"
              dangerouslySetInnerHTML={{ __html: prepareWpContent(description) }}
            />
          )}
        </div>
      </div>
    </div>
  );
}

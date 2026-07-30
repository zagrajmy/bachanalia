import { print } from "graphql/language/printer";

import { AccreditationQuery } from "@/queries/general/AccreditationQuery";
import { productPath } from "@/components/Globals/siteNav";
import { fetchGraphQL } from "@/utils/fetchGraphQL";

import { accreditation } from "./con";

/**
 * WooCommerce owns the prices. Hardcoding them here is how a site ends up
 * advertising last year's, so the taryfikator reads the shop and only the
 * label, the note and the order stay editorial.
 */
export type Ticket = {
  label: string;
  note: string;
  price: string;
  href: string;
  soldOut: boolean;
};

type ProductNode = {
  slug?: string | null;
  link?: string | null;
  price?: string | null;
  stockStatus?: string | null;
};

/** WooCommerce formats money for display: "100,00&nbsp;zł", or a range. */
export function formatPrice(raw?: string | null) {
  if (!raw) return "";

  return raw
    .replace(/&nbsp;| /g, " ")
    .replace(/&#8211;|&ndash;/g, "–")
    .replace(/(\d),00\b/g, "$1")
    .replace(/\s+/g, " ")
    .trim();
}

export async function fetchAccreditation(): Promise<Ticket[]> {
  const { products } = await fetchGraphQL<{ products: { nodes: ProductNode[] } }>(
    print(AccreditationQuery),
    { slugs: accreditation.map(({ slug }) => slug) },
  );

  const bySlug = new Map((products?.nodes ?? []).map((node) => [node.slug, node]));

  return accreditation.flatMap(({ slug, label, note }) => {
    const product = bySlug.get(slug);
    if (!product?.price) return [];

    return [
      {
        label,
        note,
        price: formatPrice(product.price),
        href: productPath(slug),
        soldOut: product.stockStatus === "OUT_OF_STOCK",
      },
    ];
  });
}

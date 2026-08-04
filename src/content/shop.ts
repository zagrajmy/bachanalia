import { print } from "graphql/language/printer";

import { AccreditationQuery } from "@/queries/general/AccreditationQuery";
import { productPath } from "@/components/Globals/siteNav";
import { fetchGraphQL } from "@/utils/fetchGraphQL";

import { accreditation } from "./con";

/** WooCommerce owns the prices; hardcoding them advertises last year's. */
export type Ticket = {
  href: string;
  label: string;
  note?: string;
  price: string;
  soldOut: boolean;
};

type ProductNode = {
  link?: string | null;
  price?: string | null;
  slug?: string | null;
  stockStatus?: string | null;
};

/** WooCommerce formats money for display: "100,00&nbsp;zł", or a range. */
export function formatPrice(raw?: string | null) {
  if (!raw) return "";

  return raw
    .replaceAll(/&nbsp;| /g, " ")
    .replaceAll(/&#8211;|&ndash;/g, "–")
    .replaceAll(/(\d),00\b/g, "$1")
    .replaceAll(/\s+/g, " ")
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

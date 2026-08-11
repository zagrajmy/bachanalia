import { AccreditationQuery } from "@/queries/general/AccreditationQuery";
import { productPath } from "@/components/Globals/siteNav";
import type { AccreditationQueryQuery } from "@/gql/graphql";
import type { Selected } from "@/utils/graphqlSelection";
import { fetchGraphQL } from "@/utils/fetchGraphQL";

import { accreditation } from "./con";

type AccreditationNode = Selected<
  NonNullable<AccreditationQueryQuery["products"]>["nodes"][number]
>;

/** WooCommerce owns the prices; hardcoding them advertises last year's. */
export type Ticket = {
  href: string;
  label: string;
  note?: string;
  price: string;
  soldOut: boolean;
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
  const { products } = await fetchGraphQL(AccreditationQuery, {
    slugs: accreditation.map(({ slug }) => slug),
  });

  const nodes: AccreditationNode[] = products?.nodes ?? [];
  const bySlug = new Map(nodes.map((node) => [node.slug, node]));

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

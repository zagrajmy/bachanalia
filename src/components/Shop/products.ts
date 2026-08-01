import { print } from "graphql/language/printer";

import { accreditation } from "@/content/con";
import { formatPrice } from "@/content/shop";
import { ProductQuery } from "@/queries/general/ProductQuery";
import { ProductsQuery } from "@/queries/general/ProductsQuery";
import { blurDataUrl, blurDataUrls } from "@/utils/blurDataUrl";
import { fetchGraphQL, fetchGraphQLAtBuild } from "@/utils/fetchGraphQL";
import { productPath } from "@/components/Globals/siteNav";

export type ShopImage = {
  src: string;
  alt: string;
  width: number;
  height: number;
  /** A 12px WebP of the same upload, inlined so the card never opens empty. */
  blurDataURL?: string;
};

export type ShopProduct = {
  slug: string;
  name: string;
  /** WooCommerce's display string, e.g. "100 zł" or "25 zł – 45 zł". */
  price: string;
  href: string;
  /** Where the sale happens. Cart, checkout and Paynow stay on WooCommerce. */
  wpHref: string;
  soldOut: boolean;
  image?: ShopImage;
};

export type ShopCategory = { slug: string; label: string; products: ShopProduct[] };

export type ShopVariant = { label: string; price: string; soldOut: boolean };

export type ShopProductDetail = ShopProduct & {
  category?: { slug: string; label: string };
  description: string;
  variants: ShopVariant[];
};

type ImageNode = {
  sourceUrl?: string | null;
  /** WordPress's 150px copy — the placeholder source, never rendered as-is. */
  thumbnail?: string | null;
  altText?: string | null;
  mediaDetails?: { width?: number | null; height?: number | null } | null;
};

type TermNode = { slug?: string | null; name?: string | null };

type ProductNode = {
  slug?: string | null;
  name?: string | null;
  link?: string | null;
  price?: string | null;
  stockStatus?: string | null;
  image?: ImageNode | null;
  productCategories?: { nodes?: TermNode[] | null } | null;
};

type ProductDetailNode = ProductNode & {
  description?: string | null;
  variations?: {
    nodes?: { name?: string | null; price?: string | null; stockStatus?: string | null }[] | null;
  } | null;
};

/** Editors type category names lowercase in wp-admin; the shop is not a slug. */
const capitalise = (name: string) => name.charAt(0).toUpperCase() + name.slice(1);

/** Accreditation first — it is why the shop exists — then the books, then the tip jar. */
const CATEGORY_ORDER = ["akredytacje", "antologie", "wsparcie"];

const ACCREDITATION_ORDER = new Map(accreditation.map(({ slug }, i) => [slug, i]));

const ROMAN: { [numeral: string]: number } = { I: 1, V: 5, X: 10, L: 50, C: 100, D: 500, M: 1000 };

/**
 * Volume numbers live in the title ("Fantazje Zielonogórskie XIV") and
 * WooCommerce sorts titles as text, which files IX between IV and V.
 */
function volume(name: string) {
  const numeral = /\s([IVXLCDM]+)$/.exec(name.trim())?.[1];
  if (!numeral) return 0;

  return numeral
    .split("")
    .reduce(
      (total, letter, i, all) =>
        total + (ROMAN[letter] < (ROMAN[all[i + 1]] ?? 0) ? -ROMAN[letter] : ROMAN[letter]),
      0,
    );
}

/**
 * Sorting is stable, so anything the comparators treat as equal keeps the
 * order WooCommerce gave it.
 */
export function sortShopProducts(categorySlug: string, products: ShopProduct[]) {
  if (categorySlug === "akredytacje") {
    const rank = ({ slug }: ShopProduct) => ACCREDITATION_ORDER.get(slug) ?? accreditation.length;
    return [...products].sort((a, b) => rank(a) - rank(b));
  }

  return [...products].sort((a, b) => volume(b.name) - volume(a.name));
}

function toImage(node: ImageNode | null | undefined, blurDataURL?: string) {
  if (!node?.sourceUrl) return undefined;

  return {
    src: node.sourceUrl,
    alt: node.altText || "",
    width: node.mediaDetails?.width ?? 800,
    height: node.mediaDetails?.height ?? 1000,
    blurDataURL,
  } satisfies ShopImage;
}

function toProduct(node: ProductNode, blurDataURL?: string): ShopProduct | undefined {
  if (!node.slug || !node.name || !node.link) return undefined;

  return {
    slug: node.slug,
    name: node.name,
    price: formatPrice(node.price),
    href: productPath(node.slug),
    wpHref: node.link,
    soldOut: node.stockStatus === "OUT_OF_STOCK",
    image: toImage(node.image, blurDataURL),
  };
}

async function fetchCatalogue() {
  const { products } = await fetchGraphQL<{ products: { nodes: ProductNode[] } }>(
    print(ProductsQuery),
  );

  return products?.nodes ?? [];
}

export async function fetchShop(): Promise<ShopCategory[]> {
  const nodes = await fetchCatalogue();
  const blurs = await blurDataUrls(nodes.map((node) => node.image?.thumbnail));
  const categories: ShopCategory[] = [];

  for (const node of nodes) {
    const product = toProduct(node, blurs.get(node.image?.thumbnail ?? ""));
    if (!product) continue;

    const term = node.productCategories?.nodes?.[0];
    const slug = term?.slug ?? "inne";
    let category = categories.find((existing) => existing.slug === slug);

    if (!category) {
      category = { slug, label: capitalise(term?.name ?? "Pozostałe"), products: [] };
      categories.push(category);
    }

    category.products.push(product);
  }

  const rank = ({ slug }: ShopCategory) => {
    const i = CATEGORY_ORDER.indexOf(slug);
    return i === -1 ? CATEGORY_ORDER.length : i;
  };

  return categories
    .sort((a, b) => rank(a) - rank(b))
    .map((category) => ({
      ...category,
      products: sortShopProducts(category.slug, category.products),
    }));
}

/**
 * `generateStaticParams` runs outside a request, where `draftMode()` has
 * nothing to read, so it takes the build-time client — the same document the
 * index page then serves from cache.
 */
export async function fetchProductSlugs(): Promise<string[]> {
  const { products } = await fetchGraphQLAtBuild<{ products: { nodes: ProductNode[] } }>(
    print(ProductsQuery),
  );

  return (products?.nodes ?? []).flatMap((node) => (node.slug ? [node.slug] : []));
}

/** "Golden Ticket - DAMSKA M" is a variation; the buyer only picks the "DAMSKA M". */
export const variantLabel = (productName: string, variationName: string) =>
  variationName.startsWith(`${productName} - `)
    ? variationName.slice(productName.length + 3)
    : variationName;

export async function fetchProduct(slug: string): Promise<ShopProductDetail | undefined> {
  const { products } = await fetchGraphQL<{ products: { nodes: ProductDetailNode[] } }>(
    print(ProductQuery),
    { slugs: [slug] },
  );

  const product = products?.nodes?.[0];

  if (!product) return undefined;

  const base = toProduct(product, await blurDataUrl(product.image?.thumbnail));
  if (!base) return undefined;

  const term = product.productCategories?.nodes?.[0];

  return {
    ...base,
    ...(term?.slug && { category: { slug: term.slug, label: capitalise(term.name ?? term.slug) } }),
    description: product.description ?? "",
    variants: (product.variations?.nodes ?? []).flatMap((variation) =>
      variation.name
        ? [
            {
              label: variantLabel(base.name, variation.name),
              price: formatPrice(variation.price),
              soldOut: variation.stockStatus === "OUT_OF_STOCK",
            },
          ]
        : [],
    ),
  };
}

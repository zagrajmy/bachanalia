import type { AttributeLabel, ProductVariation } from "@/components/Cart/variations";
import { accreditation } from "@/content/con";
import { formatPrice } from "@/content/shop";
import { ProductQuery } from "@/queries/general/ProductQuery";
import { ProductsQuery } from "@/queries/general/ProductsQuery";
import { blurDataUrl, blurDataUrls } from "@/utils/blurDataUrl";
import { fetchGraphQL, fetchGraphQLAtBuild } from "@/utils/fetchGraphQL";
import { productPath, SHOP_PATH } from "@/components/Globals/siteNav";
import type { ProductQueryQuery, ProductsQueryQuery } from "@/gql/graphql";
import type { Selected } from "@/utils/graphqlSelection";

export type ShopImage = {
  alt: string;
  /** A 12px WebP of the same upload, inlined so the card never opens empty. */
  blurDataURL?: string;
  height: number;
  src: string;
  width: number;
};

export type ShopProduct = {
  /** WooCommerce's display string, e.g. "100 zł" or "25 zł – 45 zł". */
  href: string;
  /** Where the sale happens. Cart, checkout and Paynow stay on WooCommerce. */
  image?: ShopImage;
  name: string;
  price: string;
  slug: string;
  soldOut: boolean;
  wpHref: string;
};

export type ShopCategory = { label: string; products: ShopProduct[]; slug: string };

export type ShopVariant = { label: string; price: string; soldOut: boolean };

export type ShopProductDetail = {
  /** Editor-typed captions for the axes, e.g. "Rozmar Koszulki". */
  attributeLabels: AttributeLabel[];
  /**
   * "Sprzedawane pojedynczo" in wp-admin. WooCommerce rejects a second unit
   * with an error, so the picker never offers a quantity for these.
   */
  category?: { label: string; slug: string };
  description: string;
  /** WooCommerce's post ID — what `addToCart` takes, not the slug. */
  productId: number;
  soldIndividually: boolean;
  variants: ShopVariant[];
  /** The picker's raw material: one entry per buyable combination. */
  variations: ProductVariation[];
} & ShopProduct;

/**
 * Products come back as a union — WooCommerce has a concrete type per product
 * kind, and price, stock and variations are selected through the interfaces
 * only some of them implement.
 */
type ProductNode = Selected<NonNullable<ProductsQueryQuery["products"]>["nodes"][number]>;

type ProductDetailNode = Selected<NonNullable<ProductQueryQuery["products"]>["nodes"][number]>;

/** Editors type category names lowercase in wp-admin; the shop is not a slug. */
const capitalise = (name: string) => name.charAt(0).toUpperCase() + name.slice(1);

/** The beds, whose slug carries an edition and so cannot be written down. */
export const NOCLEGI_CATEGORY = "noclegi";

/** Accreditation first — it is why the shop exists — then the bed, the books, the tip jar. */
const CATEGORY_ORDER = ["akredytacje", NOCLEGI_CATEGORY, "antologie", "wsparcie"];

const ACCREDITATION_ORDER = new Map(accreditation.map(({ slug }, i) => [slug, i]));

const ROMAN: Record<string, number> = { I: 1, V: 5, X: 10, L: 50, C: 100, D: 500, M: 1000 };

/**
 * Volume numbers live in the title ("Fantazje Zielonogórskie XIV") and
 * WooCommerce sorts titles as text, which files IX between IV and V.
 */
function volume(name: string) {
  const numeral = /\s([IVXLCDM]+)$/.exec(name.trim())?.[1];
  if (!numeral) return 0;

  let total = 0;

  for (let i = 0; i < numeral.length; i++) {
    const value = ROMAN[numeral[i] ?? ""] ?? 0;
    const next = ROMAN[numeral[i + 1] ?? ""] ?? 0;

    total += value < next ? -value : value;
  }

  return total;
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

/**
 * Where "Noclegi" in the nav should land. One bed on sale is a product; more
 * than one is a choice, and a choice belongs in the shop beside the others.
 * Reading it from the catalogue is what keeps the link off an edition's slug.
 */
export function noclegiDestination(categories: ShopCategory[]) {
  const beds = categories.find(({ slug }) => slug === NOCLEGI_CATEGORY)?.products ?? [];
  const only = beds.length === 1 ? beds[0] : undefined;

  return only ? only.href : `${SHOP_PATH}#${NOCLEGI_CATEGORY}`;
}

export function sortShopCategories(categories: ShopCategory[]) {
  const rank = ({ slug }: ShopCategory) => {
    const i = CATEGORY_ORDER.indexOf(slug);
    return i === -1 ? CATEGORY_ORDER.length : i;
  };

  return [...categories].sort((a, b) => rank(a) - rank(b));
}

function toImage(node: ProductNode["image"], blurDataURL?: string) {
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

async function fetchCatalogue(): Promise<ProductNode[]> {
  const { products } = await fetchGraphQL(ProductsQuery);

  return products?.nodes ?? [];
}

export async function fetchShop(): Promise<ShopCategory[]> {
  const nodes = await fetchCatalogue();
  const blurs = await blurDataUrls(nodes.map((node) => node.image?.thumbnail));
  const categories: ShopCategory[] = [];

  for (const node of nodes) {
    const product = toProduct(node, blurs.get(node.image?.thumbnail ?? ""));
    if (!product) continue;

    const term = node.productCategories?.nodes[0];
    const slug = term?.slug ?? "inne";
    let category = categories.find((existing) => existing.slug === slug);

    if (!category) {
      category = { slug, label: capitalise(term?.name ?? "Pozostałe"), products: [] };
      categories.push(category);
    }

    category.products.push(product);
  }

  return sortShopCategories(categories).map((category) => ({
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
  const { products } = await fetchGraphQLAtBuild(ProductsQuery);

  return (products?.nodes ?? []).flatMap((node) => (node.slug ? [node.slug] : []));
}

/** "Golden Ticket - DAMSKA M" is a variation; the buyer only picks the "DAMSKA M". */
export const variantLabel = (productName: string, variationName: string) =>
  variationName.startsWith(`${productName} - `)
    ? variationName.slice(productName.length + 3)
    : variationName;

export async function fetchProduct(slug: string): Promise<ShopProductDetail | undefined> {
  const { products } = await fetchGraphQL(ProductQuery, { slugs: [slug] });

  const product: ProductDetailNode | undefined = products?.nodes[0];

  if (!product) return undefined;

  const base = toProduct(product, await blurDataUrl(product.image?.thumbnail));
  if (!base) return undefined;

  const term = product.productCategories?.nodes[0];
  const variationNodes = product.variations?.nodes ?? [];

  return {
    ...base,
    productId: product.databaseId ?? 0,
    soldIndividually: product.soldIndividually === true,
    ...(term?.slug && { category: { slug: term.slug, label: capitalise(term.name ?? term.slug) } }),
    description: product.description ?? "",
    variants: variationNodes.flatMap((variation) =>
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
    variations: variationNodes.flatMap((variation) =>
      variation.databaseId
        ? [
            {
              variationId: variation.databaseId,
              price: formatPrice(variation.price),
              soldOut: variation.stockStatus === "OUT_OF_STOCK",
              attributes: (variation.attributes?.nodes ?? []).flatMap((attribute) =>
                attribute.name ? [{ name: attribute.name, value: attribute.value ?? "" }] : [],
              ),
            },
          ]
        : [],
    ),
    attributeLabels: (product.attributes?.nodes ?? []).flatMap((attribute) =>
      attribute.name ? [{ name: attribute.name, label: attribute.label || attribute.name }] : [],
    ),
  };
}

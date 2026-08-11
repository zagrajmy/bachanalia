import { describe, expect, it } from "bun:test";

import { accreditation } from "@/content/con";
import { productPath } from "@/components/Globals/siteNav";

import {
  NOCLEGI_CATEGORY,
  noclegiDestination,
  type ShopCategory,
  type ShopProduct,
  sortShopCategories,
  sortShopProducts,
  variantLabel,
} from "./products";

const product = (slug: string, name: string): ShopProduct => ({
  slug,
  name,
  price: "",
  href: productPath(slug),
  wpHref: "",
  soldOut: false,
});

const category = (slug: string): ShopCategory => ({ slug, label: slug, products: [] });

describe("noclegiDestination", () => {
  const beds = (...slugs: string[]): ShopCategory => ({
    slug: NOCLEGI_CATEGORY,
    label: "Noclegi",
    products: slugs.map((slug) => product(slug, slug)),
  });

  it("sends the reader straight to the bed when only one is on sale", () => {
    expect(noclegiDestination([beds("nocleg-w-akademiku-bf-26")])).toBe(
      "/produkt/nocleg-w-akademiku-bf-26/",
    );
  });

  it("hands a choice to the shop rather than picking for the reader", () => {
    expect(noclegiDestination([beds("nocleg-jedna-noc", "nocleg-dwie-noce")])).toBe(
      "/sklep/#noclegi",
    );
  });

  it("falls back to the shop when the beds are not on sale yet", () => {
    expect(noclegiDestination([])).toBe("/sklep/#noclegi");
  });
});

describe("sortShopCategories", () => {
  it("sells the bed with the accreditation, not behind the tip jar", () => {
    const sorted = sortShopCategories(
      ["wsparcie", "antologie", "noclegi", "akredytacje"].map(category),
    );

    expect(sorted.map((c) => c.slug)).toEqual(["akredytacje", "noclegi", "antologie", "wsparcie"]);
  });

  it("files a category nobody ordered last", () => {
    const sorted = sortShopCategories(["koszulki", "akredytacje"].map(category));

    expect(sorted.map((c) => c.slug)).toEqual(["akredytacje", "koszulki"]);
  });
});

describe("sortShopProducts", () => {
  it("repeats the taryfikator's order rather than WooCommerce's alphabetical one", () => {
    const sorted = sortShopProducts(
      "akredytacje",
      accreditation.map(({ slug, label }) => product(slug, label)).toReversed(),
    );

    expect(sorted.map((p) => p.slug)).toEqual(accreditation.map(({ slug }) => slug));
  });

  it("puts products the taryfikator does not list last", () => {
    const sorted = sortShopProducts("akredytacje", [
      product("akredytacja-wspierajaca-polcon", "Akredytacja wspierająca Polcon"),
      product("golden-ticket", "Golden Ticket"),
    ]);

    expect(sorted[0]!.slug).toBe("golden-ticket");
  });

  it("orders anthologies by volume, so IX does not land between IV and V", () => {
    const sorted = sortShopProducts("antologie", [
      product("i", "Fantazje Zielonogórskie I"),
      product("ix", "Fantazje Zielonogórskie IX"),
      product("iv", "Fantazje Zielonogórskie IV"),
      product("xv", "Fantazje Zielonogórskie XV"),
      product("v", "Fantazje Zielonogórskie V"),
    ]);

    expect(sorted.map((p) => p.slug)).toEqual(["xv", "ix", "v", "iv", "i"]);
  });

  it("leaves titles without a numeral in the order WooCommerce gave them", () => {
    const sorted = sortShopProducts("wsparcie", [
      product("a", "Wsparcie Klubu 1 zł"),
      product("b", "Cegiełka"),
    ]);

    expect(sorted.map((p) => p.slug)).toEqual(["a", "b"]);
  });
});

describe("variantLabel", () => {
  it("drops the product name WooCommerce prefixes onto every variation", () => {
    expect(variantLabel("Golden Ticket", "Golden Ticket - DAMSKA M")).toBe("DAMSKA M");
  });

  it("leaves a variation that does not repeat the product name alone", () => {
    expect(variantLabel("Golden Ticket", "DAMSKA M")).toBe("DAMSKA M");
  });
});

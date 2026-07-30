import { describe, expect, it } from "bun:test";

import { accreditation } from "@/content/con";

import { sortShopProducts, variantLabel, type ShopProduct } from "./products";

const product = (slug: string, name: string): ShopProduct => ({
  slug,
  name,
  price: "",
  href: `/sklep/${slug}/`,
  wpHref: "",
  soldOut: false,
});

describe("sortShopProducts", () => {
  it("repeats the taryfikator's order rather than WooCommerce's alphabetical one", () => {
    const sorted = sortShopProducts(
      "akredytacje",
      accreditation.map(({ slug, label }) => product(slug, label)).reverse(),
    );

    expect(sorted.map((p) => p.slug)).toEqual(accreditation.map(({ slug }) => slug));
  });

  it("puts products the taryfikator does not list last", () => {
    const sorted = sortShopProducts("akredytacje", [
      product("akredytacja-wspierajaca-polcon", "Akredytacja wspierająca Polcon"),
      product("golden-ticket", "Golden Ticket"),
    ]);

    expect(sorted[0].slug).toBe("golden-ticket");
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

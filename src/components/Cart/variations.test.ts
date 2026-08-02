import { describe, expect, it } from "bun:test";

import {
  buildAxes,
  findVariation,
  initialSelection,
  isOptionAvailable,
  type ProductVariation,
} from "./variations";

/** The real shape of Golden Ticket, trimmed to four of its eleven sizes. */
const shirt: ProductVariation[] = [
  { variationId: 2109, price: "250 zł", soldOut: false, attributes: [{ name: "rozmar-koszulki", value: "MĘSKA XXXL" }] },
  { variationId: 2108, price: "250 zł", soldOut: true, attributes: [{ name: "rozmar-koszulki", value: "MĘSKA XXL" }] },
  { variationId: 2107, price: "250 zł", soldOut: false, attributes: [{ name: "rozmar-koszulki", value: "MĘSKA XL" }] },
  { variationId: 2106, price: "250 zł", soldOut: false, attributes: [{ name: "rozmar-koszulki", value: "MĘSKA L" }] },
];

const twoAxis: ProductVariation[] = [
  {
    variationId: 1,
    price: "10 zł",
    soldOut: false,
    attributes: [
      { name: "rozmiar", value: "S" },
      { name: "kolor", value: "czarny" },
    ],
  },
  {
    variationId: 2,
    price: "10 zł",
    soldOut: false,
    attributes: [
      { name: "rozmiar", value: "M" },
      { name: "kolor", value: "biały" },
    ],
  },
];

describe("buildAxes", () => {
  it("names the axis the way the editor typed it, not the way WooCommerce sanitised it", () => {
    const axes = buildAxes(shirt, [{ name: "rozmar-koszulki", label: "Rozmar Koszulki" }]);

    expect(axes).toHaveLength(1);
    expect(axes[0].label).toBe("Rozmar Koszulki");
  });

  it("falls back to the attribute name when the parent lists no label", () => {
    expect(buildAxes(shirt)[0].label).toBe("rozmar-koszulki");
  });

  it("keeps every option, sold out ones included, in the order WooCommerce gave them", () => {
    expect(buildAxes(shirt)[0].options).toEqual([
      "MĘSKA XXXL",
      "MĘSKA XXL",
      "MĘSKA XL",
      "MĘSKA L",
    ]);
  });

  it("takes a second axis from the data rather than a hardcoded shape", () => {
    expect(buildAxes(twoAxis).map((axis) => axis.name)).toEqual(["rozmiar", "kolor"]);
  });

  it("orders axes the way the parent product lists them", () => {
    const axes = buildAxes(twoAxis, [
      { name: "kolor", label: "Kolor" },
      { name: "rozmiar", label: "Rozmiar" },
    ]);

    expect(axes.map((axis) => axis.name)).toEqual(["kolor", "rozmiar"]);
  });
});

describe("findVariation", () => {
  const axes = buildAxes(shirt);

  it("resolves the id WooCommerce needs, since a bare product id is refused", () => {
    expect(findVariation(shirt, axes, { "rozmar-koszulki": "MĘSKA L" })?.variationId).toBe(2106);
  });

  it("resolves nothing while an axis is unanswered, so no one buys an unpicked size", () => {
    expect(findVariation(shirt, axes, {})).toBeUndefined();
  });

  it("needs every axis before it answers", () => {
    const twoAxes = buildAxes(twoAxis);

    expect(findVariation(twoAxis, twoAxes, { rozmiar: "S" })).toBeUndefined();
    expect(findVariation(twoAxis, twoAxes, { rozmiar: "S", kolor: "czarny" })?.variationId).toBe(1);
  });

  it("treats an empty attribute value as WooCommerce's 'any'", () => {
    const anySize: ProductVariation[] = [
      { variationId: 9, price: "1 zł", soldOut: false, attributes: [{ name: "rozmiar", value: "" }] },
    ];
    const axes = buildAxes(anySize, [{ name: "rozmiar", label: "Rozmiar" }]);

    expect(axes).toHaveLength(0);
    expect(findVariation(anySize, axes, {})?.variationId).toBe(9);
  });
});

describe("isOptionAvailable", () => {
  it("refuses a sold-out size", () => {
    expect(isOptionAvailable(shirt, "rozmar-koszulki", "MĘSKA XXL", {})).toBe(false);
    expect(isOptionAvailable(shirt, "rozmar-koszulki", "MĘSKA XL", {})).toBe(true);
  });

  it("refuses a combination that was never built", () => {
    expect(isOptionAvailable(twoAxis, "kolor", "biały", { rozmiar: "S" })).toBe(false);
    expect(isOptionAvailable(twoAxis, "kolor", "czarny", { rozmiar: "S" })).toBe(true);
  });
});

describe("initialSelection", () => {
  it("guesses nothing when there is a choice to make", () => {
    expect(initialSelection(buildAxes(shirt))).toEqual({});
  });

  it("answers an axis that offers a single option", () => {
    const only: ProductVariation[] = [
      { variationId: 5, price: "1 zł", soldOut: false, attributes: [{ name: "antologia", value: "Tak" }] },
    ];

    expect(initialSelection(buildAxes(only))).toEqual({ antologia: "Tak" });
  });
});

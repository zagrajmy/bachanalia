import { strict as assert } from "node:assert";
import { test } from "node:test";

import { formatPrice } from "./shop";

test("reads WooCommerce's display money without the markup", () => {
  assert.equal(formatPrice("100,00&nbsp;zł"), "100 zł");
  assert.equal(formatPrice("60,00&nbsp;zł"), "60 zł");
});

test("keeps the grosze when a price actually has them", () => {
  assert.equal(formatPrice("49,99&nbsp;zł"), "49,99 zł");
});

test("survives a variable product's range", () => {
  assert.equal(formatPrice("25,00&nbsp;zł &#8211; 45,00&nbsp;zł"), "25 zł – 45 zł");
});

test("an absent price is empty, not the string undefined", () => {
  assert.equal(formatPrice(null), "");
  assert.equal(formatPrice(undefined), "");
});

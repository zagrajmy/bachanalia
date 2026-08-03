import { strict as assert } from "node:assert";
import { test } from "node:test";

import { wooMessage } from "./message";

/** The one the owner hit: sold-individually product, added twice. */
const SOLD_INDIVIDUALLY =
  "Nie możesz dodać kolejnej sztuki &bdquo;Wsparcie Klubu 1 z&#322;&rdquo; do koszyka. " +
  '<a href="https://bachanaliafantastyczne.pl/index.php/koszyk/" class="button wc-forward">Zobacz koszyk</a>';

test("a WooCommerce error reaches the buyer as text, not markup", () => {
  assert.equal(
    wooMessage(SOLD_INDIVIDUALLY),
    "Nie możesz dodać kolejnej sztuki „Wsparcie Klubu 1 zł” do koszyka.",
  );
});

test("the trailing WordPress cart link is dropped, not translated", () => {
  assert.ok(!wooMessage(SOLD_INDIVIDUALLY).includes("Zobacz koszyk"));
  assert.ok(!wooMessage(SOLD_INDIVIDUALLY).includes("index.php"));
});

test("a link in the middle of a sentence stays as its own words", () => {
  assert.equal(wooMessage('Zobacz <a href="/x">regulamin</a> sklepu.'), "Zobacz regulamin sklepu.");
});

test("the empty-cart session error is the one sentence worth rewriting", () => {
  assert.equal(wooMessage("Sorry, no session found."), "Koszyk jest pusty.");
});

test("an untranslated WooCommerce error is passed through rather than hidden", () => {
  assert.equal(
    wooMessage("Sorry, this product cannot be purchased."),
    "Sorry, this product cannot be purchased.",
  );
});

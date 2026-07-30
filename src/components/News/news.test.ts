import { strict as assert } from "node:assert";
import { test } from "node:test";

import { newsExcerpt } from "./news";

test("strips the markup WordPress wraps every excerpt in", () => {
  assert.equal(newsExcerpt("<p>Gościem będzie Paweł Awdejuk.</p>\n"), "Gościem będzie Paweł Awdejuk.");
});

test("decodes the entities WordPress emits for dashes and quotes", () => {
  assert.equal(
    newsExcerpt("<p>Micha&#322; Malinowski &#8211; &#8222;Grun de Berg&#8221;&nbsp;itd.</p>"),
    "Michał Malinowski – „Grun de Berg” itd.",
  );
});

test("leaves unknown entities alone rather than mangling them", () => {
  assert.equal(newsExcerpt("<p>50 &zzzz; 60</p>"), "50 &zzzz; 60");
});

test("clips long excerpts on a word boundary and marks the cut", () => {
  const out = newsExcerpt("<p>Zielonogórski filmowiec i aktor kabaretowy.</p>", 20);

  assert.equal(out, "Zielonogórski…");
  assert.ok(out.length <= 21);
});

test("keeps a mid-word cut when there is no space to break on", () => {
  assert.equal(newsExcerpt("Fantastycznonaukowy", 10), "Fantastycz…");
});

test("short excerpts survive untouched, with no trailing ellipsis", () => {
  const text = "Krótka zapowiedź.";

  assert.equal(newsExcerpt(text, text.length), text);
});

test("an empty excerpt is not a reason to crash a listing", () => {
  assert.equal(newsExcerpt(undefined), "");
  assert.equal(newsExcerpt(null), "");
  assert.equal(newsExcerpt("<p></p>"), "");
});

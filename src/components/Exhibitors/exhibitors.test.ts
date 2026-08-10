import { strict as assert } from "node:assert";
import { test } from "node:test";

import { driveImageUrl, exhibitorsFromCsv, extractLinks, parseCsv } from "./exhibitors";

test("reads quoted commas, escaped quotes and newlines from Google Sheets CSV", () => {
  const rows = parseCsv(`Nazwa,Opis
Stoisko,"Gry, książki
i ""figurki"""
`);

  assert.deepEqual(rows, [
    ["Nazwa", "Opis"],
    [
      "Stoisko",
      `Gry, książki
i "figurki"`,
    ],
  ]);
});

test("maps the current Polish sheet columns", () => {
  const [exhibitor] = exhibitorsFromCsv(
    'Nazwa,Opis,Media społecznościowe,logo,Kategoria\n"Pinku Tako","Moda i modele","https://pinkutako.pl/ https://instagram.com/pinku_tako","https://drive.google.com/file/d/abc123/view","Gadżety"',
  );

  assert.equal(exhibitor.name, "Pinku Tako");
  assert.equal(exhibitor.logoUrl, "https://drive.google.com/thumbnail?id=abc123&sz=w640");
  assert.deepEqual(
    exhibitor.links.map((link) => link.label),
    ["pinkutako.pl", "Instagram"],
  );
});

test("normalizes bare www links and removes duplicates", () => {
  assert.deepEqual(extractLinks("www.example.pl, www.example.pl"), [
    { href: "https://www.example.pl", label: "example.pl" },
  ]);
});

test("ignores an untrusted non-Drive image host", () => {
  assert.equal(driveImageUrl("https://example.com/logo.png"), undefined);
});

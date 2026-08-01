import { strict as assert } from "node:assert";
import { test } from "node:test";

import { sitemapPaths } from "./sitemap";

test("keeps WordPress pages and posts at their clean paths", () => {
  const paths = sitemapPaths(["/index.php/regulamin/", "/index.php/2025/09/15/filmopolis/"], []);

  assert.ok(paths.includes("/regulamin/"));
  assert.ok(paths.includes("/2025/09/15/filmopolis/"));
});

test("never advertises a page WordPress keeps", () => {
  const paths = sitemapPaths(["/index.php/koszyk/", "/index.php/moje-konto/"], []);

  assert.deepEqual(
    paths.filter((path) => path.includes("koszyk") || path.includes("konto")),
    [],
  );
});

test("collapses the null-uri pages onto the routes we serve ourselves", () => {
  const paths = sitemapPaths([null, undefined], ["golden-ticket"]);

  assert.deepEqual(paths, ["/", "/sklep/", "/aktualnosci/", "/goscie/", "/produkt/golden-ticket/"]);
});

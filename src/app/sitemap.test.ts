import { strict as assert } from "node:assert";
import { test } from "node:test";
import { guestPath, guests } from "@/content/guests";

import { sitemapPaths } from "./sitemap";

test("keeps WordPress pages and posts at their clean paths", () => {
  const paths = sitemapPaths(
    ["/index.php/czas-i-miejsce/", "/index.php/2025/09/15/filmopolis/"],
    [],
  );

  assert.ok(paths.includes("/czas-i-miejsce/"));
  assert.ok(paths.includes("/2025/09/15/filmopolis/"));
});

test("advertises the regulations without relying on the WordPress page", () => {
  assert.ok(sitemapPaths([], []).includes("/regulamin/"));
});

test("advertises the exhibitor rules we serve, not WordPress's copy of them", () => {
  const paths = sitemapPaths(
    ["/index.php/regulamin-wystawcow/", "/index.php/regulamin-wystawcow-2/"],
    [],
  );

  assert.ok(paths.includes("/regulamin-wystawcow/"));
  assert.ok(!paths.includes("/regulamin-wystawcow-2/"));
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

  assert.deepEqual(paths, [
    "/",
    "/sklep/",
    "/aktualnosci/",
    "/goscie/",
    "/goscie/2025/",
    ...guests.map(guestPath).filter((path) => path !== undefined),
    "/wystawcy/",
    "/regulamin/",
    "/regulamin-wystawcow/",
    "/produkt/golden-ticket/",
  ]);
});

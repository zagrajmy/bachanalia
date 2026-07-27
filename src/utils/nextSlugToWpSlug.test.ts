import { strict as assert } from "node:assert";
import { test } from "node:test";

import { nextSlugToWpSlug } from "./nextSlugToWpSlug";

test("maps clean paths to the WP PATHINFO URIs that WPGraphQL resolves", () => {
  assert.equal(nextSlugToWpSlug(["czas-i-miejsce"]), "/index.php/czas-i-miejsce/");
  assert.equal(
    nextSlugToWpSlug(["2025", "09", "15", "filmopolis"]),
    "/index.php/2025/09/15/filmopolis/",
  );
  assert.equal(nextSlugToWpSlug("regulamin"), "/index.php/regulamin/");
});

test("leaves the homepage alone", () => {
  assert.equal(nextSlugToWpSlug(undefined), "/");
  assert.equal(nextSlugToWpSlug([]), "/");
});

test("is idempotent so already-prefixed URIs are not double-prefixed", () => {
  assert.equal(nextSlugToWpSlug("/index.php/regulamin/"), "/index.php/regulamin/");
});

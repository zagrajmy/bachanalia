import { strict as assert } from "node:assert";
import { test } from "node:test";

import { nextSlugToWpSlug } from "./nextSlugToWpSlug";
import { wpUriToPath } from "./wpUriToPath";

test("strips the legacy PATHINFO prefix WordPress returns in uri fields", () => {
  assert.equal(wpUriToPath("/index.php/2025/09/15/filmopolis/"), "/2025/09/15/filmopolis/");
  assert.equal(wpUriToPath("/index.php/regulamin/"), "/regulamin/");
});

test("keeps already-clean paths and the homepage", () => {
  assert.equal(wpUriToPath("/czas-i-miejsce/"), "/czas-i-miejsce/");
  assert.equal(wpUriToPath("/"), "/");
  assert.equal(wpUriToPath(null), "/");
  assert.equal(wpUriToPath(undefined), "/");
});

test("always ends in a slash so links do not bounce through trailingSlash", () => {
  assert.equal(wpUriToPath("/index.php/regulamin"), "/regulamin/");
});

test("round-trips with nextSlugToWpSlug", () => {
  const wpUri = "/index.php/czas-i-miejsce/";

  assert.equal(nextSlugToWpSlug(wpUriToPath(wpUri).slice(1, -1)), wpUri);
});

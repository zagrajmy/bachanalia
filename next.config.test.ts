import { strict as assert } from "node:assert";
import { test } from "node:test";

import nextConfig from "./next.config.js";

const redirects = async () => {
  assert.ok(nextConfig.redirects, "next.config.js must declare redirects()");
  return nextConfig.redirects();
};

test("legacy PATHINFO urls redirect permanently to clean paths", async () => {
  const [rule, ...rest] = await redirects();

  assert.equal(rest.length, 0);
  assert.equal(rule.source, "/index.php/:path*");
  assert.equal(rule.permanent, true);
});

test("destination keeps the trailing slash so the hop is not doubled", async () => {
  const [rule] = await redirects();

  assert.equal(
    rule.destination,
    "/:path*/",
    "trailingSlash is on, so a destination without the slash costs a second redirect on every indexed URL",
  );
});

import { strict as assert } from "node:assert";
import { test } from "node:test";

import nextConfig from "./next.config.js";

const redirects = async () => {
  assert.ok(nextConfig.redirects, "next.config.js must declare redirects()");
  return nextConfig.redirects();
};

test("legacy PATHINFO urls redirect permanently to clean paths", async () => {
  const [rule] = await redirects();

  assert.equal(rule.source, "/index.php/:path*");
  assert.equal(rule.permanent, true);
});

test("redirects within the site are permanent, so link equity is not parked on a 302", async () => {
  const internal = (await redirects()).filter((rule) => rule.destination.startsWith("/"));

  assert.ok(internal.length > 1, "expected several same-site redirects");
  for (const rule of internal) {
    assert.equal(rule.permanent, true, `${rule.source} must 301`);
  }
});

test("redirects off the site are temporary, because the shop is about to move", async () => {
  const outbound = (await redirects()).filter((rule) => !rule.destination.startsWith("/"));

  for (const rule of outbound) {
    assert.equal(
      rule.permanent,
      false,
      `${rule.source} must 302 — a browser caches a 301 indefinitely, and WordPress moves to a subdomain at cutover`,
    );
  }
});

test("the dropped WordPress news shells land on the news archive", async () => {
  const destinations = new Map((await redirects()).map((rule) => [rule.source, rule.destination]));

  assert.equal(destinations.get("/blog"), "/aktualnosci/");
  assert.equal(destinations.get("/category/:slug*"), "/aktualnosci/");
});

test("destination keeps the trailing slash so the hop is not doubled", async () => {
  const [rule] = await redirects();

  assert.equal(
    rule.destination,
    "/:path*/",
    "trailingSlash is on, so a destination without the slash costs a second redirect on every indexed URL",
  );
});

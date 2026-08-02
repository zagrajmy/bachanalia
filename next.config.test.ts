import { strict as assert } from "node:assert";
import { test } from "node:test";

import nextConfig from "./next.config.js";

const redirects = async () => {
  assert.ok(nextConfig.redirects, "next.config.js must declare redirects()");
  return nextConfig.redirects();
};

const find = async (source: string) => {
  const rule = (await redirects()).find((r) => r.source === source);
  assert.ok(rule, `no redirect declared for ${source}`);
  return rule;
};

/** Next takes the first rule that matches, so order is behaviour. */
const indexOf = async (source: string) => (await redirects()).findIndex((r) => r.source === source);

test("legacy PATHINFO urls redirect permanently to clean paths", async () => {
  const rule = await find("/index.php/:path*");

  assert.equal(rule.destination, "/:path*/");
  assert.equal(rule.permanent, true);
});

test("destination keeps the trailing slash so the hop is not doubled", async () => {
  const rule = await find("/index.php/:path*");

  assert.equal(
    rule.destination,
    "/:path*/",
    "trailingSlash is on, so a destination without the slash costs a second redirect on every indexed URL",
  );
});

test("product urls need no redirect at all", async () => {
  const sources = (await redirects()).map((rule) => rule.source);

  assert.ok(
    !sources.some((source) => source.includes("produkt")),
    "the route lives at /produkt/<slug>/, which is where WooCommerce already sends people — a redirect would only add a hop, and /index.php/produkt/… is covered by the PATHINFO rule",
  );
});

test("accreditation lands on our own shop, not back on WordPress", async () => {
  const rule = await find("/akredytacja");

  assert.equal(rule.destination, "/sklep/");
  assert.equal(rule.permanent, true);
});

test("redirects within the site are permanent, so link equity is not parked on a 302", async () => {
  const internal = (await redirects()).filter((rule) => rule.destination.startsWith("/"));

  assert.ok(internal.length > 1, "expected several same-site redirects");
  for (const rule of internal) {
    assert.equal(rule.permanent, true, `${rule.source} must 301`);
  }
});

test("an outbound hop is temporary, because WordPress is about to move", async () => {
  const outbound = (await redirects()).filter((rule) => !rule.destination.startsWith("/"));

  for (const rule of outbound) {
    assert.equal(
      rule.permanent,
      false,
      `${rule.source} must 307 — WordPress moves to a subdomain at cutover and a browser caches a 301 indefinitely`,
    );
  }
});

test("the order confirmation stays with WordPress, which issues the ticket", async () => {
  const rule = (await redirects()).find((r) => r.source.startsWith("/zamowienie/order-received"));

  assert.ok(rule, "Paynow returns buyers here and the ticket is served from wp-content");
  assert.match(rule.destination, /\/index\.php\/zamowienie\/order-received\/:path\*$/);
});

test("the dropped WordPress news shells land on the news archive", async () => {
  const destinations = new Map((await redirects()).map((rule) => [rule.source, rule.destination]));

  assert.equal(destinations.get("/blog"), "/aktualnosci/");
  assert.equal(destinations.get("/category/:slug*"), "/aktualnosci/");
});

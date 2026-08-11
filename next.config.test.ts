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
const _indexOf = async (source: string) =>
  (await redirects()).findIndex((r) => r.source === source);

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

test("the former exhibitor pages collapse onto the directory in one permanent hop", async () => {
  for (const source of [
    "/poznaj-wystawcow",
    "/zgloszenia-wystawcow",
    "/index.php/poznaj-wystawcow",
    "/index.php/zgloszenia-wystawcow",
  ]) {
    const rule = await find(source);
    assert.equal(rule.destination, "/wystawcy/");
    assert.equal(rule.permanent, true);
  }
});

test("WordPress's numbered rules page lands on the rules we serve", async () => {
  for (const source of ["/regulamin-wystawcow-2", "/index.php/regulamin-wystawcow-2"]) {
    const rule = await find(source);
    assert.equal(rule.destination, "/regulamin-wystawcow/");
    assert.equal(rule.permanent, true);
  }
});

test("the unsuffixed exhibitor rules url is ours to serve, not to redirect", async () => {
  const sources = (await redirects()).map((rule) => rule.source);

  assert.ok(
    !sources.includes("/regulamin-wystawcow"),
    "every printed and indexed link points here; the page answers them",
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

test("the dorm page lands on the product that sells the beds, temporarily", async () => {
  const rule = await find("/noclegi");

  assert.equal(rule.destination, "/produkt/nocleg-w-akademiku-bf-26/");
  assert.equal(
    rule.permanent,
    false,
    "the destination is one edition's product — a cached 308 would outlive it",
  );
});

test("redirects within the site are permanent, so link equity is not parked on a 307", async () => {
  const internal = (await redirects())
    .filter((rule) => rule.destination.startsWith("/"))
    /** Except the per-edition aliases, whose destination moves every year. */
    .filter((rule) => rule.source !== "/noclegi");

  assert.ok(internal.length > 1, "expected several same-site redirects");
  for (const rule of internal) {
    /** `permanent: true` is a 308 in Next — permanent to crawlers, like a 301. */
    assert.equal(rule.permanent, true, `${rule.source} must redirect permanently`);
  }
});

test("an outbound hop is temporary, because WordPress is about to move", async () => {
  const outbound = (await redirects()).filter((rule) => !rule.destination.startsWith("/"));

  for (const rule of outbound) {
    assert.equal(
      rule.permanent,
      false,
      `${rule.source} must 307 — WordPress moves to a subdomain at cutover and a browser caches a 308 indefinitely`,
    );
  }
});

test("the order confirmation stays with WordPress, which issues the ticket", async () => {
  const rule = (await redirects()).find((r) => r.source.startsWith("/zamowienie/order-received"));

  assert.ok(rule, "Paynow returns buyers here and the ticket is served from wp-content");
  assert.match(rule.destination, /\/index\.php\/zamowienie\/order-received\/:path\*$/);
});

test("a Paynow notification aimed at the apex still reaches WordPress", async () => {
  assert.ok(nextConfig.rewrites, "next.config.js must declare rewrites()");
  const rules = await nextConfig.rewrites();

  /**
   * The array form runs as `afterFiles`, and the front page is a file: Next
   * answers the notification from the static route and never reaches the
   * rewrite. That failure looks like a 405 with `x-matched-path: /`.
   */
  assert.ok(
    !Array.isArray(rules) && rules.beforeFiles,
    "the notification rewrite has to outrank the front page, so it belongs in beforeFiles",
  );
  const rule = rules.beforeFiles.find((r) => r.source === "/");

  assert.ok(rule, "the notification lands on / with a wc-api query");
  assert.deepEqual(
    rule.has,
    [{ type: "query", key: "wc-api" }],
    "only the notification carries wc-api; the home page must stay the home page for everyone else",
  );
});

test("the notification is proxied, never redirected", async () => {
  const sources = (await redirects()).map((rule) => rule.source);

  assert.ok(
    !sources.includes("/"),
    "Paynow wants 200 or 202 back and documents nothing about following a 3xx, and the plugin checks an HMAC over the raw body — the request has to arrive whole, not be pointed somewhere else",
  );
});

test("an InPost status webhook aimed at the apex still reaches WordPress", async () => {
  assert.ok(nextConfig.rewrites, "next.config.js must declare rewrites()");
  const rules = await nextConfig.rewrites();

  assert.ok(!Array.isArray(rules) && rules.beforeFiles, "rewrites use the phased form");
  const rule = rules.beforeFiles.find((r) => r.source === "/wp-json/inpost_pl/:path*");

  assert.ok(rule, "Manager Paczek still holds the apex webhook URL");
  assert.match(
    rule.destination,
    /\/wp-json\/inpost_pl\/:path\*$/,
    "ShipX has no API to re-point the webhook; proxy until someone pastes the wp. URL",
  );
});

test("the InPost webhook is proxied, never redirected", async () => {
  const sources = (await redirects()).map((rule) => rule.source);

  assert.ok(
    !sources.some((source) => source.includes("inpost_pl")),
    "a 3xx would drop the POST body InPost uses to update shipment status",
  );
});

test("uploads keep resolving after the apex stops being WordPress", async () => {
  const rule = await find("/wp-content/:path*");

  assert.match(
    rule.destination,
    /\/wp-content\/:path\*$/,
    "an absolute upload URL survives in ticket emails, Facebook posts and Google's index long after a search-replace fixes the database",
  );
});

test("nothing WordPress still serves is left to 404 on the apex", async () => {
  const sources = new Set((await redirects()).map((rule) => rule.source));

  for (const prefix of ["wp-content", "wp-includes", "wp-admin"]) {
    assert.ok(sources.has(`/${prefix}/:path*`), `/${prefix}/ has no redirect`);
  }
});

test("the dropped WordPress news shells land on the news archive", async () => {
  const destinations = new Map((await redirects()).map((rule) => [rule.source, rule.destination]));

  assert.equal(destinations.get("/blog"), "/aktualnosci/");
  assert.equal(destinations.get("/category/:slug*"), "/aktualnosci/");
});

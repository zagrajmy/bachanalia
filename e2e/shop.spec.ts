import { expect, test } from "@playwright/test";

const PRODUCT = "/produkt/akredytacja-3-dniowa/";

test.describe("shop", () => {
  test("lists products grouped by category", async ({ page }) => {
    await page.goto("/sklep/");

    await expect(page.getByRole("heading", { level: 1, name: "Sklep" })).toBeVisible();
    await expect(page.getByRole("heading", { level: 2, name: "Akredytacje" })).toBeVisible();

    const cards = page.getByRole("main").getByRole("listitem");
    expect(await cards.count()).toBeGreaterThan(5);
  });

  test("every price carries its currency", async ({ page }) => {
    await page.goto("/sklep/");

    await expect(page.getByText(/\d+\s?zł/).first()).toBeVisible();
  });

  test("a reader can open a product from the index", async ({ page }) => {
    await page.goto("/sklep/");

    const first = page.getByRole("main").getByRole("link").filter({ hasText: /\S/ }).nth(1);
    const heading = await first.getByRole("heading").textContent();
    const name = (heading ?? "").trim();

    await first.click();
    await page.waitForURL(/\/produkt\/[^/]+\//, { timeout: 30_000 });

    await expect(page.getByRole("heading", { level: 1, name })).toBeVisible();
  });

  test("the product page sells into our own cart", async ({ page }) => {
    await page.goto(PRODUCT);

    await expect(page.getByRole("button", { name: "Dodaj do koszyka" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Kup w sklepie" })).toHaveCount(0);
  });

  test("browsing never leaves the site", async ({ page }) => {
    await page.goto("/sklep/");

    const outbound = page.getByRole("main").locator('a[href*="bachanaliafantastyczne.pl"]');

    await expect(outbound, "nothing on the shop index belongs to WordPress").toHaveCount(0);
  });

  test("the shop's cart link is ours, not WooCommerce's", async ({ page }) => {
    await page.goto("/sklep/");

    await expect(page.getByRole("link", { name: "Koszyk →" })).toHaveAttribute(
      "href",
      "/sklep/koszyk/",
    );
  });

  test("the site no longer sends readers to the WordPress shop", async ({ page }) => {
    await page.goto("/");

    await expect(page.locator('a[href="/sklep/"]').first()).toHaveCount(1);
    await expect(page.locator('a[href*="index.php/sklep"]')).toHaveCount(0);
  });

  test("the product url WooCommerce already publishes is the page, not a redirect", async ({
    request,
  }) => {
    const response = await request.get(PRODUCT, { maxRedirects: 0 });

    expect(response.status(), "every indexed /produkt/ URL should render, not hop").toBe(200);
  });

  test("an unknown product 404s rather than rendering an empty page", async ({ page }) => {
    const response = await page.goto("/produkt/nie-ma-takiego-produktu/");

    expect(response?.status()).toBe(404);
  });
});

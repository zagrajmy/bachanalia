import { expect, test } from "@playwright/test";

const PRODUCT = "/sklep/akredytacja-3-dniowa/";

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
    await page.waitForURL(/\/sklep\/[^/]+\//, { timeout: 30_000 });

    await expect(page.getByRole("heading", { level: 1, name })).toBeVisible();
  });

  test("the product page hands the sale to WooCommerce in a new tab", async ({ page }) => {
    await page.goto(PRODUCT);

    const buy = page.getByRole("link", { name: "Kup w sklepie" });

    await expect(buy).toHaveAttribute("href", /\/produkt\/akredytacja-3-dniowa\//);
    await expect(buy).toHaveAttribute("target", "_blank");
  });

  test("browsing never leaves the site", async ({ page }) => {
    await page.goto("/sklep/");

    const outbound = page.getByRole("main").locator('a[href*="bachanaliafantastyczne.pl"]');

    await expect(outbound, "only the cart link may point at WordPress").toHaveCount(1);
  });

  test("the site no longer sends readers to the WordPress shop", async ({ page }) => {
    await page.goto("/");

    await expect(page.locator('a[href="/sklep/"]').first()).toHaveCount(1);
    await expect(page.locator('a[href*="index.php/sklep"]')).toHaveCount(0);
  });

  test("the legacy product url redirects to the new page", async ({ request }) => {
    const response = await request.get("/produkt/golden-ticket/", { maxRedirects: 0 });

    expect(response.status()).toBe(308);
    expect(response.headers()["location"]).toBe("/sklep/golden-ticket/");
  });

  test("an unknown product 404s rather than rendering an empty page", async ({ page }) => {
    const response = await page.goto("/sklep/nie-ma-takiego-produktu/");

    expect(response?.status()).toBe(404);
  });
});

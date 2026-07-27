import { expect, test } from "@playwright/test";

test.describe("guests archive", () => {
  test("lists the announced guests", async ({ page }) => {
    await page.goto("/goscie/");

    await expect(page.getByRole("heading", { level: 1, name: /goście/i })).toBeVisible();

    const cards = page.getByRole("main").getByRole("listitem");
    expect(await cards.count()).toBeGreaterThan(0);
  });

  test("says which edition the lineup belongs to", async ({ page }) => {
    await page.goto("/goscie/");

    await expect(
      page.getByText(/edycji \d{4}/),
      "last year's guests must not read as this year's lineup",
    ).toBeVisible();
  });

  test("a reader can open a guest and see when it was announced", async ({ page }) => {
    await page.goto("/goscie/");

    const firstGuest = page.getByRole("main").getByRole("listitem").first().getByRole("link");
    const heading = firstGuest.getByRole("heading");
    const name = (await heading.innerText()).trim();

    await heading.click();
    await page.waitForURL(/\/\d{4}\/\d{2}\/\d{2}\//, { timeout: 30_000 });

    await expect(page).toHaveURL(/\/\d{4}\/\d{2}\/\d{2}\//);
    await expect(page.getByRole("heading", { level: 1, name })).toBeVisible();
    await expect(page.locator("time")).toBeVisible();
  });

  test("archive links point at clean paths", async ({ page }) => {
    await page.goto("/goscie/");

    const legacy = page.getByRole("main").locator('a[href*="/index.php/"]');
    await expect(legacy).toHaveCount(0);
  });
});

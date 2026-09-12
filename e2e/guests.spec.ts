import { expect, test } from "@playwright/test";

test.describe("guests", () => {
  test("lists this year's guests with a way to the previous edition", async ({ page }) => {
    await page.goto("/goscie/");

    await expect(page.getByRole("heading", { level: 1, name: /goście/i })).toBeVisible();

    const entries = page.getByRole("main").getByRole("listitem");
    expect(await entries.count()).toBeGreaterThan(0);

    await expect(page.getByRole("main").getByRole("link", { name: "2025" })).toBeVisible();
  });

  test("a reader can open a guest's bio", async ({ page }) => {
    await page.goto("/goscie/");

    const firstGuest = page.getByRole("main").getByRole("listitem").first().getByRole("link");
    const name = (await firstGuest.getByRole("heading").innerText()).trim();

    await firstGuest.click();
    await page.waitForURL(/\/goscie\/[a-z0-9-]+\/$/);

    await expect(page.getByRole("heading", { level: 1, name })).toBeVisible();
    await expect(page.getByRole("article").getByRole("paragraph").first()).toBeVisible();
  });

  test("a guest without a bio is listed but not linked", async ({ page }) => {
    await page.goto("/goscie/");

    const names = page.getByRole("main").getByRole("list").last().getByRole("listitem");
    const unlinked = names.filter({ hasNot: page.getByRole("link") });
    expect(await unlinked.count()).toBeGreaterThan(0);
  });
});

test.describe("guests archive", () => {
  test("keeps last year's guests under their own edition", async ({ page }) => {
    await page.goto("/goscie/2025/");

    await expect(page.getByRole("heading", { level: 1, name: /goście/i })).toBeVisible();
    await expect(page.getByRole("main").getByRole("link", { name: "2026" })).toBeVisible();

    const cards = page.getByRole("main").getByRole("listitem");
    expect(await cards.count()).toBeGreaterThan(0);
  });

  test("a reader can open a guest and see when it was announced", async ({ page }) => {
    await page.goto("/goscie/2025/");

    const firstGuest = page.getByRole("main").getByRole("listitem").first().getByRole("link");
    const name = (await firstGuest.getByRole("heading").innerText()).trim();

    await firstGuest.click();
    await page.waitForURL(/\/\d{4}\/\d{2}\/\d{2}\//, { timeout: 30_000 });

    await expect(page.getByRole("heading", { level: 1, name })).toBeVisible();
    await expect(page.locator("time")).toBeVisible();
  });

  test("archive links point at clean paths", async ({ page }) => {
    await page.goto("/goscie/2025/");

    const legacy = page.getByRole("main").locator('a[href*="/index.php/"]');
    await expect(legacy).toHaveCount(0);
  });
});

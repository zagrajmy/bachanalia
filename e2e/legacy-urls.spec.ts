import { expect, test } from "@playwright/test";

const INDEXED_URLS = [
  { legacy: "/index.php/czas-i-miejsce/", clean: "/czas-i-miejsce/" },
  { legacy: "/index.php/regulamin/", clean: "/regulamin/" },
  { legacy: "/index.php/wspieraja-nas/", clean: "/wspieraja-nas/" },
  { legacy: "/index.php/2025/09/15/filmopolis/", clean: "/2025/09/15/filmopolis/" },
  { legacy: "/index.php/produkt/golden-ticket/", clean: "/produkt/golden-ticket/" },
];

test.describe("legacy WordPress urls", () => {
  for (const { legacy, clean } of INDEXED_URLS) {
    test(`${legacy} redirects permanently in a single hop`, async ({ request }) => {
      const response = await request.get(legacy, { maxRedirects: 0 });

      expect(response.status()).toBe(308);
      expect(
        response.headers()["location"],
        "a destination without the trailing slash costs a second redirect",
      ).toBe(clean);
    });
  }

  test("a reader following an indexed link lands on the real page", async ({ page }) => {
    await page.goto("/index.php/czas-i-miejsce/");

    await expect(page).toHaveURL(/\/czas-i-miejsce\/$/);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });

  test("canonical urls never advertise the legacy path", async ({ page }) => {
    await page.goto("/czas-i-miejsce/");

    const canonical = page.locator('link[rel="canonical"]');
    await expect(canonical).toHaveAttribute("href", /\/czas-i-miejsce\/$/);
    await expect(canonical).not.toHaveAttribute("href", /index\.php/);
  });
});

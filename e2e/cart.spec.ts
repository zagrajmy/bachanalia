import { expect, test } from "@playwright/test";

/**
 * The headless cart talks to the live WooCommerce, so everything here stops
 * short of `checkout`. The one checkout case fails validation on our side and
 * never reaches the mutation — no order is ever placed from a test run.
 */

const SHIRT = "/produkt/golden-ticket/";
const SIZE = "MĘSKA L";
const CART = "/sklep/koszyk/";
const CHECKOUT = "/sklep/kasa/";

const SLOW = { timeout: 30_000 };

async function addShirtToCart(page: import("@playwright/test").Page) {
  await page.goto(SHIRT);
  await page.getByRole("radio", { name: SIZE, exact: true }).check();
  await page.getByRole("button", { name: "Dodaj do koszyka" }).click();
  await page.waitForURL(`**${CART}`, SLOW);
}

test.describe("headless cart", () => {
  test("the WordPress buy path is untouched", async ({ page }) => {
    await page.goto(SHIRT);

    const buy = page.getByRole("link", { name: "Kup w sklepie" });

    await expect(buy).toHaveAttribute("href", /index\.php\/produkt\/golden-ticket\//);
    await expect(buy).toHaveAttribute("target", "_blank");
  });

  test("a variable product cannot be bought before its size is picked", async ({ page }) => {
    await page.goto(SHIRT);

    const add = page.getByRole("button", { name: "Dodaj do koszyka" });

    await expect(add).toBeDisabled();
    await expect(page.getByRole("group", { name: "Rozmar Koszulki" })).toBeVisible();

    await page.getByRole("radio", { name: SIZE, exact: true }).check();

    await expect(add).toBeEnabled();
  });

  test("the cart line names the size that was chosen", async ({ page }) => {
    await addShirtToCart(page);

    await expect(page.getByRole("heading", { level: 1, name: "Koszyk" })).toBeVisible();
    await expect(page.getByRole("heading", { level: 2, name: "Golden Ticket" })).toBeVisible();
    await expect(page.getByText(`Rozmar Koszulki: ${SIZE}`)).toBeVisible();
  });

  test("totals come from WooCommerce and carry a currency", async ({ page }) => {
    await addShirtToCart(page);

    const summary = page.getByRole("main").getByText(/\d+\s?zł/).first();

    await expect(summary).toBeVisible();
  });

  test("the quantity control changes the line and says so out loud", async ({ page }) => {
    await addShirtToCart(page);

    const quantity = page.getByLabel(`Ilość: Golden Ticket`);
    await expect(quantity).toHaveValue("1");

    await page.getByRole("button", { name: "Zwiększ ilość: Golden Ticket" }).click();

    await expect(quantity).toHaveValue("2", SLOW);
    await expect(page.getByRole("status")).toContainText("ilość zmieniona na 2", SLOW);
  });

  test("a line can be removed and the cart admits it is empty", async ({ page }) => {
    await addShirtToCart(page);

    await page.getByRole("button", { name: "Usuń" }).click();

    await expect(page.getByText("Koszyk jest pusty.")).toBeVisible(SLOW);
    await expect(page.getByRole("link", { name: "Wybierz akredytację" })).toBeVisible();
  });

  test("checkout with an empty cart sends the buyer back rather than nowhere", async ({ page }) => {
    await page.goto(CHECKOUT);

    await expect(page).toHaveURL(new RegExp(`${CART}$`), SLOW);
  });

  test("every checkout field carries a real label", async ({ page }) => {
    await addShirtToCart(page);
    await page.goto(CHECKOUT);

    for (const label of [
      "Imię",
      "Nazwisko",
      "Adres e-mail",
      "Telefon",
      "Ulica i numer",
      "Kod pocztowy",
      "Miejscowość",
    ]) {
      await expect(page.getByLabel(label, { exact: true })).toBeVisible();
    }
  });

  test("the gateways WooGraphQL cannot drive are never offered", async ({ page }) => {
    await addShirtToCart(page);
    await page.goto(CHECKOUT);

    await expect(page.getByRole("radio", { name: /Przelew bankowy/ })).toBeVisible(SLOW);
    await expect(page.getByRole("radio", { name: /BLIKIEM/ })).toHaveCount(0);
    await expect(page.getByRole("radio", { name: /szybkim przelewem/ })).toHaveCount(0);
  });

  test("a bad postcode is refused on our side and tied to its input", async ({ page }) => {
    await addShirtToCart(page);
    await page.goto(CHECKOUT);

    await page.getByLabel("Imię", { exact: true }).fill("Jan");
    await page.getByLabel("Nazwisko", { exact: true }).fill("Kowalski");
    await page.getByLabel("Adres e-mail", { exact: true }).fill("jan@example.com");
    await page.getByLabel("Telefon", { exact: true }).fill("600100200");
    await page.getByLabel("Ulica i numer", { exact: true }).fill("Wojska Polskiego 69");
    await page.getByLabel("Kod pocztowy", { exact: true }).fill("65762");
    await page.getByLabel("Miejscowość", { exact: true }).fill("Zielona Góra");

    await page.getByRole("button", { name: "Zamawiam i płacę" }).click();

    const postcode = page.getByLabel("Kod pocztowy", { exact: true });

    await expect(postcode).toHaveAttribute("aria-invalid", "true", SLOW);

    const describedBy = await postcode.getAttribute("aria-describedby");
    expect(describedBy).toBeTruthy();
    await expect(page.locator(`#${describedBy}`)).toHaveText("Kod pocztowy w formacie 00-000.");
  });

  test("the cart is never handed to a crawler", async ({ page }) => {
    await page.goto(CART);

    await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
      "content",
      /noindex/,
    );
  });
});

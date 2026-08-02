import { expect, test, type Page } from "@playwright/test";

/**
 * WordPress is recorded into `e2e/fixtures/wp` and replayed by `msw` inside the
 * Next server, so nothing here reaches the live shop and every mutation is a
 * mutation of an in-memory cart. Re-record with `bun run e2e:record`.
 *
 * The one thing that stays hypothetical is the handover: "Przejdź do płatności"
 * is only ever read as a link, because following it opens a real WooCommerce
 * checkout on `wp.`.
 */

const SHIRT = "/produkt/golden-ticket/";
const SIZE = "MĘSKA L";
const TIP_JAR = "/produkt/wsparcie-klubu-1-zl/";
const CART = "/sklep/koszyk/";

/**
 * The size radios are `sr-only` inside their labels, so the label is both what
 * a buyer clicks and the only thing with a rectangle to click. Driving the
 * clipped input instead makes Chrome scroll it under the sticky header.
 */
async function pickSize(page: Page) {
  await page.getByText(SIZE, { exact: true }).click();
  await expect(page.getByRole("radio", { name: SIZE, exact: true })).toBeChecked();
}

async function addShirtToCart(page: Page) {
  await page.goto(SHIRT);
  await pickSize(page);
  await page.getByRole("button", { name: "Dodaj do koszyka" }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
}

const cartButton = (page: Page) => page.getByRole("button", { name: /^Koszyk, / });

test.describe("headless cart", () => {
  /**
   * Next's dev overlay parks its badge in a corner of the viewport, which is
   * where the cart button lives. It ships with no build, so it is chrome to get
   * out of the way rather than a collision to design around.
   */
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      document.addEventListener("DOMContentLoaded", () => {
        const style = document.createElement("style");
        style.textContent = "nextjs-portal{display:none!important}";
        document.head.append(style);
      });
    });
  });

  test("a variable product cannot be bought before its size is picked", async ({ page }) => {
    await page.goto(SHIRT);

    const add = page.getByRole("button", { name: "Dodaj do koszyka" });

    await expect(add).toBeDisabled();
    await expect(page.getByRole("group", { name: "Rozmar Koszulki" })).toBeVisible();

    await pickSize(page);

    await expect(add).toBeEnabled();
  });

  test("an empty cart is not advertised in the corner of every page", async ({ page }) => {
    await page.goto(SHIRT);

    await expect(page.getByRole("button", { name: "Dodaj do koszyka" })).toBeVisible();
    await expect(cartButton(page)).toHaveCount(0);
  });

  test("adding opens the cart beside the product instead of leaving it", async ({ page }) => {
    await addShirtToCart(page);

    await expect(page).toHaveURL(new RegExp(`${SHIRT}$`));
    /** The product is still behind the sheet — modal, so hidden, not gone. */
    await expect(page.locator("h1")).toHaveText("Golden Ticket");
  });

  test("the sheet names the size that was chosen and totals it", async ({ page }) => {
    await addShirtToCart(page);

    const sheet = page.getByRole("dialog");

    await expect(sheet.getByRole("heading", { name: "Golden Ticket" })).toBeVisible();
    await expect(sheet.getByText(`Rozmar Koszulki: ${SIZE}`)).toBeVisible();
    await expect(sheet.getByText(/\d+\s?zł/).first()).toBeVisible();
  });

  test("the cart button counts what is in it and opens the sheet again", async ({ page }) => {
    await addShirtToCart(page);
    await page.keyboard.press("Escape");

    const trigger = page.getByRole("button", { name: "Koszyk, 1 produkt", exact: true });

    await expect(trigger).toBeVisible();

    await trigger.click();

    await expect(page.getByRole("dialog")).toBeVisible();
  });

  test("the quantity control changes the line and says so out loud", async ({ page }) => {
    await addShirtToCart(page);

    const sheet = page.getByRole("dialog");
    const quantity = sheet.getByRole("spinbutton", { name: "Ilość: Golden Ticket" });

    await expect(quantity).toHaveValue("1");

    await sheet.getByRole("button", { name: "Zwiększ ilość: Golden Ticket" }).click();

    await expect(quantity).toHaveValue("2");
    await expect(sheet.getByRole("status")).toContainText("ilość zmieniona na 2");
    await expect(cartButton(page)).toHaveAccessibleName("Koszyk, 2 produkty");
  });

  test("a line can be removed and the sheet admits the cart is empty", async ({ page }) => {
    await addShirtToCart(page);

    const sheet = page.getByRole("dialog");

    await sheet.getByRole("button", { name: "Usuń" }).click();

    await expect(sheet.getByText("Koszyk jest pusty.")).toBeVisible();
    await expect(sheet.getByRole("link", { name: "Wybierz akredytację" })).toBeVisible();
  });

  test("Escape closes the sheet and hands focus back to the button", async ({ page }) => {
    await addShirtToCart(page);

    await page.keyboard.press("Escape");

    await expect(page.getByRole("dialog")).toHaveCount(0);
    await expect(cartButton(page)).toBeFocused();
  });

  test("the cart button stays inside the viewport and off the cart page", async ({ page }) => {
    await addShirtToCart(page);
    await page.keyboard.press("Escape");

    const button = (await cartButton(page).boundingBox())!;
    const viewport = page.viewportSize()!;

    expect(button.x + button.width).toBeLessThanOrEqual(viewport.width);
    expect(button.y + button.height).toBeLessThanOrEqual(viewport.height);

    /** The cart page is the cart; a button pointing at it from there is noise. */
    await page.goto(CART);
    await expect(cartButton(page)).toHaveCount(0);
  });

  test("a product sold individually offers no quantity at all", async ({ page }) => {
    await page.goto(TIP_JAR);

    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(
      page.getByRole("spinbutton", { name: "Ilość" }),
      "WooCommerce refuses the second unit, so it should never be offered",
    ).toHaveCount(0);
    await expect(page.getByRole("button", { name: "Dodaj do koszyka" })).toBeEnabled();
  });

  test("payment is WooCommerce's, and nothing here pretends otherwise", async ({ page }) => {
    await addShirtToCart(page);

    const sheet = page.getByRole("dialog");
    const inSheet = await sheet.getByRole("link", { name: "Przejdź do płatności" }).count();

    /**
     * The link only exists once *User Session transferring URLs* is enabled in
     * WordPress. Whichever way the shop is set today, both surfaces have to say
     * the same thing — the sheet must not invent a second behaviour.
     */
    if (inSheet) {
      await expect(sheet.getByRole("link", { name: "Przejdź do płatności" })).toHaveAttribute(
        "href",
        /transfer-session/,
      );
    } else {
      await expect(sheet.getByText("Kasa jest chwilowo niedostępna.")).toBeVisible();
    }

    await page.goto(CART);

    const onPage = page.getByRole("link", { name: "Przejdź do płatności" });

    expect(await onPage.count(), "the sheet and the cart page answer alike").toBe(inSheet);

    if (inSheet) {
      /** Read, never followed: the destination is a real WooCommerce checkout. */
      await expect(onPage).toHaveAttribute("href", /transfer-session/);
    } else {
      await expect(page.getByText("Kasa jest chwilowo niedostępna.")).toBeVisible();
    }

    await expect(page.getByRole("button", { name: "Zamawiam i płacę" })).toHaveCount(0);
  });

  test("the cart is never handed to a crawler", async ({ page }) => {
    await page.goto(CART);

    await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
  });
});

test.describe("without scripting", () => {
  test.use({ javaScriptEnabled: false });

  test("the cart still fills, reads and empties", async ({ page }) => {
    await page.goto(SHIRT);

    /** The label is the click target; the radio inside it is `sr-only`. */
    await page.getByText(SIZE, { exact: true }).click();
    await page.getByRole("button", { name: "Dodaj do koszyka" }).click();

    await expect(page.getByText("Dodano do koszyka.")).toBeVisible();

    /** The confirmation is the only route to the cart with no sheet to open. */
    await page.getByRole("link", { name: "Koszyk →" }).click();

    await expect(page.getByRole("heading", { level: 1, name: "Koszyk" })).toBeVisible();
    await expect(page.getByRole("heading", { level: 2, name: "Golden Ticket" })).toBeVisible();
    await expect(page.getByText(`Rozmar Koszulki: ${SIZE}`)).toBeVisible();
    await expect(page.getByRole("main").getByText(/\d+\s?zł/).first()).toBeVisible();

    await page.getByRole("button", { name: "Zwiększ ilość: Golden Ticket" }).click();

    await expect(page.getByRole("spinbutton", { name: "Ilość: Golden Ticket" })).toHaveValue("2");

    await page.getByRole("button", { name: "Usuń" }).click();

    await expect(page.getByText("Koszyk jest pusty.")).toBeVisible();
  });
});

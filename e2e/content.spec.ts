import { expect, test } from "@playwright/test";

test.describe("WordPress content rendering", () => {
  test("a text-heavy page renders its body copy at a readable measure", async ({ page }) => {
    await page.goto("/regulamin/");

    const body = page.locator(".wp-content");
    await expect(body).toBeVisible();

    const paragraph = body.getByRole("paragraph").first();
    await expect(paragraph).toBeVisible();

    const width = (await paragraph.boundingBox())?.width ?? 0;
    expect(width, "prose should stay near 70ch, not span the viewport").toBeLessThan(900);
  });

  test("paragraphs are separated, not run together", async ({ page }) => {
    await page.goto("/czas-i-miejsce/");

    const spacing = await page
      .locator(".wp-content p")
      .first()
      .evaluate((node) => getComputedStyle(node).marginBottom);

    expect(
      Number.parseFloat(spacing),
      "Elementor wrappers are display:contents, so sibling-combinator rhythm silently stops matching",
    ).toBeGreaterThan(0);
  });

  test("Elementor scaffolding is removed from layout", async ({ page }) => {
    await page.goto("/czas-i-miejsce/");

    const section = page.locator(".wp-content .elementor-section").first();
    await expect(section).toHaveCount(1);
    await expect(section).toHaveCSS("display", "contents");
  });

  test("embedded media stays inside the page", async ({ page }) => {
    await page.goto("/czas-i-miejsce/");

    const frame = page.locator(".wp-content iframe").first();
    await expect(frame).toBeVisible();

    const box = await frame.boundingBox();
    const viewport = page.viewportSize();
    expect(box!.width).toBeLessThanOrEqual(viewport!.width);
  });

  test("a gallery shows its photos as a grid, not one image per row", async ({ page }) => {
    await page.goto("/co-to-sa-bachanalia/");

    const gallery = page.locator(".wp-content .elementor-image-carousel").first();
    await expect(gallery).toBeVisible();

    const columns = await gallery.evaluate(
      (node) => getComputedStyle(node).gridTemplateColumns.split(" ").length,
    );

    expect(columns, "54 stacked photos is what the contact sheet exists to avoid").toBeGreaterThan(
      1,
    );
  });

  test("an empty page says so rather than rendering a bare heading", async ({ page }) => {
    await page.goto("/blok-komiksowy/");

    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(
      page.getByText(/szykujemy tę stronę/i),
      "these pages ship kilobytes of Elementor wrappers around no content at all",
    ).toBeVisible();
  });

  test("a page whose only content is an embed is not mistaken for empty", async ({ page }) => {
    await page.goto("/sztab-bachanaliowy/");

    await expect(page.getByText(/szykujemy tę stronę/i)).toHaveCount(0);
    await expect(page.locator(".wp-content iframe")).toBeVisible();
  });

  test("no page scrolls sideways", async ({ page }) => {
    for (const path of ["/", "/czas-i-miejsce/", "/regulamin/", "/goscie/"]) {
      await page.goto(path);

      const overflows = await page.evaluate(
        () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
      );

      expect(overflows, `${path} overflows horizontally`).toBe(false);
    }
  });

  test("the site never serves the old SEO spam", async ({ page }) => {
    await page.goto("/czas-i-miejsce/");

    const body = await page.locator("body").innerText();
    expect(body).not.toMatch(/kraken|tryggbitrow/i);
    expect(body, "cyrillic has no business on a Polish convention site").not.toMatch(
      /[а-яА-Я]{4,}/,
    );
  });
});

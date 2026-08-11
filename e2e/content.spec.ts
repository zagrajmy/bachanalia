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

  test("an embed reaches nobody until consent is given", async ({ page }) => {
    await page.goto("/czas-i-miejsce/");

    const placeholder = page.locator(".wp-content [data-embed-src]").first();

    await expect(placeholder).toBeVisible();
    await expect(
      placeholder,
      "the visitor is told whose server they are being asked about",
    ).toContainText("maps.google.com");
    await expect(placeholder.getByRole("link", { name: "Otwórz w nowej karcie" })).toHaveAttribute(
      "href",
      /maps\.google\.com/,
    );

    /**
     * The assertion the whole feature exists for. CookieYes showed a banner and
     * left every `src` alone, so the request went out before anyone was asked.
     */
    await expect(page.locator("iframe"), "no third-party request before a choice").toHaveCount(0);
  });

  test("consent loads the embed, and it stays inside the page", async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem("bf-consent", "granted");
    });
    await page.goto("/czas-i-miejsce/");

    const frame = page.locator(".wp-content iframe").first();

    await expect(frame).toBeVisible();
    await expect(frame).toHaveAttribute("src", /maps\.google\.com/);

    const box = (await frame.boundingBox())!;
    expect(box.width).toBeLessThanOrEqual(page.viewportSize()!.width);
    await expect
      .poll(async () => page.evaluate(() => localStorage.getItem("bf-consent:v1")))
      .toBe("granted");
  });

  test("current consent removes the obsolete choice", async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem("bf-consent:v1", "granted");
      localStorage.setItem("bf-consent", "denied");
    });
    await page.goto("/czas-i-miejsce/");

    await expect(page.getByTitle("Wojska Polskiego 69, Zielona Góra, Poland")).toBeVisible();
    await expect
      .poll(async () => page.evaluate(() => localStorage.getItem("bf-consent")))
      .toBeNull();
  });

  test("a gallery shows its photos as a grid, not one image per row", async ({ page }) => {
    await page.goto("/co-to-sa-bachanalia/");

    const gallery = page.locator("[data-gallery]").first();
    await expect(gallery).toBeVisible();

    const columns = await gallery.evaluate(
      (node) => getComputedStyle(node).gridTemplateColumns.split(" ").length,
    );

    expect(columns, "54 stacked photos is what the contact sheet exists to avoid").toBeGreaterThan(
      1,
    );
  });

  test("gallery photos come off the baked ladder, not from WordPress", async ({ page }) => {
    await page.goto("/co-to-sa-bachanalia/");

    const sources = await page
      .locator("[data-gallery] img")
      .evaluateAll((nodes) => nodes.map((node) => node.getAttribute("src") ?? ""));

    expect(sources.length).toBeGreaterThan(0);
    expect(
      /**
       * `mediaLoader` serves `/_img/<upload>/<width>.webp` and falls back to the
       * WordPress URL for anything the manifest does not name, so a photo
       * missing from `img-manifest.json` shows up here rather than as a slow
       * page nobody measured.
       */
      sources.filter((src) => src.startsWith("/_img/")),
      "raw WordPress originals are multi-megabyte",
    ).toHaveLength(sources.length);
  });

  test("a photo opens in the lightbox and hands focus back on Escape", async ({ page }) => {
    await page.goto("/co-to-sa-bachanalia/");

    const third = page.getByRole("button", { name: /Powiększ zdjęcie 3 z/ });
    await third.click();

    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await expect(dialog).toHaveAccessibleName(/Zdjęcie 3 z/);

    await page.keyboard.press("ArrowRight");
    await expect(dialog).toHaveAccessibleName(/Zdjęcie 4 z/);

    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
    await expect(page.getByRole("button", { name: /Powiększ zdjęcie 4 z/ })).toBeFocused();
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

    const placeholder = page.locator(".wp-content [data-embed-src]").first();

    /** A parked embed is still content — the page must not read as unwritten. */
    await expect(page.getByText(/szykujemy tę stronę/i)).toHaveCount(0);
    await expect(placeholder).toBeVisible();
    await expect(placeholder).toContainText("miro.com");
    await expect(page.locator("iframe"), "no third-party request before a choice").toHaveCount(0);
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

    /**
     * `innerText` returns only what is painted, and injected spam is hidden by
     * construction — off-screen, zero-height, `display: none`. This one test
     * has to read the DOM, not the render.
     */
    const body = (await page.locator("body").textContent()) ?? "";
    expect(body).not.toMatch(/kraken|tryggbitrow/i);
    expect(body, "cyrillic has no business on a Polish convention site").not.toMatch(
      /[а-яА-Я]{4,}/,
    );
  });
});

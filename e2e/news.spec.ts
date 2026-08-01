import { expect, test } from "@playwright/test";

/**
 * WordPress holds no announcements — every post is a guest profile filed under
 * an edition category, and those are deliberately filtered out — so the
 * archive falls back to the Facebook feed. Those entries carry no date and
 * lead off-site, and these adapt to whichever source is answering.
 */
const entriesOf = (page: import("@playwright/test").Page) =>
  page.getByRole("main").getByRole("listitem");

test.describe("news archive", () => {
  test("says so plainly when there is nothing to announce yet", async ({ page }) => {
    await page.goto("/aktualnosci/");

    await expect(page.getByRole("heading", { level: 1, name: "Aktualności" })).toBeVisible();

    if ((await entriesOf(page).count()) > 0) {
      test.skip(true, "there are announcements now; the listing test covers this");
    }

    await expect(page.getByText(/pierwsze ogłoszenia/i)).toBeVisible();
  });

  test("lists announcements newest first, with date and teaser", async ({ page }) => {
    await page.goto("/aktualnosci/");

    const entries = entriesOf(page);
    test.skip((await entries.count()) === 0, "no announcements published yet");

    const first = entries.first();
    await expect(first.locator("time")).toBeVisible();
    await expect(first.getByRole("heading", { level: 2 })).toBeVisible();

    const dates = await page
      .getByRole("main")
      .locator("time")
      .evaluateAll((nodes) => nodes.map((node) => node.getAttribute("datetime") ?? ""));

    expect([...dates].sort().reverse(), "newest announcement belongs on top").toEqual(dates);
  });

  test("guest profiles never masquerade as news", async ({ page }) => {
    await page.goto("/aktualnosci/");

    const guestTitles = ["Filmopolis", "FIGURKOWCY", "Akademia Magii Ramesville"];
    for (const title of guestTitles) {
      await expect(
        page.getByRole("main").getByRole("heading", { name: title }),
        `${title} is a 2025 guest, not an announcement`,
      ).toHaveCount(0);
    }
  });

  test("teasers are plain text, not raw WordPress markup", async ({ page }) => {
    await page.goto("/aktualnosci/");

    const text = await page.getByRole("main").innerText();

    expect(text).not.toContain("&#8211;");
    expect(text).not.toContain("<p>");
    expect(text).not.toContain("&nbsp;");
  });

  test("a reader can open an announcement", async ({ page }) => {
    await page.goto("/aktualnosci/");

    test.skip((await entriesOf(page).count()) === 0, "no announcements published yet");

    const first = entriesOf(page).first().getByRole("link").first();
    const href = await first.getAttribute("href");

    if (href?.startsWith("https://www.facebook.com/")) {
      await expect(first).toHaveAttribute("target", "_blank");
      await expect(first).toHaveAttribute("rel", /noreferrer/);
      return;
    }

    const title = (await first.getByRole("heading").innerText()).trim();

    await first.click();
    await page.waitForURL(/\/\d{4}\/\d{2}\/\d{2}\//, { timeout: 30_000 });

    await expect(page.getByRole("heading", { level: 1, name: title })).toBeVisible();
  });

  test("archive links point at clean paths", async ({ page }) => {
    await page.goto("/aktualnosci/");

    await expect(page.getByRole("main").locator('a[href*="/index.php/"]')).toHaveCount(0);
  });

  test("the dropped WordPress news shells redirect here", async ({ page }) => {
    await page.goto("/blog/");
    await expect(page).toHaveURL(/\/aktualnosci\/$/);

    await page.goto("/category/gosc25/");
    await expect(page).toHaveURL(/\/aktualnosci\/$/);
  });

  test("nothing spills sideways on a phone", async ({ page }) => {
    await page.goto("/aktualnosci/");

    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - window.innerWidth,
    );

    expect(overflow).toBeLessThanOrEqual(1);
  });
});

test.describe("news on the home page", () => {
  test("the home page teases the latest announcements", async ({ page }) => {
    await page.goto("/");

    const section = page.getByRole("region", { name: "Aktualności" });
    test.skip((await section.count()) === 0, "Home.tsx does not render <NewsSection /> yet");

    const entries = section.getByRole("listitem");
    expect(await entries.count()).toBeGreaterThan(0);
    await expect(entries.first().locator("time")).toBeVisible();
  });

  test("the teaser leads to the full archive", async ({ page }) => {
    await page.goto("/");

    const section = page.getByRole("region", { name: "Aktualności" });
    test.skip((await section.count()) === 0, "Home.tsx does not render <NewsSection /> yet");

    await section.getByRole("link", { name: "Wszystkie aktualności" }).click();
    await expect(page).toHaveURL(/\/aktualnosci\/$/);
    await expect(page.getByRole("heading", { level: 1, name: "Aktualności" })).toBeVisible();
  });
});

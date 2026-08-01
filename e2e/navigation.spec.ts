import { expect, test } from "@playwright/test";

import { footerNav, primaryCta, primaryNav } from "../src/components/Globals/siteNav";

const everyDestination = [
  ...primaryNav.flatMap((group) => [group, ...(group.children ?? [])]),
  primaryCta,
  ...footerNav.flatMap((group) => group.links),
]
  .filter((link) => !("external" in link && link.external))
  .filter((link, index, all) => all.findIndex((other) => other.href === link.href) === index);

test.describe("site navigation", () => {
  for (const { href, label } of everyDestination) {
    test(`${href} is reachable and titled`, async ({ page }) => {
      const response = await page.goto(href);

      expect(response?.status(), `${label} should not error`).toBeLessThan(400);
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
      await expect(page.getByRole("heading", { level: 1 })).not.toBeEmpty();
    });
  }

  test("every primary nav link is a real destination, not a dead end", async ({
    page,
    isMobile,
  }) => {
    test.skip(isMobile, "below lg the same links live inside the disclosure menu");
    await page.goto("/");

    for (const { href, label } of primaryNav) {
      await expect(page.getByRole("banner").getByRole("link", { name: label })).toHaveAttribute(
        "href",
        href,
      );
    }
  });

  test("the header offers exactly one route to an accreditation", async ({ page, isMobile }) => {
    test.skip(isMobile, "the header CTA collapses into the disclosure menu below lg");
    await page.goto("/");

    const header = page.getByRole("banner");
    await expect(header.getByRole("link", { name: primaryCta.label })).toHaveCount(1);
    await expect(header.getByRole("link", { name: primaryCta.label })).toHaveAttribute(
      "href",
      primaryCta.href,
    );
  });

  test("a nested destination is reachable by keyboard, not hover alone", async ({
    page,
    isMobile,
  }) => {
    test.skip(isMobile, "below lg every link is already flat inside the disclosure menu");
    await page.goto("/");

    const group = primaryNav.find((item) => item.children?.length);
    const child = group!.children![group!.children!.length - 1];
    const header = page.getByRole("banner");

    await header.getByRole("link", { name: group!.label, exact: true }).focus();

    const link = header.getByRole("link", { name: child.label, exact: true });
    await expect(link, "focus-within must open the panel, or the menu is mouse-only").toBeVisible();

    await link.click();
    await expect(page).toHaveURL(new RegExp(`${child.href}$`));
  });

  test("a phone user can open the menu and reach a destination", async ({ page, isMobile }) => {
    test.skip(!isMobile, "the disclosure menu only exists below the lg breakpoint");

    await page.goto("/");
    await page.getByRole("banner").getByRole("button", { name: "Menu" }).click();

    const target = primaryNav[0];
    const menu = page.getByRole("dialog");
    await expect(menu).toBeVisible();
    await menu.getByRole("link", { name: target.label, exact: true }).click();

    await expect(page).toHaveURL(new RegExp(`${target.href}$`));
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });

  test("skip link lets a keyboard user jump past the navigation", async ({ page }) => {
    await page.goto("/");
    await page.keyboard.press("Tab");

    const skipLink = page.getByRole("link", { name: /przejdź do treści/i });
    await expect(skipLink).toBeFocused();

    await skipLink.press("Enter");
    await expect(page).toHaveURL(/#tresc$/);
  });
});

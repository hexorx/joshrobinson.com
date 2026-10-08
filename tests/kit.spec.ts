import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
for (const width of [1440, 390]) {
  test(`404 mark, keyboard recovery and accessibility at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/404");
    const slot = page.locator('[data-brand-mark="S08"]');
    await expect(slot).toHaveCSS("width", width === 1440 ? "420px" : "300px");
    await expect(slot).toHaveCSS("height", width === 1440 ? "440px" : "320px");
    await expect(slot).toHaveText(">_");
    await expect(slot.locator("img")).toHaveCount(0);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBeTruthy();
    expect(
      (
        await new AxeBuilder({ page })
          .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
          .analyze()
      ).violations,
    ).toEqual([]);
    await page.screenshot({
      path: `docs/screenshots/404-${width}.png`,
      fullPage: true,
    });
    await page.locator("#main-content").focus();
    await page.keyboard.press("Tab");
    await expect(page.getByRole("link", { name: "Go home" })).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL("/");
  });
}

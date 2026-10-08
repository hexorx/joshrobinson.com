import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { mkdir } from "node:fs/promises";

for (const width of [1440, 390]) {
  test(`writing index at ${width}`, async ({ page }) => {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto("/writing/");
    await expect(
      page.getByRole("heading", { name: "Writing", exact: true }),
    ).toBeVisible();
    await expect(page.locator("body")).toContainText(
      "Plain-English notes on putting AI to work in a real business",
    );
    await expect(page.locator("body")).not.toContainText("[Placeholder]");
    await expect(page.locator('[data-mascot-slot="S05"]')).toHaveCSS(
      "width",
      width === 1440 ? "220px" : "170px",
    );
    await expect(page.locator(".writing-rows > li")).toHaveCount(0);
    const violations = (
      await new AxeBuilder({ page }).analyze()
    ).violations.filter((v) =>
      ["serious", "critical"].includes(v.impact || ""),
    );
    expect(violations).toEqual([]);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await mkdir("docs/screenshots", { recursive: true });
    await page.screenshot({
      path: `docs/screenshots/writing-${width}.png`,
      fullPage: true,
    });
  });
}

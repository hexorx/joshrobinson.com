import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
for (const width of [1440, 390]) {
  test(`track record, S07 and accessibility at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/track-record/");
    await expect(page.locator("h1")).toHaveText("Track record");
    await expect(page.locator("body")).toContainText("BLDX");
    await expect(page.locator("body")).toContainText("American Red Cross");
    await expect(page.locator("body")).toContainText("US Patent 10,373,426");
    await expect(page.locator("body")).not.toContainText("[Placeholder]");
    await expect(page.locator("body")).not.toContainText("Download CV");
    await expect(page.locator("body")).not.toContainText("open to");
    const slot = page.locator('[data-mascot-slot="S07"]');
    await expect(slot).toHaveCSS("width", width === 1440 ? "150px" : "110px");
    await expect(slot).toHaveCSS("height", width === 1440 ? "190px" : "150px");
    expect(
      await slot
        .locator("img")
        .evaluate(
          (img: HTMLImageElement) =>
            img.complete &&
            img.naturalWidth === 600 &&
            img.naturalHeight === 760,
        ),
    ).toBeTruthy();
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
      path: `docs/screenshots/resume-${width}.png`,
      fullPage: true,
    });
  });
}
test("resume redirects to the track record", async ({ page }) => {
  await page.goto("/resume/");
  await expect(page).toHaveURL(/\/track-record\/?$/);
  await expect(page.locator("h1")).toHaveText("Track record");
});
test("print removes chrome and the mascot", async ({ page }) => {
  await page.goto("/track-record/");
  await page.emulateMedia({ media: "print" });
  await expect(page.locator(".site-header")).toBeHidden();
  await expect(page.locator("footer")).toBeHidden();
  await expect(page.locator('[data-mascot-slot="S07"]')).toBeHidden();
  await expect(page.locator("body")).toHaveCSS(
    "background-color",
    "rgb(255, 255, 255)",
  );
});

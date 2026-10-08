import { test, expect } from "@playwright/test";
for (const width of [1440, 390]) {
  test(`home consulting copy and mascot slots at ${width}px`, async ({
    page,
  }, testInfo) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/");
    await expect(page.locator("h1")).toHaveText(
      "Everyone says use AI. I'll show you how.",
    );
    await expect(page.locator("body")).not.toContainText("[Placeholder]");
    await expect(page.locator("body")).not.toContainText("[TODO");
    for (const [id, source, desktop, mobile] of [
      ["S02", [960, 1600], [200, 380], [240, 300]],
      ["S03", [1000, 1000], [300, 300], [240, 240]],
    ] as const) {
      const slot = page.locator(`[data-mascot-slot="${id}"]`);
      const size = width === 390 ? mobile : desktop;
      await expect(slot).toHaveCSS("width", `${size[0]}px`);
      await expect(slot).toHaveCSS("height", `${size[1]}px`);
      const img = slot.locator("img");
      await expect(img).toHaveAttribute("width", `${source[0]}`);
      await expect(img).toHaveAttribute("height", `${source[1]}`);
      await expect(img).toHaveCSS("object-fit", "contain");
      expect(
        await img.evaluate(
          (el: HTMLImageElement) => el.complete && el.naturalWidth > 0,
        ),
      ).toBeTruthy();
    }
    await expect(
      page.getByRole("link", { name: "See: AI for Realtors" }),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: "Book a 30-minute intro call ↵" }).first(),
    ).toHaveAttribute("href", "https://cal.com/joshrobinson/intro");
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBeTruthy();
    await page.screenshot({
      path: testInfo.outputPath(`home-${width}.png`),
      fullPage: true,
    });
  });
}

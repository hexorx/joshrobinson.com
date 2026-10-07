import { test, expect } from "@playwright/test";
import { readFileSync } from "node:fs";
const resume = JSON.parse(
  readFileSync(new URL("../src/data/resume.json", import.meta.url), "utf8"),
);
for (const width of [1440, 390]) {
  test(`home slots, content and inert newsletter at ${width}px`, async ({
    page,
  }, testInfo) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/");
    await expect(page.locator("h1")).toHaveText(
      "I architect AI systems that ship to production.",
    );
    for (const [id, source, desktop, mobile] of [
      ["S02", [960, 1600], [200, 380], [240, 300]],
      ["S03", [1000, 1000], [300, 300], [240, 240]],
      ["S04", [680, 340], [170, 86], [140, 72]],
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
    await expect(page.locator(".project")).toHaveCount(6);
    for (const job of resume.experience.slice(0, 5)) {
      await expect(page.locator(".career")).toContainText(
        `${job.role} · ${job.company}`,
      );
    }
    await expect(page.locator(".career")).not.toContainText("2020");
    await expect(page.locator(".posts")).not.toContainText("Draft");
    await expect(
      page.getByRole("button", { name: "Subscribe ↵" }),
    ).toBeDisabled();
    await expect(page.locator(".newsletter form")).toHaveCount(0);
    const requests: string[] = [];
    page.on("request", (request) => requests.push(request.url()));
    await page.getByLabel("Email address").fill("test@example.com");
    await page.getByLabel("Email address").press("Enter");
    expect(requests).toEqual([]);
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

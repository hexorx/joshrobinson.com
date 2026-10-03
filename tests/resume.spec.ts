import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { readFileSync } from "node:fs";
const resume = JSON.parse(
  readFileSync(new URL("../src/data/resume.json", import.meta.url), "utf8"),
);
for (const width of [1440, 390]) {
  test(`career source, S07 and accessibility at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/resume/");
    await expect(page.locator(".entry")).toHaveCount(resume.experience.length);
    for (const job of resume.experience) {
      const entry = page.locator(".entry").filter({ hasText: job.company });
      await expect(entry).toContainText(job.role);
      await expect(entry).toContainText(job.start);
      await expect(entry).toContainText(job.end);
      await expect(entry.locator(".job li")).toHaveCount(job.highlights.length);
      expect(
        await entry.evaluate((el) => el.classList.contains("current")),
      ).toBe(job.current);
    }
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
    await page.evaluate(() => document.fonts.ready);
    await page.screenshot({
      path: `docs/screenshots/resume-${width}.png`,
      fullPage: true,
    });
    await page.evaluate(() => {
      window.print = () => {
        document.body.dataset.printCalled = "true";
      };
    });
    await page.getByRole("button", { name: "Download PDF" }).click();
    await expect(page.locator("body")).toHaveAttribute(
      "data-print-called",
      "true",
    );
  });
}
test("print removes chrome and grid and preserves facts in black ink", async ({
  page,
}) => {
  await page.goto("/resume/");
  await page.emulateMedia({ media: "print" });
  await expect(page.locator(".site-header")).toBeHidden();
  await expect(page.locator("footer")).toBeHidden();
  await expect(page.locator('[data-mascot-slot="S07"]')).toBeHidden();
  await expect(page.locator("body")).toHaveCSS(
    "background-color",
    "rgb(255, 255, 255)",
  );
  await expect(page.locator(".ref").first()).toHaveCSS("color", "rgb(0, 0, 0)");
  for (const job of resume.experience)
    await expect(
      page.locator(".entry").filter({ hasText: job.company }),
    ).toBeVisible();
  await page.pdf({
    path: "docs/screenshots/resume-print.pdf",
    preferCSSPageSize: true,
    printBackground: false,
  });
});

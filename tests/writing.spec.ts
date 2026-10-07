import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { mkdir } from "node:fs/promises";

for (const width of [1440, 390]) {
  test(`writing and post accessibility at ${width}`, async ({
    page,
    context,
  }) => {
    await page.setViewportSize({ width, height: 1000 });
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);
    await page.goto("/blog/");
    await expect(
      page.getByRole("heading", { name: "Writing", exact: true }),
    ).toBeVisible();
    await expect(page.locator('[data-mascot-slot="S05"]')).toHaveCSS(
      "width",
      width === 1440 ? "220px" : "170px",
    );
    await expect(page.locator(".writing-rows > li")).toHaveCount(1);
    await page.getByRole("link", { name: "#meta (1)" }).click();
    await expect(page).toHaveURL(/\/tags\/meta\//);
    await page.locator(".writing-rows .post-title").click();
    await expect(page).toHaveURL(/\/blog\/hello-world\//);
    await expect(page.locator('meta[property="og:type"]')).toHaveAttribute(
      "content",
      "article",
    );
    await expect(page.locator('meta[property="og:image"]')).toHaveAttribute(
      "content",
      /og-post-template-1200x630.png$/,
    );
    await expect(page.locator('[data-mascot-slot="S06"]')).toHaveCSS(
      "width",
      "140px",
    );
    const toc = page.getByRole("navigation", { name: "On this page" });
    const section = toc.getByRole("link", { name: "Template example" });
    await section.focus();
    await page.keyboard.press("Enter");
    await expect(page.locator("#template-example")).toBeFocused();
    await expect(section).toHaveAttribute("aria-current", "location");
    await expect(page.locator(".code-bar")).toContainText("example.js");
    const copy = page.getByRole("button", { name: "Copy code block 1" });
    await copy.focus();
    await page.keyboard.press("Enter");
    await expect(page.locator(".code-frame [role=status]")).toHaveText(
      "Copied.",
    );
    expect(await page.evaluate(() => navigator.clipboard.readText())).toContain(
      "console.log(message, 42)",
    );
    await page.getByRole("button", { name: "Copy post link" }).focus();
    await page.keyboard.press("Enter");
    await expect(page.locator("[data-share-status]")).toHaveText("Copied.");
    expect(await page.evaluate(() => navigator.clipboard.readText())).toContain(
      "/blog/hello-world/",
    );
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
      path: `docs/screenshots/post-${width}.png`,
      fullPage: true,
    });
    await page.goto("/blog/");
    await page.screenshot({
      path: `docs/screenshots/writing-${width}.png`,
      fullPage: true,
    });
  });
}

test("copy failure gives a keyboard-accessible fallback", async ({ page }) => {
  await page.addInitScript(() =>
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText: () => Promise.reject(new Error("denied")) },
    }),
  );
  await page.goto("/blog/hello-world/");
  await page.getByRole("button", { name: "Copy code block 1" }).focus();
  await page.keyboard.press("Enter");
  await expect(page.locator(".code-frame [role=status]")).toContainText(
    "Select and copy",
  );
});

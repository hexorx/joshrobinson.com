import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const routes = [
  "/",
  "/about/",
  "/resume/",
  "/blog/",
  "/blog/hello-world/",
  "/tags/",
  "/tags/meta/",
];
for (const width of [1440, 390]) {
  test(`global chrome and accessibility at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    const fonts: string[] = [];
    page.on("request", (request) => {
      if (request.resourceType() === "font") fonts.push(request.url());
    });
    for (const route of routes) {
      await page.goto(route);
      await expect(page.locator("h1")).toHaveCount(1);
      const avatar = page.locator('[data-mascot-slot="S01"]');
      await expect(avatar).toHaveCSS("width", "34px");
      await expect(avatar).toHaveCSS("height", "34px");
      await expect(avatar.locator("img")).toHaveAttribute("width", "96");
      await expect(avatar.locator("img")).toHaveAttribute("height", "96");
      expect(
        await avatar
          .locator("img")
          .evaluate(
            (img: HTMLImageElement) =>
              img.complete &&
              img.naturalWidth === 96 &&
              img.naturalHeight === 96,
          ),
      ).toBeTruthy();
      await expect(
        page.getByRole("navigation", { name: "Primary" }),
      ).toBeVisible();
      await expect(
        page.getByRole("navigation", { name: "Social links" }),
      ).toBeVisible();
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
    }
    await page.goto("/");
    await page.evaluate(() => document.fonts.ready);
    await page.evaluate(() => document.fonts.ready);
    await page.screenshot({
      path: `docs/screenshots/home-${width}.png`,
      fullPage: true,
    });
    await page.locator("[data-command-open]").click();
    await page.screenshot({
      path: `docs/screenshots/palette-${width}.png`,
      fullPage: true,
    });
    expect(fonts.length).toBeGreaterThan(0);
    expect(
      fonts.every((url) => new URL(url).hostname === "localhost"),
    ).toBeTruthy();
  });
}

test("keyboard palette filters, traps focus, navigates, and restores focus", async ({
  page,
}) => {
  await page.goto("/");
  await page.evaluate(() => document.fonts.ready);
  const trigger = page.locator("[data-command-open]");
  await trigger.focus();
  await page.keyboard.press("Control+k");
  const dialog = page.getByRole("dialog", { name: "Search or jump to…" });
  const search = page.getByRole("searchbox");
  await expect(dialog).toBeVisible();
  await expect(search).toBeFocused();
  await page.evaluate(() => document.fonts.ready);
  await expect(
    dialog.getByRole("heading", { name: "Pages", exact: true }),
  ).toBeVisible();
  await expect(
    dialog.getByRole("heading", { name: "Posts", exact: true }),
  ).toBeVisible();
  await expect(
    dialog.getByRole("heading", { name: "Actions", exact: true }),
  ).toBeVisible();
  expect(
    (
      await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
        .analyze()
    ).violations,
  ).toEqual([]);
  await search.fill("zzzzz");
  await expect(dialog.getByText("No matching commands.")).toBeVisible();
  await search.fill("");
  const last = dialog.getByRole("link", { name: /Download CV/ });
  await search.focus();
  await page.keyboard.press("ArrowUp");
  await expect(last).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(
    dialog.getByRole("button", { name: "Close command palette" }),
  ).toBeFocused();
  await page.keyboard.press("Shift+Tab");
  await expect(last).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(dialog).not.toBeVisible();
  await expect(trigger).toBeFocused();
  await trigger.click();
  await search.fill("hello, world");
  await page.keyboard.press("ArrowDown");
  await expect(
    dialog.getByRole("link", { name: /Hello, world/ }),
  ).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/blog\/hello-world/);
  await page.keyboard.press("Meta+k");
  await expect(dialog).toBeVisible();
  await search.fill("draft");
  await expect(dialog.getByText("No matching commands.")).toBeVisible();
});

test("mobile button, placeholder actions, and reduced motion", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await page.evaluate(() => document.fonts.ready);
  await page.locator("[data-command-open]").click();
  const dialog = page.getByRole("dialog");
  await page.evaluate(() => {
    document.querySelector<HTMLDialogElement>(
      "#command-palette",
    )!.dataset.email = "";
  });
  await dialog.getByRole("button", { name: /Copy email/ }).click();
  await expect(page.locator("#command-status")).toContainText(
    "Email is awaiting Josh",
  );
  await page.evaluate(() => {
    document.querySelector<HTMLDialogElement>(
      "#command-palette",
    )!.dataset.email = "test@example.test";
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText: async () => {} },
      configurable: true,
    });
  });
  await dialog.getByRole("button", { name: /Copy email/ }).click();
  await expect(page.locator("#command-status")).toHaveText("Email copied.");
  const downloadPromise = page.waitForEvent("download");
  await dialog.getByRole("link", { name: /Download CV/ }).click();
  expect((await downloadPromise).suggestedFilename()).toBe(
    "cv-placeholder.pdf",
  );
});

test("normal-speed typing announces final counts without overwriting action feedback", async ({
  page,
}) => {
  await page.goto("/");
  await page.evaluate(() => document.fonts.ready);
  await page.locator("[data-command-open]").click();
  const search = page.getByRole("searchbox");
  const count = page.locator("#command-count");
  await search.pressSequentially("resume", { delay: 180 });
  await expect(count).toHaveText("1 matching commands.");
  await search.fill("");
  await search.pressSequentially("zzzzz", { delay: 180 });
  await expect(count).toHaveText("0 matching commands.");
  await search.fill("");
  await search.pressSequentially("xxxxx", { delay: 180 });
  await expect(count).toHaveText("0 matching commands.");
  await search.fill("");
  await page.evaluate(() => {
    document.querySelector<HTMLDialogElement>(
      "#command-palette",
    )!.dataset.email = "";
  });
  await page.getByRole("button", { name: /Copy email/ }).click();
  await expect(page.locator("#command-status")).toContainText(
    "Email is awaiting Josh",
  );
  await page.waitForTimeout(650);
  await expect(count).toBeEmpty();
  await expect(page.locator("#command-status")).toContainText(
    "Email is awaiting Josh",
  );
  await search.fill("resume");
  await page.getByRole("button", { name: "Close command palette" }).click();
  await page.waitForTimeout(650);
  await expect(count).toBeEmpty();
});

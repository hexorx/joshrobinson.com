import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const routes = [
  "/",
  "/services/",
  "/track-record/",
  "/ai-for-realtors/",
  "/book/",
  "/writing/",
];
for (const width of [1440, 390]) {
  test(`global chrome and accessibility at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    const fonts: string[] = [];
    page.on("request", (request) => {
      if (request.resourceType() !== "font") return;
      // The Cal.com iframe on /book loads its own fonts. This check covers ours.
      if (request.frame()?.parentFrame()) return;
      fonts.push(request.url());
    });
    for (const route of routes) {
      await page.goto(route);
      // Count light-DOM headings only. The Cal.com embed adds its own h1
      // inside a shadow root on /book.
      await expect
        .poll(() => page.evaluate(() => document.querySelectorAll("h1").length))
        .toBe(1);
      const avatar = page.locator('[data-brand-mark="S01"]');
      await expect(avatar).toHaveCSS("width", "34px");
      await expect(avatar).toHaveCSS("height", "34px");
      await expect(avatar).toHaveText(">_");
      await expect(page.locator('img[src*="/hexorx/"]')).toHaveCount(0);
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
      const axe = new AxeBuilder({ page }).withTags([
        "wcag2a",
        "wcag2aa",
        "wcag21aa",
      ]);
      // Cal.com's booker is a cross-origin iframe. Don't fail our pages on it.
      if (route === "/book/") axe.exclude("#cal-inline").setLegacyMode(true);
      expect((await axe.analyze()).violations).toEqual([]);
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
    dialog.getByRole("heading", { name: "Get started", exact: true }),
  ).toBeVisible();
  await expect(
    dialog.getByRole("heading", { name: "Services", exact: true }),
  ).toBeVisible();
  await expect(
    dialog.getByRole("heading", { name: "Pages", exact: true }),
  ).toBeVisible();
  await expect(
    dialog.getByRole("heading", { name: "Elsewhere", exact: true }),
  ).toBeVisible();
  expect(
    (
      await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
        .analyze()
    ).violations,
  ).toEqual([]);
  await search.fill("zzzzz");
  await expect(
    dialog.getByText(
      'No matches. Try "services", "book a call", or "track record".',
    ),
  ).toBeVisible();
  await search.fill("");
  const last = dialog.getByRole("link", { name: /RSS feed/ });
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
  await search.fill("realtors");
  await page.keyboard.press("ArrowDown");
  await expect(
    dialog.getByRole("link", { name: /AI for Realtors/ }),
  ).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/ai-for-realtors/);
  await page.keyboard.press("Meta+k");
  await expect(dialog).toBeVisible();
  await search.fill("draft");
  await expect(
    dialog.getByText(
      'No matches. Try "services", "book a call", or "track record".',
    ),
  ).toBeVisible();
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
  await expect(dialog.getByRole("link", { name: /Download CV/ })).toHaveCount(
    0,
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

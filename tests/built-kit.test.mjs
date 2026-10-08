import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile, readdir, stat } from "node:fs/promises";
import sharp from "sharp";

const home = await readFile("dist/index.html", "utf8");
test("built metadata links to text-only brand assets", async () => {
  for (const file of [
    "favicon.ico",
    "favicon.svg",
    "favicon-16x16.png",
    "favicon-32x32.png",
    "apple-touch-icon.png",
    "site.webmanifest",
  ]) {
    assert.ok(home.includes(`href="/brand/${file}"`));
    await stat(`dist/brand/${file}`);
  }
  assert.match(home, /property="og:image:width" content="1200"/);
  assert.match(home, /property="og:image:height" content="630"/);
  assert.match(home, /name="twitter:card" content="summary_large_image"/);
  assert.match(home, /https:\/\/joshrobinson.com\/brand\/og-home-1200x630.png/);
  await assert.rejects(stat("dist/og/posts/draft-example.png"));
  await assert.rejects(stat("dist/writing/hello-world/index.html"));
});
test("404 contains HTML copy, prompt mark and home link", async () => {
  const html = await readFile("dist/404.html", "utf8");
  for (const text of [
    "$ cd ./this-page",
    "error: no such file or directory",
    "That page doesn't exist.",
    "Go home",
  ])
    assert.ok(html.includes(text));
  assert.doesNotMatch(
    html,
    /rel="canonical" href="https:\/\/joshrobinson.com\/404/,
  );
  assert.match(html, /href="\/"/);
  assert.match(html, /data-brand-mark="S08"/);
  assert.match(html, /name="robots" content="noindex"/);
});
test("all shipped kit images remain below 300 KB", async () => {
  async function walk(dir) {
    for (const entry of await readdir(dir, { withFileTypes: true })) {
      const path = `${dir}/${entry.name}`;
      if (entry.isDirectory()) await walk(path);
      else if (/\.(png|webp|ico)$/.test(path))
        assert.ok((await stat(path)).size < 300_000, path);
    }
  }
  await walk("dist");
});

test("reserved slot sources preserve the exact transparent swap dimensions", async () => {
  for (const [slot, width, height] of [
    ["S08-404", 1200, 1260],
    ["S09-og", 760, 972],
  ]) {
    const metadata = await sharp(`dist/hexorx/hexorx-${slot}.webp`).metadata();
    assert.equal(metadata.width, width);
    assert.equal(metadata.height, height);
    assert.equal(metadata.hasAlpha, true);
  }
  const icon = await sharp("dist/brand/icon-512.png").metadata();
  assert.equal(icon.width, 512);
  assert.equal(icon.height, 512);
});

test("every built page is free of mascot image references", async () => {
  async function walk(dir) {
    for (const entry of await readdir(dir, { withFileTypes: true })) {
      const path = `${dir}/${entry.name}`;
      if (entry.isDirectory()) await walk(path);
      else if (entry.name.endsWith(".html")) {
        const html = await readFile(path, "utf8");
        assert.doesNotMatch(
          html,
          /(?:src|srcset|content)="[^"]*\/hexorx\//,
          path,
        );
        assert.doesNotMatch(html, /data-mascot-slot/, path);
      }
    }
  }
  await walk("dist");
  const card = await sharp("dist/brand/og-home-1200x630.png").metadata();
  assert.equal(card.width, 1200);
  assert.equal(card.height, 630);
  const manifest = JSON.parse(
    await readFile("dist/brand/site.webmanifest", "utf8"),
  );
  for (const icon of manifest.icons) await stat(`dist${icon.src}`);
});

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile, readdir, stat } from 'node:fs/promises';
import sharp from 'sharp';

const home = await readFile('dist/index.html', 'utf8');
const post = await readFile('dist/blog/hello-world/index.html', 'utf8');
test('built metadata links to real kit assets and the per-post card', async () => {
  for (const file of ['favicon.ico', 'favicon-16x16.png', 'favicon-32x32.png', 'apple-touch-icon.png', 'site.webmanifest']) {
    assert.ok(home.includes(`href="/${file}"`));
    await stat(`dist/${file}`);
  }
  assert.ok(!home.includes('favicon.svg'));
  for (const html of [home, post]) {
    assert.match(html, /property="og:image:width" content="1200"/);
    assert.match(html, /property="og:image:height" content="630"/);
    assert.match(html, /name="twitter:card" content="summary_large_image"/);
  }
  assert.match(home, /https:\/\/joshrobinson.com\/hexorx\/og\/og-home-1200x630.png/);
  assert.match(post, /https:\/\/joshrobinson.com\/og\/posts\/hello-world.png/);
  assert.match(post, /property="og:type" content="article"/);
  const metadata = await sharp('dist/og/posts/hello-world.png').metadata();
  assert.equal(metadata.width, 1200);
  assert.equal(metadata.height, 630);
  await assert.rejects(stat('dist/og/posts/draft-example.png'));
});
test('404 contains HTML copy, mascot and home link', async () => {
  const html = await readFile('dist/404.html', 'utf8');
  for (const text of ['$ cd ./this-page', 'zsh: no such file or directory', "This page doesn't exist, or it moved.", 'Back home']) assert.ok(html.includes(text));
  assert.match(html, /href="\/"/);
  assert.match(html, /hexorx-S08-404/);
  assert.match(html, /name="robots" content="noindex"/);
});
test('all shipped kit images remain below 300 KB', async () => {
  async function walk(dir) {
    for (const entry of await readdir(dir, { withFileTypes: true })) {
      const path = `${dir}/${entry.name}`;
      if (entry.isDirectory()) await walk(path);
      else if (/\.(png|webp|ico)$/.test(path)) assert.ok((await stat(path)).size < 300_000, path);
    }
  }
  await walk('dist');
});

test('reserved slot sources preserve the exact transparent swap dimensions', async () => {
  for (const [slot, width, height] of [['S08-404', 1200, 1260], ['S09-og', 760, 972]]) {
    const metadata = await sharp(`dist/hexorx/hexorx-${slot}.webp`).metadata();
    assert.equal(metadata.width, width);
    assert.equal(metadata.height, height);
    assert.equal(metadata.hasAlpha, true);
  }
  const icon = await sharp('dist/icon-512.png').metadata();
  assert.equal(icon.width, 512);
  assert.equal(icon.height, 512);
});

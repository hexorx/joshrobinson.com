import { test } from 'node:test';
import assert from 'node:assert/strict';
import sharp from 'sharp';
import { postImagePath, renderPostCard } from '../src/lib/social-card.mjs';

test('nested IDs have unique flat card URLs', () => {
  assert.equal(postImagePath('nested/post'), '/og/posts/nested_2Fpost.png');
  assert.notEqual(postImagePath('nested/post'), postImagePath('nested_2Fpost'));
});
for (const title of ['Hello, world', 'A <title> & "quotes"', 'Long title '.repeat(30), 'Unbroken'.repeat(35)]) {
  test(`renders a bounded PNG for ${title.slice(0, 30)}`, async () => {
    const image = await renderPostCard(title);
    const metadata = await sharp(image).metadata();
    assert.equal(metadata.width, 1200);
    assert.equal(metadata.height, 630);
    assert.ok(image.length < 300_000);
    // Changing even extreme titles cannot paint over the reserved S09 artwork.
    const region = { left: 750, top: 110, width: 370, height: 440 };
    const original = await sharp(await renderPostCard('Reference title')).extract(region).removeAlpha().raw().toBuffer();
    const composed = await sharp(image).extract(region).removeAlpha().raw().toBuffer();
    assert.deepEqual(composed, original);
  });
}

test('card renders readable proportional glyphs and visible supplied artwork', async () => {
  const titleRegion = { left: 72, top: 136, width: 620, height: 270 };
  const glyphs = async (title) => {
    const pixels = await sharp(await renderPostCard(title)).extract(titleRegion).removeAlpha().raw().toBuffer();
    let count = 0;
    for (let i = 0; i < pixels.length; i += 3) if (pixels[i] > 180 && pixels[i + 1] > 180) count++;
    return count;
  };
  // Missing-font boxes have identical areas for I and W; real glyphs do not.
  assert.ok(await glyphs('WWWW') > (await glyphs('IIII')) * 1.5);
  const pixels = await sharp(await renderPostCard('Hello')).extract({ left: 750, top: 110, width: 370, height: 440 }).removeAlpha().raw().toBuffer();
  let visible = 0;
  for (let i = 0; i < pixels.length; i += 3) if (pixels[i] > 35 || pixels[i + 1] > 35 || pixels[i + 2] > 35) visible++;
  assert.ok(visible > 10_000, 'the S09 artwork must survive SVG rasterization');
});

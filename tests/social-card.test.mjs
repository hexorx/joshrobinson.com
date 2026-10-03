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
    // The supplied avatar region must retain every original pixel.
    const region = { left: 66, top: 476, width: 112, height: 112 };
    const original = await sharp('public/hexorx/og/og-post-background-1200x630.png').extract(region).raw().toBuffer();
    const composed = await sharp(image).extract(region).removeAlpha().raw().toBuffer();
    assert.deepEqual(composed, original);
  });
}

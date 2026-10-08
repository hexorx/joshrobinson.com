import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, mkdir, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { checkLinks } from "../scripts/check-links.mjs";

async function fixture(files) {
  const root = await mkdtemp(join(tmpdir(), "site-links-"));
  for (const [name, body] of Object.entries(files)) {
    const path = join(root, name);
    await mkdir(join(path, ".."), { recursive: true });
    await writeFile(path, body);
  }
  return root;
}

test("resolves static routes, relative assets, queries, fragments, srcset, CSS and XML", async () => {
  const root = await fixture({
    "index.html":
      '<a href="/resume?print=1#contact">Resume</a><a href="https://example.org/missing">External</a><link href="/style.css"><img srcset="/image.png 1x, /image.png 2x">',
    "resume/index.html":
      '<h1 id="contact">Contact</h1><img src="../image.png">',
    "image.png": "",
    "style.css": 'body { background: url("/image.png"); }',
    "rss.xml":
      "<rss><channel><link>https://joshrobinson.com/resume/</link></channel></rss>",
    "sitemap.xml":
      "<urlset><url><loc>https://joshrobinson.com/</loc></url></urlset>",
  });
  const result = await checkLinks(root);
  assert.deepEqual(result.errors, []);
  assert.equal(result.checked, 8);
});

test("reports missing routes, images, XML destinations and fragments", async () => {
  const root = await fixture({
    "index.html":
      '<a href="/missing">Missing</a><a href="/#absent">Fragment</a><img src="/lost.png">',
    "sitemap.xml":
      "<urlset><url><loc>https://joshrobinson.com/lost</loc></url></urlset>",
  });
  const result = await checkLinks(root);
  assert.equal(result.errors.length, 4);
  assert.ok(result.errors.some((error) => error.includes("missing fragment")));
});

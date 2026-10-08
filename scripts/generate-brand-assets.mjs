// Reproducible, code-drawn prompt icons and text-only social card.
import { mkdir, readFile, writeFile } from "node:fs/promises";
import sharp from "sharp";
import { renderPostCard } from "../src/lib/social-card.mjs";

const dir = "public/brand";
await mkdir(dir, { recursive: true });
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="10" fill="#0A0C0F"/><path d="m14 19 14 13-14 13m22 0h14" fill="none" stroke="#C6F432" stroke-width="6" stroke-linejoin="round"/></svg>`;
await writeFile(`${dir}/favicon.svg`, svg);
for (const [name, size] of [
  ["favicon-16x16.png", 16],
  ["favicon-32x32.png", 32],
  ["apple-touch-icon.png", 180],
  ["icon-192.png", 192],
  ["icon-512.png", 512],
]) {
  await sharp(Buffer.from(svg))
    .resize(size, size)
    .png()
    .toFile(`${dir}/${name}`);
}
// ICO supports PNG payloads; include both small browser sizes.
const images = await Promise.all(
  [16, 32].map((size) =>
    sharp(Buffer.from(svg)).resize(size, size).png().toBuffer(),
  ),
);
const header = Buffer.alloc(6 + images.length * 16);
header.writeUInt16LE(1, 2);
header.writeUInt16LE(images.length, 4);
let offset = header.length;
for (const [i, image] of images.entries()) {
  const entry = 6 + i * 16;
  header[entry] = header[entry + 1] = [16, 32][i];
  header.writeUInt16LE(1, entry + 4);
  header.writeUInt16LE(32, entry + 6);
  header.writeUInt32LE(image.length, entry + 8);
  header.writeUInt32LE(offset, entry + 12);
  offset += image.length;
}
await writeFile(`${dir}/favicon.ico`, Buffer.concat([header, ...images]));
const manifest = JSON.parse(await readFile("public/site.webmanifest", "utf8"));
for (const icon of manifest.icons) icon.src = `/brand${icon.src}`;
await writeFile(
  `${dir}/site.webmanifest`,
  JSON.stringify(manifest, null, 2) + "\n",
);
await writeFile(
  `${dir}/og-home-1200x630.png`,
  await renderPostCard("Everyone says use AI. I'll show you how.", true),
);

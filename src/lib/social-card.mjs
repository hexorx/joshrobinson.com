import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import satori from 'satori';
import sharp from 'sharp';

/** Stable, flat filenames also work for nested content IDs. */
export function postImagePath(id) {
  return `/og/posts/${encodeURIComponent(id).replaceAll('_', '_5F').replaceAll('%', '_')}.png`;
}

let resources;
function loadResources() {
  return resources ??= Promise.all([
    readFile(resolve('public/hexorx/og/og-post-background-1200x630.png')),
    readFile(resolve('node_modules/@fontsource/geist/files/geist-latin-700-normal.woff')),
    readFile(resolve('node_modules/@fontsource/jetbrains-mono/files/jetbrains-mono-latin-400-normal.woff')),
  ]);
}

/** Build-time composition only: the provided mascot background is never redrawn. */
export async function renderPostCard(title) {
  const [background, geist, mono] = await loadResources();
  const text = (children, style) => ({ type: 'div', props: { children, style: { position: 'absolute', display: 'flex', ...style } } });
  // Long titles shrink to stay within the title slot; a three-line clamp handles extremes.
  const fontSize = title.length > 120 ? 42 : title.length > 85 ? 52 : 64;
  const svg = await satori({ type: 'div', props: {
    style: { width: 1200, height: 630, display: 'flex', position: 'relative', color: '#E8EDF2', fontFamily: 'Geist' },
    children: [
      text('writing', { left: 72, top: 80, fontFamily: 'Mono', fontSize: 22, color: '#C6F432' }),
      text(title, { left: 72, top: 140, width: 1056, height: 270, fontSize, fontWeight: 700, lineHeight: 1.18, lineClamp: 3, overflow: 'hidden', wordBreak: 'break-word' }),
      text('Josh Robinson', { left: 196, top: 488, fontSize: 30, fontWeight: 700 }),
      text('I architect AI systems that ship to production.', { left: 196, top: 530, fontFamily: 'Mono', fontSize: 18, color: '#9AA6B2' }),
      text('joshrobinson.com', { right: 72, top: 558, fontFamily: 'Mono', fontSize: 18, color: '#9AA6B2' }),
    ],
  } }, { width: 1200, height: 630, fonts: [
    { name: 'Geist', data: geist, weight: 700, style: 'normal' },
    { name: 'Mono', data: mono, weight: 400, style: 'normal' },
  ] });
  const image = await sharp(background).composite([{ input: Buffer.from(svg) }]).png().toBuffer();
  if (image.length > 300_000) throw new Error('Post social card exceeds 300 KB');
  return image;
}

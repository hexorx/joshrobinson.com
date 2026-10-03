# Mascot kit integration

Only supplied `hexorx-kit.zip` art is used. No generation, redraws or new poses.
S08 temporarily uses the kit surprised head; S09 uses the kit front figure.
Labels describe Josh's pending final art, not the existing crop's pose.

| Slot | Public source | Source pixels | CSS/card box |
| --- | --- | --- | --- |
| S08 | `/hexorx/hexorx-S08-404.webp` | 1200×1260 transparent | 420×440 desktop; 300×320 mobile |
| S09 | `/hexorx/hexorx-S09-og.webp` | 760×972 transparent | 380×486 at (748,72) in 1200×630 cards |
| S10 | `/icon-512.png` | 512×512 kit master | supplied 16/32/48 ICO, 180 Apple, 192/512 app icons |

`MascotSlot` contains S08 without stretching and aligns it to the bottom.
The 404 uses shared Header, Footer, Kicker, Terminal and Button components.
To reproduce the temporary assets, extract the original kit and run
`node scripts/prepare-mascot-slots.mjs /path/to/kit`. Only nearest-neighbor
resize and transparent padding are applied; lossless WebP preserves those pixels.
Replace the two public slot sources with Josh's final art at the same dimensions.
S01/S06 may reuse the S10 master; nav S01 is owned by the design-system task.

`BaseHead` accepts `image?: ImageMetadata | { src, width, height, alt? }` and
`type?: 'website' | 'article'`. Default card: `/hexorx/og/og-home-1200x630.png`.
Post routing supplies `socialImage` to `BlogPost` via `postImagePath(post.id)`.
`src/pages/og/posts/[image].png.ts` prerenders each published post card with
Satori, local Geist/JetBrains Mono fonts and Sharp. Cards contain S09's dashed
lime frame and pending-art label. Title text shrinks/clamps without overlapping
S09; drafts are excluded. No runtime image service is needed.
To regenerate the home card after a slot swap, call
`renderPostCard('Josh Robinson', true)` and write its Buffer to the default path.
Writing avatars remain `/hexorx/avatars/hexorx-avatar-64.webp` and
`/hexorx/avatars/hexorx-avatar-256.webp`. Legacy background/template kit cards
remain available under `/hexorx/og/` for explicit fallbacks.

Run `npm run format:check`, `npm run check`, `npm run build`, and `npm test`.
Tests cover card dimensions/size, extreme titles avoiding S09, metadata, draft
exclusion, source transparency, S10 sizes, 404 responsive boxes, keyboard home
recovery and axe checks at 1440/390. Browser tests require installed Chromium
and its OS libraries. All client images must be below 300 KB.

Hosted acceptance remains separate: hosting PR #2 sets
`not_found_handling: "404-page"` to serve `dist/404.html` on unknown paths with
HTTP 404. Once an authorized preview exists, verify unknown-path status/body,
`/404`, and home/post social metadata on opengraph.xyz. No preview is currently
available; public previews have an existing approval request owned by Mindi.
Independent review must name the final head and require green CI on that head.
This PR makes no deployments or infrastructure changes. Rollback: revert the
feature changes; no state or migration is involved.

Satori uses a scoped fflate override to 0.8.3. The three existing Astro-chain
high audit findings remain outside this feature.

Satori is pinned to 0.32.0: later HarfBuzz-based versions rendered these supplied
Fontsource WOFFs as missing-glyph boxes. SVG-embedded mascot data uses PNG, since
this runner's SVG rasterizer did not display embedded WebP. Regression tests
require proportional I/W glyph areas and visible S09 pixels. The output cards
are PNG; source slots stay transparent WebP.

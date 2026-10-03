# Mascot kit integration

Assets come from the supplied `hexorx-kit.zip`. No mascot generation or redraws.
Favicons/manifest are copied unchanged into `public/`. OG PNGs are under
`public/hexorx/og/`. The 404 head is processed by Astro from
`src/assets/hexorx/hexorx-404-hex-460.webp`. Author avatars for writing are
`/hexorx/avatars/hexorx-avatar-64.webp` and `hexorx-avatar-256.webp`.

`BaseHead` accepts `image?: ImageMetadata | { src, width, height, alt? }` and
`type?: 'website' | 'article'`; its default is the 1200×630 home kit card.
Post routing supplies `socialImage` to `BlogPost`, using `postImagePath(post.id)`.
`src/pages/og/posts/[image].png.ts` prerenders each published post card with Satori
and local Geist/JetBrains Mono fonts, then Sharp composites text onto the kit
background. There is no runtime image service or browser JavaScript. Draft cards
are omitted from production. Long titles shrink and clamp to three lines.
The static template is available at `/hexorx/og/og-post-template-1200x630.png`.

Run `npm test`, `npm run check`, `npm run build`, `npm run test:build`.
No standalone linter existed; Astro check validates Astro/TypeScript.
Tests verify image size/dimensions, metadata and draft exclusion, and compare
the mascot's pixels before/after composition. All added images are under 300 KB.

## Integration acceptance still pending

- HEX-437: replace 404's local Terminal presentation with shared layout,
  terminal-card and button components once merged. Preserve the copy and mascot.
- HEX-441: Workers assets must use `not_found_handling: "404-page"` so
  `dist/404.html` handles unknown paths with HTTP 404 (never SPA fallback).
- Once an authorized preview exists, check home and post cards on opengraph.xyz,
  `/404`, an unknown path's 404 status/body, and mobile/keyboard behavior.
- Independent agent approval must name the final head commit; require CI on it.

No deploy, Cloudflare/DNS change, or production cutover is part of this PR.
Rollback is a revert of the feature commit; no state/data migration is involved.

Satori pins an old fflate; a scoped override uses patched fflate 0.8.3.
The dependency audit retains three pre-existing high findings in the Astro
http-cache-semantics chain; no new findings remain from this integration.

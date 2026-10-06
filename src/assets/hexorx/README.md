# hexorx mascot asset kit (joshrobinson.com, "Terminal" design)

**Provenance:** every pixel of the character comes from `../hexorx-character-sheet.png` (1536x1024). The kit uses only crops, rembg `isnet-general-use` background removal, blue-spill decontamination on the edges, hex masks, and composites over the design tokens (`#0A0C0F` bg, `#11151A` surface, lime `#C6F432`, Geist + JetBrains Mono). There is no AI generation and no new poses or expressions. Build scripts are in `src/` (crop boxes in `src/boxes.json`).

**Resolution note:** in the source sheet the heads are about 190–230 px tall and the full bodies about 450–480 px. Large outputs (avatar-512, OG avatar, hero figure at 850 px) are upscaled about 2–3x, so they're slightly soft. Use the 256/WebP sizes where possible. A higher-resolution source render would fix this.

| Folder | Contents | Site use |
|---|---|---|
| `cutouts/` | 11 transparent PNG + WebP: full-front, full-three-quarter, full-profile, full-back, walk, head-front, head-three-quarter, head-profile, head-smile, head-focused, head-surprised | any |
| `avatars/` | hex-clipped front avatar 512/256/64 (lime rim, PNG+WebP) + 512 smile/focused/surprised/three-quarter | header logo, about, author byline |
| `favicons/` | favicon.ico (16/32/48), favicon-16x16, favicon-32x32, apple-touch-icon (180, opaque), icon-192, icon-512, site.webmanifest | `public/` |
| `hero/` | hexorx-hero-1600x1000 (jpg/webp/png), hexorx-hero-mobile-800x1000 (jpg/webp/png), hexorx-hero-layer-1600x1000 (transparent, lets CSS lay it over the site's own grid) | home hero |
| `og/` | og-home-1200x630 (png/jpg), og-post-template (title slot marked), og-post-sample, og-post-background (no text; render title + byline in Astro/Satori) | `og:image` |
| `404/` | hexorx-404-1200x800 (full visual), hexorx-404-hex-460 (transparent surprised hex for an HTML 404 page) | `src/pages/404.astro` |
| `kit-overview.png` | contact sheet | review |

Head tags:
```html
<link rel="icon" href="/favicon.ico" sizes="48x48">
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<link rel="manifest" href="/site.webmanifest">
<meta property="og:image" content="https://joshrobinson.com/og/og-home-1200x630.png">
```

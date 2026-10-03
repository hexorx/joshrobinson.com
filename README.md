# joshrobinson.com

Josh Robinson's personal site, blog, and online resume: the home base for his personal brand.

Built with [Astro](https://astro.build) as a fully static site, following the framework spike in Paperclip ticket HEX-148 (Hexorx › joshrobinson.com project). Design directions are in HEX-147.

> **Status:** starter scaffold. Everything marked `[Placeholder]` still needs Josh's real copy. Nothing is deployed yet.

## What's included

- **Blog**: Markdown/MDX posts in `src/content/blog/`, schema-checked frontmatter (`title`, `description`, `pubDate`, `updatedDate`, `heroImage`, `tags`, `draft`).
- **Tags**: `/tags/` index and a page per tag.
- **Drafts**: `draft: true` posts show in dev only.
- **RSS**: `/rss.xml` (published posts, tags as categories), plus a sitemap via `@astrojs/sitemap`.
- **Images**: `astro:assets` with `sharp`, optimized at build time.
- **Resume**: `/resume` rendered from structured data in `src/data/resume.json`, validated by `src/lib/resume.ts`. It includes print CSS (use "Print / save as PDF") and emits schema.org `Person` JSON-LD.
- **Pages**: home (intro + recent posts), blog, resume, about.

## Editing

| What | Where |
| --- | --- |
| Site name, description, social links | `src/consts.ts` |
| Resume content | `src/data/resume.json` |
| Posts | `src/content/blog/*.md` |
| Home / About copy | `src/pages/index.astro`, `src/pages/about.astro` |
| Styles | `src/styles/global.css` |

## Commands

Requires Node 22.12+.

| Command | Action |
| --- | --- |
| `npm install` | Install dependencies |
| `npm run dev` | Dev server at `localhost:4321` (drafts visible) |
| `npm run build` | Static build to `./dist/` |
| `npm run preview` | Preview the build locally |

## Hosting decision: Cloudflare Workers (static assets)

Decided 2026-09-28: joshrobinson.com will be hosted on **Cloudflare Workers with static assets**, not Vercel. Why:

- **Same account as DNS and proxy.** The joshrobinson.com zone is already active on Cloudflare (Free plan) with DNS and proxy in place (see HEX-146), so no nameserver moves, no DNS-only workarounds, no second SSL issuer.
- **No commercial-use restriction.** Vercel's free Hobby plan is non-commercial only; Cloudflare's free tier has no such rule, which matters for a personal-brand site.
- **Free static hosting with no request caps.** Requests to static assets are free and unlimited, with no storage charge.
- **Astro static deploy, no adapter.** `npm run build` produces `dist/`, which Workers serves directly.

## Deployment checklist (not done; waits for Josh's go)

Nothing deploys from this repo yet. Do not change Cloudflare settings until Josh approves.

1. Connect `hexorx/joshrobinson.com` to a new Cloudflare Workers project (Workers Builds, build command `npm run build`, assets directory `dist/`).
2. Attach `joshrobinson.com` (and `www` if wanted) as a custom domain on that Worker.
3. Verify the build and the live site: pages, `/rss.xml`, sitemap, `/resume`, images, HTTPS.

The previous 2022 Nuxt starter was replaced in this commit and remains in git history.

### Writing templates

Writing keeps the existing `/blog/` and `/blog/<id>/` URLs. Tags link to the
static `/tags/<tag>/` pages. `src/lib/posts.ts` continues to exclude drafts from
production routes, RSS, and tag pages; sitemap generation sees only built pages.

Code fences support a language and an optional quoted filename:

````md
```js filename="example.js"
const message = "Hello";
```
````

MDX posts can import `Callout` from `../../components/Callout.astro` and use
`<Callout kind="note">…</Callout>` or `<Callout kind="warn">…</Callout>`.
Markdown footnotes use the standard `[^id]` syntax. The TOC uses rendered H2/H3
headings; code and share copy controls report clipboard failures accessibly.

The newsletter remains a labelled placeholder until Josh supplies signup details.
S05 is an existing kit half-body crop resized to 880×880 (220px desktop, 170px
mobile); the reading pose is pending. S06 uses the supplied smile avatar at
512×512, displayed at 140px with hex clipping. Both retain labelled TBD slots.
No mascot art was generated or redrawn. Replace files without changing the source
aspect or CSS slot sizes. `BlogPost` accepts the kit integration's `socialImage`
prop, with the supplied 1200×630 static post template as fallback.

Run `python3 scripts/check-static.py` after building for all internal asset, page,
and anchor links plus RSS/sitemap publication checks. `npm test` runs reading-time
and adjacent-post unit tests, then Playwright keyboard/copy/axe checks at 1440 and
390 CSS pixels; screenshots are emitted to `docs/screenshots/`.

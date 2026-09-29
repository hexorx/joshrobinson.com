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

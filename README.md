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

## Deployment (not set up)

The plan is static hosting on Cloudflare (Workers Static Assets or Pages), serving `dist/`. DNS for joshrobinson.com is already on Cloudflare (see HEX-146). Nothing deploys from this repo yet; any deploy or DNS change needs Josh's approval.

The previous 2022 Nuxt starter was replaced in this commit and remains in git history.

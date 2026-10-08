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

## Hosting validation and PR previews

`wrangler.jsonc` serves `dist/` directly, with no SSR adapter or Worker script.
It targets a **preview** Worker only, has no routes or custom domains, and uses
`404-page` handling with `dist/404.html`. `public/_headers` gives Astro's hashed
`/_astro/*` assets a one-year immutable browser cache. HTML and feeds use
Cloudflare's default caching; do not give them immutable headers. Preview
workers.dev responses have `X-Robots-Tag: noindex, nofollow`; this is indexing
control, not authentication.

Run locally without Cloudflare credentials:

```sh
npm ci
npm run check
npm test
npm run build
npm run check:links
npm run deploy:dry-run
```

`astro check` is the project's type/lint check. The link check resolves internal
HTML routes, fragments, images/srcsets, stylesheets, CSS assets, RSS and sitemap
links against `dist/`, including absolute links to the canonical site. External
sites are excluded so availability outside this repo cannot break CI.

`.github/workflows/hosting.yml` runs these checks on every PR and retains the
validated build for seven days. On pushes to `main` it installs and builds only;
there is **no production deploy job**. Fork PRs get validation but no secrets or
preview deployment. Same-repo PRs skip preview deployment successfully until
all prerequisites below are supplied. A skipped deployment is not a reachable
preview; see the Actions job summary for the missing prerequisite.

### What Josh must supply (pending approval)

Do not create or rotate tokens as part of this task. Josh must add the following
in this repository's **Settings → Secrets and variables → Actions**:

| Setting | Required value |
| --- | --- |
| Secret `CLOUDFLARE_API_TOKEN` | Cloudflare API token with **Account → Workers Scripts → Edit**, restricted to the single hosting account. No DNS/zone edit permissions are needed for this preview pipeline. |
| Secret `CLOUDFLARE_ACCOUNT_ID` | The ID of that same Cloudflare account. |
| Variable `CLOUDFLARE_PREVIEWS_ENABLED` | `true` **only after Josh explicitly approves public workers.dev preview exposure and preview Worker creation/deployment**. Leave unset or `false` until then, even if secrets already exist. |

The GitHub-provided `GITHUB_TOKEN` posts/updates the preview URL comment using
`pull-requests: write`; no extra GitHub token is needed. Never paste secrets into
PRs, tickets, logs, `.env` files, or git. The validation job has no Cloudflare
secrets. The preview job consumes the validated artifact without running the
PR's npm lifecycle scripts.

After approval, the workflow deploys `joshrobinson-preview-pr-<PR number>` on
workers.dev, checks home/resume/RSS/sitemap and the 404 status, then updates one
PR comment with the URL and tested revision. Different PRs cannot overwrite
each other's previews. No domain is attached, no DNS is changed, and production
is never targeted. Per-PR Workers remain after closure: **do not delete them
without Josh's approval**. Use the existing free static-assets allowance; any
spend or plan change needs separate approval. Refer to [Cloudflare's headers
documentation](https://developers.cloudflare.com/workers/static-assets/headers/)
and [Wrangler Action outputs](https://github.com/cloudflare/wrangler-action#outputs)
for the implementation contracts.

To halt future preview uploads, set `CLOUDFLARE_PREVIEWS_ENABLED=false` and cancel
pending preview runs. Existing URLs remain public; withdrawing those URLs or
deleting Workers is a Cloudflare change requiring approval. Do not assume that
removing a PR comment unpublishes a preview.

## Production cutover runbook (not executed)

**Gate:** Mindi gathers one Josh approval covering production deployment,
Cloudflare configuration/custom-domain attachment, any DNS changes, public
exposure, and the exact rollback actions. Review and green CI on the exact PR
head are required before merge. Repo merge authorization is separate from
cutover authorization. This PR only prepares hosting; it performs none of the
steps below. Opi owns the approved rollout.

Before starting, record the approved commit, the existing hosting target and
Cloudflare domain/DNS configuration, and the current Worker version ID (if any).
Preserve the existing host and build so rollback remains possible. Check that
the production copy is approved, including any remaining `[Placeholder]` text.

1. **Connect the repo / production Worker.** After approval, create a separate
   production Worker (`joshrobinson`, never a preview Worker). Use the reviewed
   static build (`npm ci`, `npm run build`, assets `dist/`) and `404-page` handling.
   If using Workers Builds, connect `hexorx/joshrobinson.com` with those build
   settings only as part of the approved rollout. Do not enable automatic
   production deployment from `main` until Josh explicitly approves a separate
   reviewed workflow/config change. This repo's checked-in Wrangler config
   continues to target preview hosting.
2. **Attach the custom domain.** Attach `joshrobinson.com` to the production
   Worker only after approval. Add `www` only if included in Josh's decision.
   Record the resulting DNS/domain mapping and HTTPS state; preserve prior
   values. Never attach the production domain to a PR Worker.
3. **Verify before declaring cutover complete.** Check home, about, blog posts,
   tags, `/resume` and its print layout, `/rss.xml`, `/sitemap-index.xml` and its
   child sitemaps, optimized images/fonts, internal navigation, an unknown URL
   returning the custom page with HTTP 404, canonical URLs, HTTPS/certificate,
   and `www` behavior if enabled. Inspect `/_astro/*` cache headers and confirm
   HTML updates are visible. Record URLs, commit/version IDs and results in the
   rollout issue. Keep the former hosting target available through acceptance.

### Rollback (must be included in the approval)

- For a bad production content release on an existing Worker, Opi restores the
  previously recorded healthy Worker version in Cloudflare (or redeploys the
  preserved approved build), then repeats the verification checklist. Record
  both version IDs; retain builds and assets needed by the prior version.
- For a failed first cutover, Opi restores the recorded prior custom-domain/DNS
  mapping to the existing host under the approved rollback scope, then verifies
  HTTPS, pages, resume, RSS, sitemap and images there. Do not delete the former
  host or its data. If no former host exists, agree on a fallback before cutover;
  do not improvise one during an outage.
- Disable any newly enabled production trigger and pause further rollout. If
  rollback would require unapproved DNS, production or destructive actions,
  stop and obtain Josh's approval; preserve evidence and data meanwhile.

The previous 2022 Nuxt starter remains in git history.

### Writing templates

Published posts live at `/writing/` and `/writing/<id>/`. `/blog` and `/blog/`
redirect to `/writing/`. Tags link to the static `/tags/<tag>/` pages.
`src/lib/posts.ts` continues to exclude drafts from production routes, RSS, and
tag pages; sitemap generation sees only built pages.

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

The newsletter signup stays off the public pages (`showNewsletter` in
`src/consts.ts`) until Josh supplies signup details.
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

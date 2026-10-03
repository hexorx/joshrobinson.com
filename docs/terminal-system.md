# Terminal system

`BaseHead` loads the global tokens and latin Geist 400/500/600/700 and JetBrains Mono 400/500 from Fontsource. Every font is bundled locally with `font-display: swap`. The site remains static with no adapter.

All existing pages use the same `Header` (including `CommandPalette`) and `Footer`. Navigation routes selected work to `/#work`, writing to `/blog/`, and resume to `/resume/`. The work anchor remains a dashed placeholder until the separate home-page implementation lands.

## Components and layout

- `Button`: `href`, optional `primary`. Use one lime filled CTA per view; the global contact button already uses it.
- `Kicker`: `number` plus a text slot. `StatusPill`, `Kbd`, and `CornerBrackets` accept slots.
- `Panel`: `heading` named slot and body slot. `Terminal`: optional window `title`, with terminal text in the default slot.
- `.container`: 1200px maximum, 32px desktop / 20px mobile gutters.
- `.grid-12` with `.card-span`: twelve-column grid, six-column cards. `.cards` with `.span-2`, `.span-3`, `.span-4`: six-column card system.
- `.hairline-grid`: decorative 48px grid with radial mask, intended only for heroes.
- Spacing properties: `--space-1/2/3/4/5/6/8/12/18/24` represent 4/8/12/16/20/24/32/48/72/96px. Radii are `--r-sm` 6px, `--r` 8px, `--r-lg` 14px.

## Palette and placeholders

Open the labelled native modal dialog with the visible search button or Cmd/Ctrl+K. Search filters pages, published posts, and actions. Arrow keys move through results, Enter activates, Tab/Shift+Tab wrap within the dialog, and Esc restores focus to the opener. Match counts use a separate atomic live status region, updated 500ms after typing stops so reader key echo can finish. Filtering stays immediate. Closing or copying cancels pending counts; action feedback uses its own region.

The existing resume data contains no email or LinkedIn profile. Header/footer contact links point to an explicit About/contact placeholder. Copy email explains the missing value; adding `email` in `src/data/resume.json` enables real copying without another component change. Adding a LinkedIn entry to `profiles` enables its real footer link. No contact values were invented.

`public/cv-placeholder.pdf` is a valid PDF explicitly containing placeholder text. Replace it and update the palette download path when approved CV copy is available.

## Verification

Run `npm ci`, `npm run format:check`, `npm run check`, `npm run build`, `npx playwright install --with-deps chromium`, and `npm test`. Browser tests serve the built `dist` via a Playwright-managed loopback preview. They check all seven existing pages at 1440px and 390px, one H1, shared chrome, overflow, WCAG A/AA axe rules, local font requests, keyboard filtering/focus, draft exclusion, clipboard feedback, and placeholder download. They also capture home and palette screenshots in `docs/screenshots`.

Automated accessibility checks and keyboard tests do not replace an independent screen reader review. The reviewer should confirm the dialog name, search label, live feedback, and focus return using a screen reader.

No deploy is part of this PR. Roll back by reverting its merge commit. Existing resume schema deprecation hints and dependency audit findings remain outside this change.

### Review correction

The first handoff incorrectly reported a passing formatting check. The independent reproduction (`git diff --name-only origin/main...HEAD -- '*.astro' '*.css' '*.ts' '*.mjs' '*.yml' | xargs npx prettier --plugin prettier-plugin-astro --check`) found eight Astro files. They are now formatted; `npm run format:check` explicitly loads the Astro plugin and checks source, browser tests, config and CI on every PR.

For whitespace verification use `git diff --check origin/main...HEAD -- . ":(exclude)public/cv-placeholder.pdf"`. The PDF cross-reference records intentionally contain fixed-width trailing spaces.

Opi recorded real Orca announcements on the previous head: four checks passed, while counts at normal typing speed failed. The current revision still needs a fresh real-reader pass; axe and browser accessibility-tree evidence do not establish spoken output. Record reader/browser versions and the exact SHA with dialog/search labels, filtered match counts, placeholder/copy feedback, Escape and focus return before approval.

### S01 and reusable mascot slots

`MascotSlot` separates intrinsic `assetWidth`/`assetHeight` from desktop and mobile container dimensions. It supports transparent containment, optional full-body bottom alignment, hex clipping, supplied slot/pose/TBD labels and compact avatars. Header S01 is 34×34 CSS pixels at both breakpoints, with a 96×96 WebP resized directly from the approved kit's `kit/avatars/hexorx-avatar-512.png`; no art was generated or altered beyond resizing. The existing kit variant is allowed by Josh's blocking directive. The compact avatar keeps its full pending-art label in a tooltip and visually hidden text rather than a label larger than the nav; larger placeholder slots have dashed lime frames and visible labels. Final art swaps retain the container dimensions.

Reader evidence for `54ff4e0` in HEX-447 passed 4/5 checks; ordinary-speed positive/zero counts failed. This revision addresses that finding, but requires a new actual Orca run and independent exact-head approval. Prior screenshots show the pre-S01 header; regenerate 1440/390 screenshots before acceptance.

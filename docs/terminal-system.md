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

Open the labelled native modal dialog with the visible search button or Cmd/Ctrl+K. Search filters pages, published posts, and actions. Arrow keys move through results, Enter activates, Tab/Shift+Tab wrap within the dialog, and Esc restores focus to the opener. Match counts and clipboard feedback use a live status region.

The existing resume data contains no email or LinkedIn profile. Header/footer contact links point to an explicit About/contact placeholder. Copy email explains the missing value; adding `email` in `src/data/resume.json` enables real copying without another component change. Adding a LinkedIn entry to `profiles` enables its real footer link. No contact values were invented.

`public/cv-placeholder.pdf` is a valid PDF explicitly containing placeholder text. Replace it and update the palette download path when approved CV copy is available.

## Verification

Run `npm ci`, `npm run check`, `npm run build`, `npx playwright install --with-deps chromium`, and `npm test`. Browser tests serve the built `dist` via a Playwright-managed loopback preview. They check all seven existing pages at 1440px and 390px, one H1, shared chrome, overflow, WCAG A/AA axe rules, local font requests, keyboard filtering/focus, draft exclusion, clipboard feedback, and placeholder download. They also capture home and palette screenshots in `docs/screenshots`.

Automated accessibility checks and keyboard tests do not replace an independent screen reader review. The reviewer should confirm the dialog name, search label, live feedback, and focus return using a screen reader.

No deploy is part of this PR. Roll back by reverting its merge commit. Existing resume schema deprecation hints and dependency audit findings remain outside this change.

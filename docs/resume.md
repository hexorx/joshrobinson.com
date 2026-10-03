# Career resume

`/resume/` renders the verified facts, contact links, role target, summary, timeline,
skills, artifacts, community and education from `src/data/resume.json`. Unknown
copy is visibly marked `[Placeholder]` with dashed borders. The shared Person
JSON-LD builder uses the same source, including Newton/IA and profile URLs.

The career panel follows the approved mock's amber refs and vertical commit rail.
Filled nodes identify current roles; hollow nodes identify past roles, with
screen-reader labels conveying the same distinction. S07 keeps its 600×760 asset
separate from its 150×190 desktop / 110×150 mobile container. It uses the existing
`kit/cutouts/hexorx-walk.png` from the attached approved kit, resized and padded
transparently with Sharp; no pose or art was generated. The slot stays bottom
aligned with a dashed lime frame and pending-art label for future replacement.

Download PDF opens browser print. A4 print styling hides shared chrome, controls,
mascot and grid; keeps the facts and mono metadata; uses white background/black
ink; and prevents role rows and sidebar sections from splitting across pages.

## Verification

- `npm ci`, `npm run build`, `npm run check`, `npm run format:check`, `git diff --check`.
- `node --test tests/resume.test.mjs`: two source/metadata checks.
- `npm test`: shared chrome, keyboard palette and career browser coverage.
- Resume axe WCAG A/AA checks at 1440×900 and 390×900: no violations.
- Lighthouse accessibility: desktop 100, mobile 96 (threshold 95).
- Schema.org hosted validator: one Person, zero errors and zero warnings.
- Chromium A4 PDF: two pages, intact role rows. Screenshots and PDF are in
  `docs/screenshots/resume-*`; compact validator/Lighthouse reports are in `docs`.

The minimal heartbeat host needs Chromium libraries and fonts extracted to
scratch and explicit `LD_LIBRARY_PATH`, `FONTCONFIG_FILE` and
`PLAYWRIGHT_BROWSERS_PATH`. CI installs these normally with Playwright's
`--with-deps` option. No production/deployment changes are included. Rollback is
closing the unmerged PR, or reverting its merge if later integrated.

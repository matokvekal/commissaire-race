
importent at this page all bugs and fitures you have to write some smal comment at the agents /read me so we know all the fitures of the app
after finish fix bug or fiture re organize the md files AGENT BUGS

> Completed items were removed to keep this file to OPEN work only. Their
> write-ups live in git history and the feature notes are in CLAUDE.md. Below is
> only what's left to do, renumbered 1..N in working order.

---
## OPEN ITEMS  (updated 2026-07-22)

| #  | Item | Priority | Status |
|----|------|----------|--------|
| 1 | ESLint broken project-wide (extends a Next.js preset in a Vite app) | 🟡 tooling | 🆕 TODO — needs OK to add dev-deps |
| 2 | Demo race redirects to Live with no signposted way back to Setup | 🟢 UX | 🆕 TODO |
| 3 | Terms gate has no test/dev bypass | 🟡 tooling | 🆕 TODO |
| 4 | Cleanup: unused-imports sweep + remove now-unused deps | 🟢 cleanup | 🟡 PARTIAL — do after #1 |
| 5 | Playwright / service-worker "error" | — | ⏳ BLOCKED — needs the real error text |

Working order: **1 → 2 → 3 → 4 → (5 blocked).**

---

### 1. ESLint is broken project-wide — 🟡 TODO (needs OK to add dev-deps)

`npx eslint` fails: `couldn't find the config "next/core-web-vitals"`.
`.eslintrc.json` extends the Next.js preset but this is a **Vite** app. So
`npm run lint` has never gated anything — unused vars, missing hook deps, etc.
The missing `react-hooks/exhaustive-deps` warnings are the likeliest to hide real
bugs in the big components.

**Fix:** replace config with Vite/React — `@eslint/js`, `eslint-plugin-react-hooks`,
`eslint-plugin-react-refresh`, `typescript-eslint`. (Requires installing dev-deps.)

**Validation:** `npm run lint` runs; triage first run (fix real errors, silence
the rest deliberately); app builds + full suite passes; do NOT auto-fix repo-wide
in one commit.

---

### 2. Demo race redirects to Live with no way back — 🟢 TODO

`race/[id]/page.tsx` bounces the first open of the demo to `/race/:id/heat/1`,
one-shot per session, with no indication a Setup view exists. **Fix:** an
affordance on the Live screen for demo races — "watching a race in progress → go
to Setup".

**Validation:** a first-timer can get back to Setup without guessing; the one-shot
redirect still fires only once per session; a non-demo race is unaffected.

---

### 3. Terms gate has no test/dev bypass — 🟡 TODO

`TermsGate` blocks every control on first load in a fresh profile (broke all E2E
specs until worked around in `tests/helpers.ts` `acceptTerms()`). **Fix:** a
localStorage seed helper or env flag so automation/demos/screenshots skip the
legal dialog.

**Validation:** a real first-time user still sees + must accept; the bypass works
for tests without weakening the real path; a `TERMS_VERSION` bump still re-prompts.

---

### 4. Cleanup: unused-imports sweep + remove unused deps — 🟡 PARTIAL (after #1)

Already done in earlier passes: dead-file removal (ExportCSVButton, csvExporter),
category-bank dedup (`constants/categoryTemplates.ts`). Still deferred:
* ~64 unused imports/locals (`tsc --noUnusedLocals --noUnusedParameters`) — do
  after ESLint so "unused" is provable, and NOT in one repo-wide commit.
* Remove now-unused deps from `package.json`. `@mui/material` + `@emotion/*` are
  no longer imported (Loader is pure CSS now); also candidates: `@mui/lab`,
  `@mui/x-date-pickers`, `@react-google-maps/api`, `axios`, `dayjs`,
  `react-circular-progressbar`, `react-color`, `react-leaflet`. Verify each with
  a grep for imports first. (Bundle already excludes them — this is housekeeping.)
* `ViewModeToggle`, `AdminPanel` (Phase 2 roles) and `RaceCloudPanel` (Phase 4
  cloud) are unimported but PARKED planned-phase scaffolding — leave until decided.

---

### 5. Playwright / service-worker "error" — ⏳ BLOCKED

Only a snippet of `playwright.config.ts` was pasted, no actual error. To fix:
run `npx playwright test` (or `npm run test:e2e`) and paste the real error/stack
here. (Unblock ESLint separately via #1.)

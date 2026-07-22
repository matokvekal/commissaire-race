
importent at this page all bugs and fitures you have to write some smal comment at the agents /read me so we know all the fitures of the app
after finish fix bug or fiture re organize the md files AGENT BUGS

> Completed items (1–31 incl. 17, R1–R6, R8, R10, 37) were removed to keep this
> file to OPEN work only. Their write-ups live in git history and the feature
> notes are in CLAUDE.md. Below is only what's left to do.

---
## OPEN ITEMS  (updated 2026-07-22)

| #  | Item | Priority | Status |
|----|------|----------|--------|
| 34 | JS bundle 1.76 MB (558 kB gz) — slow first load on a phone | 🔴 bottleneck | 🆕 TODO |
| 32 | Live log must keep ALL wave arrivals, in arrival order, persisted | 🟠 important | 🆕 TODO |
| 33 | ESLint broken project-wide (extends a Next.js preset in a Vite app) | 🟡 tooling | 🆕 TODO — needs OK to add dev-deps |
| 36 | Demo race redirects to Live with no signposted way back to Setup | 🟢 UX | 🆕 TODO |
| 35 | Terms gate has no test/dev bypass | 🟡 tooling | 🆕 TODO |
| R7 | Import: option to keep ANY skipped column as info on the card | 🟢 feature | 🆕 TODO |
| 12 | Cleanup: dead-file sweep + single-source-of-truth | 🟢 cleanup | 🟡 PARTIAL — do after #33 |
| R9 | Downloaded view-only races should be much easier to delete | 🟢 later | 🆕 TODO (later) |
| 1  | Playwright / service-worker "error" | — | ⏳ BLOCKED — needs the real error text |

Working order (user rule: bottleneck + important first, then the rest, 1 by 1):
**34 → 32 → 33 → 36 → 35 → R7 → 12 → (R9 later) → (1 blocked).**

---

### 34. JS bundle is 1.76 MB — slow first load on a phone — 🔴 TODO (doing first)

`npm run build` warns:
```
dist/assets/index-*.js   ~1,758 kB │ gzip: ~558 kB
```
Irrelevant on a laptop, but the users are at a start line on phone data. ~558 kB
gzipped before first paint is slow exactly when it matters, and a PWA cold start
after an update pays it again.

Likely heavy passengers, all rarely touched:
* `tesseract.js` — photo/OCR import
* `xlsx` — export/import
* `leaflet` + `react-leaflet` — the map tab
* `@mui/material`, `@mui/x-date-pickers`
* `@supabase/supabase-js` — cloud sync

**Fix:** `React.lazy` + dynamic `import()` for the OCR wizard, map tab, and Excel
export/import so none are in the initial chunk; then `manualChunks` for the rest.
MEASURE before/after — don't guess which import is expensive.

**Validation:** record baseline initial-chunk size; verify it drops materially
(target < 500 kB raw); verify OCR, map, and Excel still work on demand; full test
suite green.

---

### 32. Live log should keep ALL wave arrivals, in arrival order — 🟠 TODO

The rider action log should be a complete, chronological record of every arrival
in the wave, in crossing order — not bib-sorted, not truncated. That's what
settles a disputed placing. Today it's an in-memory `riderActions` array in
`useLapRecording`, so it's per-session/per-wave and lost on reload. Arrival order
is already newest-first, so the work is completeness + persistence.

**Validation:** record a full staggered wave; every arrival appears once, newest
first; undo removes exactly its own entry; reload mid-wave and the log survives;
DNF/DSQ stay interleaved in time order.

---

### 33. ESLint is broken project-wide — 🟡 TODO (needs OK to add dev-deps)

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

### 36. Demo race redirects to Live with no way back — 🟢 TODO

`race/[id]/page.tsx` bounces the first open of the demo to `/race/:id/heat/1`,
one-shot per session, with no indication a Setup view exists. **Fix:** an
affordance on the Live screen for demo races — "watching a race in progress → go
to Setup".

**Validation:** a first-timer can get back to Setup without guessing; the one-shot
redirect still fires only once per session; a non-demo race is unaffected.

---

### 35. Terms gate has no test/dev bypass — 🟡 TODO

`TermsGate` blocks every control on first load in a fresh profile (broke all E2E
specs until worked around in `tests/helpers.ts` `acceptTerms()`). **Fix:** a
localStorage seed helper or env flag so automation/demos/screenshots skip the
legal dialog.

**Validation:** a real first-time user still sees + must accept; the bypass works
for tests without weakening the real path; a `TERMS_VERSION` bump still re-prompts.

---

### R7. Import: let the user keep ANY skipped column as info — 🟢 TODO

R6 already keeps RECOGNISED extra columns (UCI number/points, etc.) in
`rider.extraFields`, shown in the rider card's "More info". The broader ask: in
the mapping step, offer "Keep as info (show on card)" for an UNrecognised column,
storing its raw value in `rider.extraFields[<column header>]`. Needs mapping-UI
plumbing: a synthetic multi-use target (several columns can be "info"), exempt
from the one-column-per-field dedup, handled in `riderRowMapper`.
Files: `types/csv.types.ts`, `components/csv/ColumnMappingStep.tsx`,
`services/riderRowMapper.ts`.

---

### 12. Cleanup: dead files + single source of truth — 🟡 PARTIAL (after #33)

Two important bugs from this pass already fixed (BUG-02 IDB wipe, BUG-03
calculatePositions mutation). Still deferred:
* Dead-file sweep — reachability candidates (ExportCSVButton, ViewModeToggle,
  RaceCloudPanel [cloud tab hidden], AdminPanel, etc.) + ~64 unused imports/locals
  (`tsc --noUnusedLocals --noUnusedParameters`). Verify each removal against a
  build so nothing lazily-referenced breaks.
* `PREDEFINED_TEMPLATES` duplicated in `Categories.tsx` + `CategoryManager.tsx`.
* Do AFTER #33 so "unused" is provable.

---

### R9. Easier delete for downloaded / view-only races — 🟢 TODO (later)

Races you download just to view results are read-only. Deleting them should be
much lighter than a full working race (skip the heavy confirm / one-tap remove).
Needs a way to mark a race as view-only/imported + a lighter delete affordance.
User said "later".

---

### 1. Playwright / service-worker "error" — ⏳ BLOCKED

Only a snippet of `playwright.config.ts` was pasted, no actual error. To fix:
run `npx playwright test` (or `npm run test:e2e`) and paste the real error/stack
here. (Unblock ESLint separately via #33.)

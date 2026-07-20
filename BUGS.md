
importent at this page all bugs and fitures you have to write some smal comment at the agents /read me so we know all the fitures of the app


1. ❯ whay error     // The app registers a service worker; block it so tests always hit fresh code.
  at dev server (port 3000) and drives the app in Chromium.
   */
  export default defineConfig({
    testDir: "./tests",
    fullyParallel: false,
    forbidOnly: !!process.env.CI,
    retries: 0,
⧉ Selected 7 lines from playwright.config.ts in Visual Studio Code

2 
❯ sub categories make me trobles i want to have only categories  so sya we have man pro  and man masters  so man masters can be 19-29 then master man 30 to 39 so on so that category per each age area but pro man are all one category not inner so we will not use sub category at all  nead secure fix
 2. ✅ DONE — sub categories

   **Decision:** old races keep their sub-categories (untouched, still render);
   new races are flat — one category per age band. Sub-category column is no
   longer importable.

   **Done:**
   - Predefined templates flattened: "Man Masters" + [19-29…60+] → separate
     categories "Man Masters 19-29", "Man Masters 30-39", etc. (both
     `Categories.tsx` and `CategoryManager.tsx`). "Man Pro"/Elite stay single.
   - Sub-category authoring removed: the text input in the Categories "create
     new" form, and the add/remove sub-category UI + selector strip in
     `CategoryManager.tsx`. New categories always get `subCategory: null`.
   - Legacy templates in localStorage that still carry sub-categories are
     expanded into flat ones on load ("Man Masters" + "30-39" → "Man Masters
     30-39"), so the picker can never offer a nested category again.
   - CSV/photo import: `subCategory` added to `IGNORED_FIELDS` — dropped from
     the mapping dropdown and never written onto a rider. Its keywords are
     deliberately KEPT so a "תת קטגוריה" / "Age Group" column is still absorbed
     by that field; without this it fuzzy-matches "קטגוריה" and overwrites the
     real category column. Verified: category column survives in he/en/age-group
     wordings.
   - `EditRiders` paste-import no longer reads a sub-category column.
   - `RiderDetailModal` only shows the sub-category input for riders that
     already have one (legacy), so new races never see the field.

   **Note:** `subCategory` stays on `RiderProps`/`CategoryProps` and in the
   category identity key (`name::subCategory`) on purpose — that is what keeps
   existing races rendering correctly. It is simply never authored anymore.

3. ✅ DONE — check that bib and staging are diferent in some case riders get bib number same as the standing , standinf is for eaxmple can be like they have point before the race so we set the firs rider  at first row so each row befor race hole the best 5 or 6 riders then next row but some new riders get number not same as the place since thay not have placed yesy so we need to check that bib is bib number and standing is other

   **Cause:** `autoMapColumns` claimed fields left-to-right, so a leading seeding
   column headed `מס'` / `No.` (an exact bib alias) grabbed `bibNumber` and locked
   the real `מספר רוכב` column out of it — bib ended up holding the standing order.
   Separately `standing` was parsed on import then thrown away (`RiderProps` had no
   such field).
   **Fix:** each field now goes to the column that matches it best anywhere in the
   row (not the first one); vague headers are capped at confidence 75 so a specific
   header always wins, and a vague header that loses its best field is left unmapped
   for manual mapping instead of cascading onto an unrelated field (it was landing
   on `heat`). Serial/seed headers (`מס״ד`, `seed`, `serial`, `order`) now map to
   `standing`, and `standing` is persisted on the rider.
   Files: `services/csvMapper.ts`, `utils/csvFieldDetector.ts`, `types/csv.types.ts`,
   `types/types.ts`, `components/csv/CSVImportWizard.tsx`, `utils/fieldMappingDictionary.json`

4.at riders the sort in smal mobile screen is set  to the  left and part is hidden need to fix move more right th popup

5. ✅ DONE — if no image of rider of no flag dont show  since now if not we see the alt -bad

   **Bigger cause than it looked:** flags used a hardcoded `/international/…`,
   but prod is served from `/commissire-race/` (BASE_URL) — so EVERY flag 404'd
   in production and showed its alt text. Also, no-flag riders defaulted to
   `"il"` (mislabelled them), and only 4 flag files exist (gb, il, it, us).
   **Fix:** new `RiderFlag` component — resolves via BASE_URL, renders nothing
   when there's no flag or the file 404s, `alt=""` so it degrades to nothing.
   Used in `RiderCard`, `Riders`, `StandingCard`. `RiderDetailModal` now falls
   back to its placeholder on a dead image URL.
   Files: `race/components/riderFlag/RiderFlag.tsx` (new), `riderCard/RiderCard.tsx`,
   `race/[id]/riders/Riders.tsx`, `standingCard/StandingCard.tsx`, `riderDetailModal/RiderDetailModal.tsx`

6/ ✅ DONE — wehn create new race add checkbox(auto selected default) to have Auto color
since some case the orginizer want to select t coloryou must test allt that nothing brakebtw/
any way at auto color dot choose similar color for close time starts

   **Checkbox:** "Auto color categories" on the new-race form, on by default.
   Stored as `race.autoColor` (undefined = true, so existing races unaffected).

   **Similar colours:** old scheme was `COLORS[index % length]` in creation
   order, with no awareness of time. Confirmed the palette has adjacent
   look-alikes — Steel Blue vs Dodger Blue at ΔE 34.9 (reads as the same colour
   on a phone). New `utils/colorAssignment.ts` works in CIE L*a*b* and gives each
   category the colour furthest from the ones it can overlap with.

   **Window is 90 min, not the start gap** — per your note (race = 15 min–1.5 h,
   waves ~10 min apart), waves up to ~90 min apart can still be ON COURSE
   together, which is when a mis-tap happens. Colours recycle outside that.

   **Verified:** 14-category schedule, 81 overlapping pairs, 0 too similar;
   undated categories still distinct. Typecheck + build pass.
   Files: `utils/colorAssignment.ts` (new), `stores/categoryStore.ts`,
   `types/types.ts`, `utils/saveRace.ts`, `main/addRace/AddRace.tsx` + css

7/ ✅ DONE — after seting laps(if not from file) riders didnt get the laps number for example if category got 5 laps rider in that category has 0/0 insted of 0/5

   **Cause:** four different places changed `category.laps`, but only the edit
   form pushed the new value onto the riders. The Quick-Laps panel, the inline
   +/- steppers on the category card, and `CategorySettingsModal` all wrote the
   category and left riders at 0. Riders imported without a laps column start at
   0, so they stayed 0/0. `AddRider` also copied laps off a sibling rider
   instead of the category, inheriting the same 0.

   **Fix (write side):** added `updateCategoryAndSyncRiders()` in
   `Categories.tsx` — every laps change now goes through it. Fixed the same
   omission in `CategorySettingsModal` (it synced colour but not laps, and
   matched riders by name only, so a legacy nested category overwrote its
   siblings). `AddRider` now takes laps from the category.

   **Fix (read side):** added `effectiveTotalLaps()` / `withCategoryLaps()` to
   `Schedule.tsx` — the category is the source of truth, a rider's `totalLaps`
   is just a cache. Applied in `LiveCards`, `LiveBoard`, `Results`, and the heat
   page (which had its own inline copy of this logic, now shared). This also
   heals races already saved with 0.

   **Not just cosmetic:** `LiveCards` gates finishing on `rider.totalLaps > 0`,
   so a rider at 0 could never finish and would lap forever.

   **Deliberate:** laps resolve as `category.laps || rider.totalLaps` — a
   category at 0/null means "not set yet" and must NOT wipe lap counts that came
   from the start list. Verified with 8 cases incl. legacy sub-categories.
   Files: `race/[id]/schedule/Schedule.tsx`, `race/[id]/categories/Categories.tsx`,
   `race/components/modals/CategorySettingsModal.tsx`, `race/components/addRider/AddRider.tsx`,
   `race/[id]/raceMode/{LiveCards,LiveBoard}.tsx`, `race/[id]/results/Results.tsx`,
   `race/[id]/heat/[heatId]/page.tsx`

8.at results - give in good ux way to select what fields to sho since we cant see the name in some case also save it as default at local storage

9. ✅ DONE — when we at live click at rider twice we want to give his status the DNF first up then DSQ
the other  this make sense

   The double-tap modal (`RiderLiveModal`) ALREADY ordered DNF → DSQ → DNS.
   The wrong order was in `StatusModal` (Check-In tab's "Status" button):
   `finished, running, standing, DNF, DSQ, DNS` — DNF was 4th, behind internal
   states you never set by hand. Reordered to `DNF, DSQ, DNS, standing, running,
   finished`.
   ⚠️ If you meant a different screen, say which — it's a one-line move.
   File: `race/components/modals/StatusModal.tsx`

10 ✅ DONE — at live i i click eider then i regret and tap cancell the rider still at the end of riders down we must bring it to same as it was befor with all same data as was

   **Cause:** tapping appends the rider to `displayOrder` after 1s. Cancel
   reverted lap *data* but never touched `displayOrder`. The revert was also
   lossy (rebuilt from `lapsDetails`, silently dropping `elapsedTimeFromStart`
   and `position_category`), and cancelling inside the 1s window didn't stop the
   pending move — it fired anyway and re-dropped the rider.
   **Fix:** each action now carries `prevRider` (exact pre-tap snapshot) +
   `prevOrderIndex`. Cancel restores byte-for-byte, splices them back into their
   original slot, and clears the pending timer. `handleRevertLap` reuses the same
   snapshot. Falls back to the old revert for actions logged before this change.
   **Verified:** 7 ordering cases (first/middle/last, 2-rider, single, finished
   rider re-inserted, out-of-range index clamps).
   File: `race/[id]/heat/[heatId]/page.tsx`

11 ✅ DONE — at uploading excell i wand some button that show example and point it to some downloadable excell/csv name it example.csv   or excell so i can fill it for users  then build me 1

   **Built** `public/example.csv` — 10 riders, 10 Hebrew columns, UTF-8 BOM so
   Excel opens Hebrew correctly. Sample data teaches the rules the other bugs
   exposed: bib ≠ דירוג on every row (incl. a new rider with blank ranking),
   flat categories per age band, Pro as one category, laps filled in.
   **UI:** "Download example.csv" in the upload step (via BASE_URL so it works on
   Pages). Refreshed the Supported Fields list (showed Position, not Standing).
   **Verified:** all 10 columns auto-map correctly through the real
   `autoMapColumns`; BOM present; no row has bib == standing.
   Files: `public/example.csv` (new), `components/csv/UploadStep.tsx` + css

12
 i need to go write teh bugs.md what you did and else at thois before i go do quick                                        /btw when start demo race some cards has to bee at 0 laps some at finish some dnf like real race also some wave not start…
  /btw we did it before at any time at race before in after i can download race compilte file as excel json csv and other s…
                                                                                  
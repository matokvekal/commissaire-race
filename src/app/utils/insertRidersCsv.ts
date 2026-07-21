import { initIndexedDB } from "@/stores/indexDb/indexedDbHelper";
import useRiderStore from "@/stores/ridersStore";
import { RiderProps } from "@/types/types";
import { RiderFieldKey } from "@/types/csv.types";
import { autoMapColumns } from "@/services/csvMapper";
import { rowToRider } from "@/services/riderRowMapper";
import Papa from "papaparse";

/**
 * Start-list import used by the Create Race screen.
 *
 * Columns are resolved by HEADER NAME, not position (BUGS.md #19). This used to
 * read `row[0]`…`row[8]` and only `console.warn` when the headers didn't match,
 * so any real-world file with its columns in a different order imported silently
 * wrong — names landing in categories, laps landing in teams.
 *
 * Detection is shared with the 4-step import wizard via `autoMapColumns`
 * (BUGS.md #20), so both entry points understand the same Hebrew/English
 * headers and apply the same bib-vs-standing rules.
 */

/** Without at least one of these we cannot build a usable rider. */
const REQUIRED_ANY: RiderFieldKey[][] = [
   ["bibNumber"],
   ["firstName", "lastName", "fullName"],
];

export const saveRidersFromCsv = async (csvData: string, raceUuid: string) => {
   try {
      const parsed = Papa.parse<string[]>(csvData, { skipEmptyLines: true });

      if (!parsed?.data || parsed.data.length < 2) {
         throw new Error("Invalid or empty CSV file.");
      }

      const headers = (parsed.data[0] ?? []).map((h) => String(h ?? "").trim());
      const mappings = await autoMapColumns(headers);

      // field → column index
      const col = new Map<RiderFieldKey, number>();
      mappings.forEach((m, idx) => {
         if (m.targetField && !col.has(m.targetField)) col.set(m.targetField, idx);
      });

      const missing = REQUIRED_ANY.filter(
         (group) => !group.some((f) => col.has(f))
      );
      if (missing.length > 0) {
         const names = missing.map((g) => g.join(" or ")).join("; ");
         throw new Error(
            `Could not find required column(s) in the file: ${names}. ` +
            `Detected headers: ${headers.join(", ") || "(none)"}`
         );
      }

      // Text heats ("Wave A") become numbers — same rule as the wizard.
      const heatNameToNumber = new Map<string, number>();
      const heatIdx = col.get("heat");
      if (heatIdx != null) {
         let next = 1;
         for (const row of parsed.data.slice(1)) {
            const val = row[heatIdx]?.trim();
            if (val && isNaN(Number(val)) && !heatNameToNumber.has(val)) {
               heatNameToNumber.set(val, next++);
            }
         }
      }

      // ONE shared row builder for both import paths (BUGS.md #20), so the same
      // file produces the same riders wherever it is dropped.
      const riders: RiderProps[] = parsed.data
         .slice(1)
         .map((row, index) => rowToRider(row, mappings, raceUuid, index, heatNameToNumber));

      // Save riders to IndexedDB
      const db = await initIndexedDB();
      for (const rider of riders) {
         await db.add("riders", rider);
      }
      db.close();

      const { insertRiders } = useRiderStore.getState();
      await insertRiders(riders);
   } catch (error) {
      if (error instanceof Error) {
         console.error("Error saving riders:", error.message);
      } else {
         console.error("Unknown error saving riders:", error);
      }
      throw error;
   }
};

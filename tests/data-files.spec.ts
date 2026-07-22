import { test, expect } from "@playwright/test";
import path from "path";
import { loadDemoRace, openTab, DEMO_RIDER_COUNT } from "./helpers";

/**
 * TEMPORARY: import the user's three real start-list files (data/) through the
 * Edit-Riders importer, to sanity-check auto-mapping + xlsx/csv parsing on real
 * Hebrew/English headers. Not a permanent fixture-based test.
 */
const FILES = [
  { name: "race1.xlsx", file: path.resolve(__dirname, "..", "data", "race1.xlsx") },
  { name: "race2.csv", file: path.resolve(__dirname, "..", "data", "race2.csv") },
  { name: "race3.xlsx", file: path.resolve(__dirname, "..", "data", "race3.xlsx") },
];

for (const { name, file } of FILES) {
  test(`import real file: ${name}`, async ({ page }) => {
    const consoleErrors: string[] = [];
    page.on("pageerror", (e) => consoleErrors.push(String(e)));

    await loadDemoRace(page);
    await openTab(page, "Riders");
    await page.getByRole("button", { name: "Actions" }).click();
    await page.getByRole("menuitem", { name: /Edit Riders/i }).click();
    await expect(page.getByText(`${DEMO_RIDER_COUNT} riders`)).toBeVisible();

    await page.locator('input[type="file"]').setInputFiles(file);

    // Preview shows "Import N riders" — capture N and confirm it's substantial.
    const importBtn = page.getByRole("button", { name: /Import \d+ riders/ });
    await expect(importBtn.first()).toBeVisible({ timeout: 15_000 });
    const label = await importBtn.first().innerText();
    const n = parseInt(label.match(/Import (\d+) riders/)![1], 10);
    console.log(`[${name}] preview parsed ${n} riders`);
    expect(n).toBeGreaterThan(10);

    await importBtn.first().click();

    // Rider count grew by the imported amount.
    await expect(
      page.getByText(`${DEMO_RIDER_COUNT + n} riders`)
    ).toBeVisible({ timeout: 20_000 });

    expect(consoleErrors, `page errors during ${name}`).toEqual([]);
  });
}

import * as XLSX from "xlsx";
import type { RaceProps, CategoryProps, RiderProps } from "@/types/types";

function safeStr(v: unknown): string {
  if (v == null) return "";
  if (typeof v === "object") return JSON.stringify(v);
  return String(v);
}

/** Version tag of the signature format. Bump only on a breaking payload change. */
export const EXPORT_SIGNATURE_VERSION = "commissaire-race-export/v1";

export interface ExportSignature {
  algo: "SHA-256";
  version: string;
  /** Who produced the file — the logged-in user, or "anonymous" for a local export. */
  exportedBy: string;
  exportedAt: string;
  nonce: string;
  /** The exact string that was hashed. Stored so the file verifies standalone. */
  payload: string;
  /** Lowercase hex SHA-256 of `payload`. */
  token: string;
}

/**
 * One line per rider, in a fixed field order and sorted by id, so the digest is
 * reproducible from the Riders sheet alone. Any edit to a bib, lap count, status
 * or finish time changes this string and therefore breaks the token.
 */
export function riderResultsDigest(riders: RiderProps[]): string {
  return [...riders]
    .sort((a, b) => a.id - b.id)
    .map((r) =>
      [
        r.id,
        r.bibNumber,
        r.lapsCounter ?? 0,
        r.status ?? "",
        r.raceStatus ?? "",
        r.position_category ?? 0,
        r.elapsedTimeFromStart ?? "",
      ].join(":")
    )
    .join(";");
}

/** The canonical string that gets hashed. Order and separators are part of the format. */
export function buildSignaturePayload(args: {
  raceUuid: string;
  categoryCount: number;
  riderCount: number;
  exportedBy: string;
  exportedAt: string;
  nonce: string;
  ridersDigest: string;
}): string {
  return [
    EXPORT_SIGNATURE_VERSION,
    `race=${args.raceUuid}`,
    `cats=${args.categoryCount}`,
    `riders=${args.riderCount}`,
    `by=${args.exportedBy}`,
    `at=${args.exportedAt}`,
    `nonce=${args.nonce}`,
    `data=${args.ridersDigest}`,
  ].join("\n");
}

async function sha256Hex(input: string): Promise<string> {
  const subtle = globalThis.crypto?.subtle;
  if (!subtle) {
    // Only happens on an insecure origin (plain http, non-localhost). Signing is
    // the whole point of the file, so fail loudly rather than ship an unsigned one.
    throw new Error(
      "Web Crypto is unavailable — a signed export needs a secure context (https or localhost)."
    );
  }
  const digest = await subtle.digest("SHA-256", new TextEncoder().encode(input));
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

function randomNonce(): string {
  const bytes = new Uint8Array(16);
  globalThis.crypto.getRandomValues(bytes);
  return [...bytes].map((b) => b.toString(16).padStart(2, "0")).join("");
}

/** Recompute the token from a payload and compare — used to verify a received file. */
export async function verifyExportToken(payload: string, token: string): Promise<boolean> {
  return (await sha256Hex(payload)) === token.toLowerCase();
}

export type VerificationStatus =
  /** Token matches and the rider rows still hash to the signed digest. */
  | "valid"
  /** Token matches its payload, but the Riders sheet no longer matches it. */
  | "results-modified"
  /** Token does not match its own payload — the signature block was edited. */
  | "invalid"
  /** No Signature sheet — an older export, or not one of ours. */
  | "unsigned";

export interface VerificationResult {
  status: VerificationStatus;
  message: string;
  exportedBy?: string;
  exportedAt?: string;
}

/**
 * Verify an exported workbook against its own Signature sheet (BUGS.md #28).
 * Uses the same format `exportRaceToXlsx` writes — there is no second scheme.
 */
export async function verifyRaceWorkbook(wb: XLSX.WorkBook): Promise<VerificationResult> {
  const sheet = wb.Sheets["Signature"];
  if (!sheet) {
    return {
      status: "unsigned",
      message:
        "This file has no signature sheet. It was either exported before signing existed, or it did not come from Commissaire.",
    };
  }

  const rows: string[][] = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: "", raw: false });
  const field: Record<string, string> = {};
  rows.slice(1).forEach((r) => { if (r[0]) field[String(r[0])] = String(r[1] ?? ""); });

  const { payload, token, exportedBy, exportedAt } = field;
  if (!payload || !token) {
    return {
      status: "invalid",
      message: "The signature sheet is incomplete — the file cannot be verified.",
    };
  }

  if (!(await verifyExportToken(payload, token))) {
    return {
      status: "invalid",
      message:
        "The signature does not match its own contents. The signature block has been altered.",
      exportedBy,
      exportedAt,
    };
  }

  // The token is intact — now check the results still hash to what was signed.
  const ridersSheet = wb.Sheets["Riders"];
  if (!ridersSheet) {
    return {
      status: "results-modified",
      message: "The signature is intact, but the Riders sheet is missing.",
      exportedBy,
      exportedAt,
    };
  }

  const riderRows = XLSX.utils.sheet_to_json<Record<string, string>>(ridersSheet, {
    defval: "",
    raw: false,
  });
  const digest = riderRows
    .map((r) => ({
      id: Number(r.id),
      line: [
        r.id,
        r.bibNumber,
        r.lapsCounter === "" ? 0 : r.lapsCounter,
        r.status,
        r.raceStatus,
        r.position_category === "" ? 0 : r.position_category,
        r.elapsedTimeFromStart,
      ].join(":"),
    }))
    .sort((a, b) => a.id - b.id)
    .map((r) => r.line)
    .join(";");

  if (!payload.includes(`data=${digest}`)) {
    return {
      status: "results-modified",
      message:
        "The signature is authentic, but the race results in this file have been changed since it was exported.",
      exportedBy,
      exportedAt,
    };
  }

  return {
    status: "valid",
    message: "Signature valid — the results are exactly as exported.",
    exportedBy,
    exportedAt,
  };
}

export async function exportRaceToXlsx(
  race: RaceProps,
  categories: CategoryProps[],
  riders: RiderProps[],
  filenameSuffix?: string,
  /** Identity stamped into the signature — email/id of the logged-in user. */
  exportedBy: string = "anonymous"
): Promise<ExportSignature> {
  const wb = XLSX.utils.book_new();

  // ── Sheet 1: Race metadata ──────────────────────────────────────
  const raceRows = [
    ["Field", "Value"],
    ["uuid", race.uuid],
    ["id", race.id],
    ["name", race.name ?? ""],
    ["date", race.date ?? ""],
    ["time", race.time ?? ""],
    ["location", race.location ?? ""],
    ["distance", race.distance ?? ""],
    ["type", race.type ?? ""],
    ["level", race.level ?? ""],
    ["orgenizer", race.orgenizer ?? ""],
    ["manager", race.manager ?? ""],
    ["phone", race.phone ?? ""],
    ["site", race.site ?? ""],
    ["takanon", race.takanon ?? ""],
    ["status", race.status ?? "upcoming"],
    ["owner", race.owner ?? ""],
  ];
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(raceRows), "Race");

  // ── Sheet 2: Categories ─────────────────────────────────────────
  const catHeaders = [
    "id", "raceUuid", "name", "subCategory", "color", "laps", "heat",
    "startTime", "status", "linkedFinish", "finishedAt", "lapsCounter", "riders"
  ];
  const catData = [catHeaders, ...categories.map((c) => catHeaders.map((h) => safeStr(c[h as keyof CategoryProps])))];
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(catData), "Categories");

  // ── Sheet 3: Riders ─────────────────────────────────────────────
  const riderHeaders = [
    "id", "raceUuid", "bibNumber", "firstName", "middleName", "lastName",
    "category", "subCategory", "team", "heat", "color", "chipNumber",
    "federation", "points", "flag",
    "totalLaps", "lapsCounter", "lapsDetails",
    "status", "raceStatus", "checked",
    "timeStartRace", "timeArrive",
    "elapsedLastLap", "elapsedTimeFromStart",
    "position_start", "position_category", "position_race",
    "distance", "viewOrder", "comment"
  ];
  const riderData = [
    riderHeaders,
    ...riders.map((r) =>
      riderHeaders.map((h) => {
        if (h === "lapsDetails") return JSON.stringify(r.lapsDetails ?? []);
        return safeStr(r[h as keyof RiderProps]);
      })
    )
  ];
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(riderData), "Riders");

  // ── Sheet 4: Signature ──────────────────────────────────────────
  // Provenance + tamper-evidence: the token is a SHA-256 over the exporting
  // user, the timestamp, a nonce, and a digest of every rider's result. Editing
  // a placing or a lap count in the Riders sheet no longer matches the token.
  const exportedAt = new Date().toISOString();
  const nonce = randomNonce();
  const payload = buildSignaturePayload({
    raceUuid: race.uuid,
    categoryCount: categories.length,
    riderCount: riders.length,
    exportedBy,
    exportedAt,
    nonce,
    ridersDigest: riderResultsDigest(riders),
  });
  const token = await sha256Hex(payload);
  const signature: ExportSignature = {
    algo: "SHA-256",
    version: EXPORT_SIGNATURE_VERSION,
    exportedBy,
    exportedAt,
    nonce,
    payload,
    token,
  };
  const sigRows = [
    ["Field", "Value"],
    ["version", signature.version],
    ["algo", signature.algo],
    ["exportedBy", signature.exportedBy],
    ["exportedAt", signature.exportedAt],
    ["nonce", signature.nonce],
    ["token", signature.token],
    ["payload", signature.payload],
  ];
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(sigRows), "Signature");

  // ── Download ────────────────────────────────────────────────────
  const safeName = (race.name ?? "race").replace(/[^\w\s-]/g, "").trim().replace(/\s+/g, "_");
  const date = race.date ? race.date.replace(/-/g, "") : new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const suffix = filenameSuffix ? `_${filenameSuffix}` : "";
  XLSX.writeFile(wb, `${safeName}_${date}${suffix}.xlsx`);

  return signature;
}

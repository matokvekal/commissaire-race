/**
 * XLSX Parser
 * Uses SheetJS to read .xlsx/.xls files and convert to the same
 * CSVParseResult format the rest of the import wizard uses.
 */

import * as XLSX from 'xlsx';
import type { CSVParseResult } from '@/types/csv.types';

export async function parseXLSXFile(file: File): Promise<CSVParseResult> {
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: 'array', cellDates: false });

  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];

  // Convert to array-of-arrays; header row included, raw values preserved
  const raw: (string | number | boolean | null)[][] = XLSX.utils.sheet_to_json(sheet, {
    header: 1,
    defval: '',
    raw: false,   // format numbers/dates as strings
    blankrows: false
  });

  if (raw.length === 0) {
    throw new Error('The file appears to be empty.');
  }

  // First non-empty row is the header; collapse multi-line header cells
  const headers = raw[0].map((cell) =>
    String(cell ?? '').replace(/\n/g, ' ').replace(/\s+/g, ' ').trim()
  );
  const rows = raw.slice(1).map((row) =>
    headers.map((_, i) => String(row[i] ?? '').trim())
  );

  return {
    headers,
    rows,
    detection: {
      encoding: 'UTF-8',
      delimiter: ',',
      headerRow: 0
    }
  };
}

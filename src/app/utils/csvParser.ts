/**
 * Smart CSV Parser
 * 
 * Intelligently detects and parses CSV files with various formats:
 * - Auto-detects encoding (UTF-8, UTF-16, Hebrew)
 * - Finds header row automatically
 * - Detects delimiter (comma, tab, semicolon, pipe)
 * - Skips empty rows and repeated headers
 * - Handles quoted fields with embedded delimiters
 * - Works with Hebrew and English content
 */

import type { CSVParseResult, CSVDetectionResult } from '@/types/csv.types';

/**
 * Detect CSV file encoding
 */
function detectEncoding(buffer: ArrayBuffer): CSVDetectionResult['encoding'] {
   const bytes = new Uint8Array(buffer);

   // Check for BOM (Byte Order Mark)
   if (bytes[0] === 0xEF && bytes[1] === 0xBB && bytes[2] === 0xBF) {
      return 'UTF-8';
   }
   if (bytes[0] === 0xFF && bytes[1] === 0xFE) {
      return 'UTF-16';
   }
   if (bytes[0] === 0xFE && bytes[1] === 0xFF) {
      return 'UTF-16';
   }

   // Check for Hebrew characters (Windows-1255 encoding)
   // Hebrew characters in Windows-1255: 0xE0-0xFA
   let hebrewCount = 0;
   for (let i = 0; i < Math.min(bytes.length, 1000); i++) {
      if (bytes[i] >= 0xE0 && bytes[i] <= 0xFA) {
         hebrewCount++;
      }
   }

   if (hebrewCount > 10) {
      return 'Windows-1255';
   }

   return 'UTF-8';
}

/**
 * Detect CSV delimiter
 */
function detectDelimiter(lines: string[]): ',' | '\t' | ';' | '|' {
   const delimiters = [',', '\t', ';', '|'];
   const scores: Record<string, number> = {};

   // Sample first few lines
   const sampleLines = lines.slice(0, Math.min(10, lines.length));

   for (const delimiter of delimiters) {
      let totalCount = 0;
      let consistency = 0;
      let firstLineCount = -1;

      for (const line of sampleLines) {
         if (!line.trim()) continue;

         const count = line.split(delimiter).length - 1;
         totalCount += count;

         if (firstLineCount === -1) {
            firstLineCount = count;
         } else if (count === firstLineCount && count > 0) {
            consistency++;
         }
      }

      // Score = total occurrences * consistency bonus
      scores[delimiter] = totalCount * (1 + consistency * 0.5);
   }

   // Return delimiter with highest score
   let bestDelimiter: ',' | '\t' | ';' | '|' = ',';
   let bestScore = 0;

   for (const delimiter of delimiters) {
      if (scores[delimiter] > bestScore) {
         bestScore = scores[delimiter];
         bestDelimiter = delimiter as typeof bestDelimiter;
      }
   }

   return bestDelimiter;
}

/**
 * Check if row looks like a header
 */
function isLikelyHeader(cells: string[]): boolean {
   if (cells.length === 0) return false;

   // Headers usually:
   // 1. Have no empty cells or few empty cells
   const emptyCount = cells.filter(c => !c.trim()).length;
   if (emptyCount > cells.length * 0.5) return false;

   // 2. Contain text (not all numbers)
   const numericCount = cells.filter(c => !isNaN(Number(c.trim()))).length;
   if (numericCount === cells.length && cells.length > 1) return false;

   // 3. Have unique values (column names are unique)
   const uniqueValues = new Set(cells.map(c => c.trim().toLowerCase()));
   if (uniqueValues.size < cells.length * 0.7) return false;

   // 4. Contain common header keywords
   const headerKeywords = [
      'מספר', 'שם', 'קטגוריה', 'קבוצה', 'מס\'', 'ביב',
      'number', 'name', 'category', 'team', 'bib', 'first', 'last'
   ];

   const hasKeywords = cells.some(cell =>
      headerKeywords.some(keyword =>
         cell.toLowerCase().includes(keyword.toLowerCase())
      )
   );

   return hasKeywords;
}

/**
 * Find header row in CSV
 */
function findHeaderRow(rows: string[][]): number {
   // Check first 10 rows for likely header
   for (let i = 0; i < Math.min(10, rows.length); i++) {
      if (isLikelyHeader(rows[i])) {
         return i;
      }
   }

   // Default to first non-empty row
   for (let i = 0; i < rows.length; i++) {
      if (rows[i].some(cell => cell.trim())) {
         return i;
      }
   }

   return 0;
}

/**
 * Parse CSV line respecting quotes
 */
function parseLine(line: string, delimiter: string): string[] {
   const cells: string[] = [];
   let currentCell = '';
   let inQuotes = false;

   for (let i = 0; i < line.length; i++) {
      const char = line[i];

      if (char === '"') {
         // Check for escaped quote ("")
         if (inQuotes && line[i + 1] === '"') {
            currentCell += '"';
            i++; // Skip next quote
         } else {
            inQuotes = !inQuotes;
         }
      } else if (char === delimiter && !inQuotes) {
         cells.push(currentCell.trim());
         currentCell = '';
      } else {
         currentCell += char;
      }
   }

   // Add last cell
   cells.push(currentCell.trim());

   return cells;
}

/**
 * Check if two rows are similar (for detecting repeated headers)
 */
function areRowsSimilar(row1: string[], row2: string[]): boolean {
   if (row1.length !== row2.length) return false;
   if (row1.length === 0) return false;

   let matchCount = 0;
   for (let i = 0; i < row1.length; i++) {
      if (row1[i].toLowerCase().trim() === row2[i].toLowerCase().trim()) {
         matchCount++;
      }
   }

   // 80% similarity = repeated header
   return matchCount / row1.length >= 0.8;
}

/**
 * Parse CSV file with intelligent detection
 * 
 * @param file - CSV file to parse
 * @returns Parsed CSV result with headers and rows
 */
export async function parseCSVFile(file: File): Promise<CSVParseResult> {
   // Read file as ArrayBuffer for encoding detection
   const buffer = await file.arrayBuffer();
   const encoding = detectEncoding(buffer);

   // Decode to text
   const decoder = new TextDecoder(encoding);
   const text = decoder.decode(buffer);

   // Split into lines
   const lines = text.split(/\r?\n/);

   // Detect delimiter
   const delimiter = detectDelimiter(lines);

   // Parse lines
   const allRows = lines
      .map(line => parseLine(line, delimiter))
      .filter(row => row.some(cell => cell.trim())); // Remove completely empty rows

   // Find header row
   const headerRowIndex = findHeaderRow(allRows);
   const headers = allRows[headerRowIndex];

   // Extract data rows (skip header and detect repeated headers)
   const dataRows: string[][] = [];
   const skippedRows: number[] = [];

   for (let i = headerRowIndex + 1; i < allRows.length; i++) {
      const row = allRows[i];

      // Skip if same as header (repeated header)
      if (areRowsSimilar(row, headers)) {
         skippedRows.push(i);
         continue;
      }

      // Skip if all empty
      if (!row.some(cell => cell.trim())) {
         skippedRows.push(i);
         continue;
      }

      dataRows.push(row);
   }

   return {
      headers,
      rows: dataRows,
      detection: {
         encoding,
         delimiter,
         headerRow: headerRowIndex
      }
   };
}

/**
 * Validate parsed CSV
 * Returns true if CSV has valid structure
 */
export function validateCSV(result: CSVParseResult): { valid: boolean; error?: string } {
   if (result.headers.length === 0) {
      return { valid: false, error: 'No headers found in CSV' };
   }

   if (result.rows.length === 0) {
      return { valid: false, error: 'No data rows found in CSV' };
   }

   // Check if all rows have same number of columns
   const expectedColumns = result.headers.length;
   const inconsistentRows = result.rows.filter(row => row.length !== expectedColumns);

   if (inconsistentRows.length > result.rows.length * 0.2) {
      return {
         valid: false,
         error: `Too many rows with inconsistent column count (expected ${expectedColumns} columns)`
      };
   }

   return { valid: true };
}

/**
 * Get CSV preview (first N rows)
 */
export function getCSVPreview(result: CSVParseResult, maxRows: number = 5): string[][] {
   return result.rows.slice(0, maxRows);
}

/**
 * Convert CSV row to object using headers
 */
export function rowToObject(headers: string[], row: string[]): Record<string, string> {
   const obj: Record<string, string> = {};

   for (let i = 0; i < headers.length; i++) {
      const header = headers[i];
      const value = row[i] || '';
      obj[header] = value;
   }

   return obj;
}

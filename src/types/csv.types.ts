/**
 * CSV Import Type Definitions
 * 
 * Types for intelligent CSV import system with fuzzy matching
 */

import type { RiderProps } from './types';

// ============================================================================
// CSV Parsing Types
// ============================================================================

export interface CSVParseResult {
   headers: string[];
   rows: string[][];
   detection: {
      encoding: string;
      delimiter: string;
      headerRow: number;
   };
}

export interface CSVDetectionResult {
   encoding: 'UTF-8' | 'UTF-16' | 'Windows-1255' | 'Unknown';
   delimiter: ',' | '\t' | ';' | '|';
   hasHeaders: boolean;
   headerRowIndex: number;
   confidence: number;
}

// ============================================================================
// Column Mapping Types
// ============================================================================

export type RiderFieldKey =
   | 'bibNumber'
   | 'firstName'
   | 'lastName'
   | 'fullName'
   | 'category'
   | 'team'
   | 'gender'
   | 'heat'
   | 'startTime'
   | 'totalLaps'
   | 'position';

export interface ColumnMapping {
   sourceColumn: string;      // Original CSV column name
   targetField: RiderFieldKey | null; // App field or null if unmapped
   confidence: number;        // 0-100
   isAutoMapped: boolean;     // True if auto-detected
   needsConfirmation: boolean; // True if confidence < 85%
}

export interface ColumnMappingSuggestion {
   field: RiderFieldKey;
   confidence: number;
   reason: string; // "Exact match", "Fuzzy match", "Keyword found"
}

// ============================================================================
// Validation Types
// ============================================================================

export type ValidationSeverity = 'error' | 'warning' | 'info';

export interface ValidationIssue {
   severity: ValidationSeverity;
   row: number;
   field: RiderFieldKey | 'general';
   message: string;
   value?: string;
}

export interface ValidationResult {
   isValid: boolean;
   issues: ValidationIssue[];
   summary: {
      total: number;
      errors: number;
      warnings: number;
      info: number;
   };
}

// ============================================================================
// Import Types
// ============================================================================

export interface ParsedRider {
   rowIndex: number;
   data: Partial<RiderProps>;
   issues: ValidationIssue[];
   isValid: boolean;
}

export interface ImportPreview {
   riders: ParsedRider[];
   validation: ValidationResult;
   stats: {
      total: number;
      valid: number;
      warnings: number;
      errors: number;
   };
}

export interface ImportResult {
   success: boolean;
   imported: number;
   skipped: number;
   errors: ValidationIssue[];
   riders: RiderProps[];
}

export interface ImportProgress {
   total: number;
   processed: number;
   successful: number;
   failed: number;
   status: 'importing' | 'completed' | 'error';
}

// ============================================================================
// Learning/Memory Types
// ============================================================================

export interface ColumnMappingMemory {
   id: string;
   sourceColumn: string;
   targetField: RiderFieldKey;
   confidence: number;
   timesUsed: number;
   lastUsed: Date;
   language: 'he' | 'en' | 'mixed';
}

export interface MappingHistory {
   mappings: ColumnMappingMemory[];
   lastUpdated: Date;
}

// ============================================================================
// Wizard State Types
// ============================================================================

export type ImportStep = 'upload' | 'mapping' | 'preview' | 'importing' | 'complete';

export interface ImportWizardState {
   step: ImportStep;
   file: File | null;
   parseResult: CSVParseResult | null;
   columnMappings: ColumnMapping[];
   preview: ImportPreview | null;
   importResult: ImportResult | null;
   isLoading: boolean;
   error: string | null;
}

// ============================================================================
// Field Keywords (for fuzzy matching)
// ============================================================================

export interface FieldKeywords {
   field: RiderFieldKey;
   hebrew: string[];
   english: string[];
   priority: number; // Higher = more important (for disambiguation)
}

export const FIELD_KEYWORDS: FieldKeywords[] = [
   {
      field: 'bibNumber',
      hebrew: ['מספר', 'מס\'', 'ביב', 'רוכב', 'מס רוכב', 'מספר רוכב'],
      english: ['bib', 'number', 'num', 'rider', 'rider number', '#'],
      priority: 10
   },
   {
      field: 'firstName',
      hebrew: ['שם', 'שם פרטי', 'פרטי', 'שם ראשון'],
      english: ['first', 'first name', 'fname', 'given', 'given name'],
      priority: 8
   },
   {
      field: 'lastName',
      hebrew: ['שם משפחה', 'משפחה', 'מש\'', 'שם אחרון'],
      english: ['last', 'last name', 'lname', 'surname', 'family', 'family name'],
      priority: 8
   },
   {
      field: 'fullName',
      hebrew: ['שם מלא', 'שם', 'רוכב'],
      english: ['full name', 'name', 'rider name', 'full'],
      priority: 7
   },
   {
      field: 'category',
      hebrew: ['קטגוריה', 'קט\'', 'גיל', 'שכבת גיל', 'שכבה'],
      english: ['category', 'cat', 'age', 'age group', 'class', 'group'],
      priority: 9
   },
   {
      field: 'team',
      hebrew: ['קבוצה', 'קב\'', 'מועדון', 'צוות', 'אגודה'],
      english: ['team', 'club', 'squad', 'organization', 'org'],
      priority: 6
   },
   {
      field: 'gender',
      hebrew: ['מגדר', 'מין', 'זכר', 'נקבה'],
      english: ['gender', 'sex', 'male', 'female', 'm/f', 'm', 'f'],
      priority: 5
   },
   {
      field: 'heat',
      hebrew: ['חימום', 'מקצה', 'סבב', 'גל', 'התחלה'],
      english: ['heat', 'wave', 'start', 'start group', 'group'],
      priority: 7
   },
   {
      field: 'startTime',
      hebrew: ['זמן התחלה', 'שעת התחלה', 'שעה', 'זמן'],
      english: ['start time', 'time', 'start', 'clock'],
      priority: 6
   },
   {
      field: 'totalLaps',
      hebrew: ['סבבים', 'הקפות', 'מספר סבבים', 'לאפים'],
      english: ['laps', 'total laps', 'rounds', 'total rounds'],
      priority: 5
   },
   {
      field: 'position',
      hebrew: ['מיקום', 'עמדה', 'מקום', 'דירוג'],
      english: ['position', 'pos', 'place', 'rank', 'standing'],
      priority: 4
   }
];

import type { RiderProps } from '@/types/types';

export interface ExportOptions {
   fields?: ExportField[];
   language?: 'he' | 'en';
   delimiter?: ',' | '\t' | ';';
   encoding?: 'UTF-8' | 'UTF-16' | 'Windows-1255';
   includeHeaders?: boolean;
}

export interface ExportField {
   key: keyof RiderProps;
   label: string;
}

const DEFAULT_FIELDS_HE: ExportField[] = [
   { key: 'bibNumber', label: 'מס\' רוכב' },
   { key: 'firstName', label: 'שם פרטי' },
   { key: 'lastName', label: 'שם משפחה' },
   { key: 'category', label: 'קטגוריה' },
   { key: 'team', label: 'קבוצה' },
   { key: 'heat', label: 'מקצה' },
   { key: 'timeStartRace', label: 'שעת התחלה' },
   { key: 'totalLaps', label: 'סבבים' },
   { key: 'position_start', label: 'מיקום התחלה' }
];

const DEFAULT_FIELDS_EN: ExportField[] = [
   { key: 'bibNumber', label: 'Bib Number' },
   { key: 'firstName', label: 'First Name' },
   { key: 'lastName', label: 'Last Name' },
   { key: 'category', label: 'Category' },
   { key: 'team', label: 'Team' },
   { key: 'heat', label: 'Heat' },
   { key: 'timeStartRace', label: 'Start Time' },
   { key: 'totalLaps', label: 'Total Laps' },
   { key: 'position_start', label: 'Start Position' }
];

function escapeCSVField(value: string, delimiter: string = ','): string {
   if (!value) return '';
   const str = String(value);
   if (str.includes(delimiter) || str.includes('"') || str.includes('\n') || str.includes('\r')) {
      return `"${str.replace(/"/g, '""')}"`;
   }
   return str;
}

export function ridersToCSV(riders: RiderProps[], options: ExportOptions = {}): string {
   const {
      fields = options.language === 'en' ? DEFAULT_FIELDS_EN : DEFAULT_FIELDS_HE,
      delimiter = ',',
      includeHeaders = true
   } = options;

   const lines: string[] = [];

   if (includeHeaders) {
      lines.push(fields.map(f => escapeCSVField(f.label, delimiter)).join(delimiter));
   }

   riders.forEach(rider => {
      const row = fields.map(field => {
         const value = rider[field.key];
         return escapeCSVField(value?.toString() || '', delimiter);
      });
      lines.push(row.join(delimiter));
   });

   return lines.join('\n');
}

export function downloadCSV(riders: RiderProps[], filename: string = 'riders.csv', options: ExportOptions = {}): void {
   const csv = ridersToCSV(riders, options);

   let content = csv;
   if (options.language !== 'en') {
      content = '﻿' + csv;
   }

   const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
   const link = document.createElement('a');
   const url = URL.createObjectURL(blob);
   link.setAttribute('href', url);
   link.setAttribute('download', filename);
   link.style.visibility = 'hidden';
   document.body.appendChild(link);
   link.click();
   document.body.removeChild(link);
   URL.revokeObjectURL(url);
}

export function getAvailableFields(riders: RiderProps[], language: 'he' | 'en' = 'he'): ExportField[] {
   if (riders.length === 0) {
      return language === 'en' ? DEFAULT_FIELDS_EN : DEFAULT_FIELDS_HE;
   }
   const allFields = language === 'en' ? DEFAULT_FIELDS_EN : DEFAULT_FIELDS_HE;
   return allFields.filter(field =>
      riders.some(rider => rider[field.key] != null && rider[field.key] !== '')
   );
}

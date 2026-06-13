/**
 * CSV Column Mapper Service
 * 
 * Intelligent column mapping using fuzzy matching and learning.
 * Maps CSV column names to app fields without API costs.
 */

import type {
   ColumnMapping,
   ColumnMappingSuggestion,
   RiderFieldKey,
   ColumnMappingMemory,
   MappingHistory
} from '@/types/csv.types';
import { FIELD_KEYWORDS } from '@/types/csv.types';
import { fuzzyMatchScore, normalize, contains } from '@/utils/levenshtein';
import { openDB, IDBPDatabase } from 'idb';

const DB_NAME = 'csvMappingMemory';
const DB_VERSION = 1;
const STORE_NAME = 'mappings';

// ============================================================================
// IndexedDB for Learning
// ============================================================================

async function initMappingDB(): Promise<IDBPDatabase> {
   return await openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
         if (!db.objectStoreNames.contains(STORE_NAME)) {
            db.createObjectStore(STORE_NAME, { keyPath: 'id' });
         }
      }
   });
}

/**
 * Save a mapping to memory for future use
 */
async function saveMappingMemory(
   sourceColumn: string,
   targetField: RiderFieldKey
): Promise<void> {
   try {
      const db = await initMappingDB();
      const id = `${normalize(sourceColumn)}_${targetField}`;

      // Check if exists
      const existing = await db.get(STORE_NAME, id);

      if (existing) {
         // Update existing
         existing.timesUsed++;
         existing.lastUsed = new Date();
         existing.confidence = Math.min(100, existing.confidence + 5); // Boost confidence
         await db.put(STORE_NAME, existing);
      } else {
         // Create new
         const memory: ColumnMappingMemory = {
            id,
            sourceColumn: normalize(sourceColumn),
            targetField,
            confidence: 70, // Start at 70%
            timesUsed: 1,
            lastUsed: new Date(),
            language: detectLanguage(sourceColumn)
         };
         await db.add(STORE_NAME, memory);
      }

      db.close();
   } catch (error) {
      console.error('Failed to save mapping memory:', error);
   }
}

/**
 * Get mapping from memory if exists
 */
async function getMappingFromMemory(
   sourceColumn: string
): Promise<ColumnMappingMemory | null> {
   try {
      const db = await initMappingDB();
      const normalized = normalize(sourceColumn);

      // Try exact match first
      const id = await db.getAllKeys(STORE_NAME);

      for (const key of id) {
         const memory = await db.get(STORE_NAME, key as string);
         if (memory && normalize(memory.sourceColumn) === normalized) {
            db.close();
            return memory;
         }
      }

      db.close();
      return null;
   } catch (error) {
      console.error('Failed to get mapping from memory:', error);
      return null;
   }
}

/**
 * Get all mapping memories
 */
export async function getAllMappingMemories(): Promise<MappingHistory> {
   try {
      const db = await initMappingDB();
      const mappings = await db.getAll(STORE_NAME);
      db.close();

      return {
         mappings,
         lastUpdated: new Date()
      };
   } catch (error) {
      console.error('Failed to get all mappings:', error);
      return { mappings: [], lastUpdated: new Date() };
   }
}

/**
 * Clear all mapping memories
 */
export async function clearMappingMemory(): Promise<void> {
   try {
      const db = await initMappingDB();
      await db.clear(STORE_NAME);
      db.close();
   } catch (error) {
      console.error('Failed to clear mapping memory:', error);
   }
}

// ============================================================================
// Language Detection
// ============================================================================

function detectLanguage(text: string): 'he' | 'en' | 'mixed' {
   const hebrewChars = text.match(/[\u0590-\u05FF]/g) || [];
   const englishChars = text.match(/[a-zA-Z]/g) || [];

   if (hebrewChars.length > 0 && englishChars.length > 0) return 'mixed';
   if (hebrewChars.length > 0) return 'he';
   return 'en';
}

// ============================================================================
// Fuzzy Matching Logic
// ============================================================================

/**
 * Find best field match for a CSV column
 * Uses keyword matching and fuzzy string matching
 */
function findBestFieldMatch(
   columnName: string,
   usedFields: Set<RiderFieldKey>
): ColumnMappingSuggestion[] {
   const suggestions: ColumnMappingSuggestion[] = [];
   const normalized = normalize(columnName);
   const language = detectLanguage(columnName);

   for (const fieldKeywords of FIELD_KEYWORDS) {
      // Skip if field already mapped
      if (usedFields.has(fieldKeywords.field)) continue;

      const keywords = language === 'en'
         ? fieldKeywords.english
         : language === 'he'
            ? fieldKeywords.hebrew
            : [...fieldKeywords.hebrew, ...fieldKeywords.english];

      let bestScore = 0;
      let matchReason = '';

      for (const keyword of keywords) {
         const score = fuzzyMatchScore(columnName, keyword);

         if (score > bestScore) {
            bestScore = score;

            // Determine reason
            if (normalize(columnName) === normalize(keyword)) {
               matchReason = 'Exact match';
            } else if (contains(normalized, normalize(keyword))) {
               matchReason = 'Contains keyword';
            } else if (score >= 80) {
               matchReason = 'Fuzzy match';
            } else {
               matchReason = 'Partial match';
            }
         }
      }

      // Boost score based on field priority
      const priorityBoost = fieldKeywords.priority * 2;
      const finalScore = Math.min(100, bestScore + (bestScore > 50 ? priorityBoost : 0));

      if (finalScore > 40) { // Only add decent matches
         suggestions.push({
            field: fieldKeywords.field,
            confidence: finalScore,
            reason: matchReason
         });
      }
   }

   // Sort by confidence (highest first)
   suggestions.sort((a, b) => b.confidence - a.confidence);

   return suggestions;
}

/**
 * Auto-map CSV columns to app fields
 * Returns array of column mappings with confidence scores
 */
export async function autoMapColumns(
   headers: string[]
): Promise<ColumnMapping[]> {
   const mappings: ColumnMapping[] = [];
   const usedFields = new Set<RiderFieldKey>();

   for (const header of headers) {
      // Check memory first
      const memory = await getMappingFromMemory(header);

      if (memory && !usedFields.has(memory.targetField)) {
         // Use learned mapping
         mappings.push({
            sourceColumn: header,
            targetField: memory.targetField,
            confidence: memory.confidence,
            isAutoMapped: true,
            needsConfirmation: memory.confidence < 85
         });
         usedFields.add(memory.targetField);
         continue;
      }

      // Find best match
      const suggestions = findBestFieldMatch(header, usedFields);

      if (suggestions.length > 0 && suggestions[0].confidence >= 60) {
         // Auto-map if confidence >= 60%
         const best = suggestions[0];
         mappings.push({
            sourceColumn: header,
            targetField: best.field,
            confidence: best.confidence,
            isAutoMapped: true,
            needsConfirmation: best.confidence < 85
         });
         usedFields.add(best.field);
      } else {
         // No good match, leave unmapped
         mappings.push({
            sourceColumn: header,
            targetField: null,
            confidence: 0,
            isAutoMapped: false,
            needsConfirmation: true
         });
      }
   }

   return mappings;
}

/**
 * Get suggestions for a specific column
 * Returns top 3 suggestions
 */
export function getColumnSuggestions(
   columnName: string,
   usedFields: Set<RiderFieldKey>
): ColumnMappingSuggestion[] {
   const suggestions = findBestFieldMatch(columnName, usedFields);
   return suggestions.slice(0, 3); // Top 3
}

/**
 * Confirm and save a mapping
 * Updates learning database
 */
export async function confirmMapping(
   sourceColumn: string,
   targetField: RiderFieldKey
): Promise<void> {
   await saveMappingMemory(sourceColumn, targetField);
}

/**
 * Handle special case: Full name column
 * If only fullName is mapped, suggest splitting to firstName + lastName
 */
export function detectNameSplitting(
   mappings: ColumnMapping[]
): { shouldSplit: boolean; fullNameColumn: string | null } {
   const hasFullName = mappings.some(m => m.targetField === 'fullName');
   const hasFirstName = mappings.some(m => m.targetField === 'firstName');
   const hasLastName = mappings.some(m => m.targetField === 'lastName');

   if (hasFullName && !hasFirstName && !hasLastName) {
      const fullNameMapping = mappings.find(m => m.targetField === 'fullName');
      return {
         shouldSplit: true,
         fullNameColumn: fullNameMapping?.sourceColumn || null
      };
   }

   return { shouldSplit: false, fullNameColumn: null };
}

/**
 * Split full name into first and last name
 * Handles Hebrew and English names
 * 
 * @example
 * splitFullName("גלעד דולב") // { firstName: "גלעד", lastName: "דולב" }
 * splitFullName("John Doe Smith") // { firstName: "John", lastName: "Doe Smith" }
 */
export function splitFullName(
   fullName: string
): { firstName: string; lastName: string } {
   const parts = fullName.trim().split(/\s+/);

   if (parts.length === 0) {
      return { firstName: '', lastName: '' };
   }

   if (parts.length === 1) {
      return { firstName: parts[0], lastName: '' };
   }

   // First part = first name, rest = last name
   const firstName = parts[0];
   const lastName = parts.slice(1).join(' ');

   return { firstName, lastName };
}

/**
 * Get mapping statistics
 */
export function getMappingStats(mappings: ColumnMapping[]): {
   total: number;
   mapped: number;
   unmapped: number;
   needsConfirmation: number;
   highConfidence: number;
} {
   const mapped = mappings.filter(m => m.targetField !== null);
   const needsConfirmation = mappings.filter(m => m.needsConfirmation);
   const highConfidence = mappings.filter(m => m.confidence >= 85);

   return {
      total: mappings.length,
      mapped: mapped.length,
      unmapped: mappings.length - mapped.length,
      needsConfirmation: needsConfirmation.length,
      highConfidence: highConfidence.length
   };
}

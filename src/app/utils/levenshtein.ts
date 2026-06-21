/**
 * Levenshtein Distance Calculator
 * 
 * Calculates edit distance between two strings for fuzzy matching.
 * Used to match similar column names (e.g., "מספר" vs "מס'")
 */

/**
 * Calculate Levenshtein distance between two strings
 * Returns number of edits (insertions, deletions, substitutions) needed
 * 
 * @example
 * levenshteinDistance("מספר", "מס'") // 2
 * levenshteinDistance("bib", "bibNumber") // 6
 */
export function levenshteinDistance(str1: string, str2: string): number {
   const s1 = str1.toLowerCase().trim();
   const s2 = str2.toLowerCase().trim();

   const len1 = s1.length;
   const len2 = s2.length;

   // Create 2D array
   const matrix: number[][] = Array(len1 + 1)
      .fill(null)
      .map(() => Array(len2 + 1).fill(0));

   // Initialize first row and column
   for (let i = 0; i <= len1; i++) {
      matrix[i][0] = i;
   }
   for (let j = 0; j <= len2; j++) {
      matrix[0][j] = j;
   }

   // Fill matrix
   for (let i = 1; i <= len1; i++) {
      for (let j = 1; j <= len2; j++) {
         const cost = s1[i - 1] === s2[j - 1] ? 0 : 1;
         matrix[i][j] = Math.min(
            matrix[i - 1][j] + 1,      // deletion
            matrix[i][j - 1] + 1,      // insertion
            matrix[i - 1][j - 1] + cost // substitution
         );
      }
   }

   return matrix[len1][len2];
}

/**
 * Calculate similarity percentage between two strings
 * Returns 0-100 where 100 is exact match
 * 
 * @example
 * similarity("מספר", "מספר רוכב") // 66
 * similarity("bib", "bibNumber") // 33
 */
export function similarity(str1: string, str2: string): number {
   const distance = levenshteinDistance(str1, str2);
   const maxLen = Math.max(str1.length, str2.length);

   if (maxLen === 0) return 100;

   return Math.round(((maxLen - distance) / maxLen) * 100);
}

/**
 * Check if string contains another string (case-insensitive, trimmed)
 * 
 * @example
 * contains("מספר רוכב", "מספר") // true
 * contains("Rider Number", "number") // true
 */
export function contains(haystack: string, needle: string): boolean {
   return haystack.toLowerCase().trim().includes(needle.toLowerCase().trim());
}

/**
 * Check if string starts with another string (case-insensitive, trimmed)
 */
export function startsWith(str: string, prefix: string): boolean {
   return str.toLowerCase().trim().startsWith(prefix.toLowerCase().trim());
}

/**
 * Normalize string for comparison
 * - Lowercase
 * - Trim whitespace
 * - Remove special characters
 * - Normalize Hebrew punctuation
 */
export function normalize(str: string): string {
   return str
      .toLowerCase()
      .trim()
      .replace(/['"`,.:;!?]/g, '')  // Remove punctuation
      .replace(/\s+/g, ' ')          // Normalize whitespace
      .replace(/[׳״]/g, '');         // Remove Hebrew punctuation (geresh, gershayim)
}

/**
 * Calculate fuzzy match score between two strings
 * Combines multiple matching strategies for best results
 * Returns 0-100 where 100 is perfect match
 * 
 * Strategies:
 * 1. Exact match (normalized) = 100
 * 2. One contains the other = 80-95
 * 3. High similarity (>80%) = similarity score
 * 4. Moderate similarity (50-80%) = similarity score * 0.8
 * 5. Low similarity (<50%) = 0
 */
export function fuzzyMatchScore(source: string, target: string): number {
   const s = normalize(source);
   const t = normalize(target);

   // Exact match
   if (s === t) return 100;

   // One contains the other
   if (contains(s, t)) {
      // Longer string contains shorter = higher score
      return Math.round(80 + (t.length / s.length) * 15);
   }
   if (contains(t, s)) {
      return Math.round(80 + (s.length / t.length) * 15);
   }

   // Similarity-based scoring
   const sim = similarity(s, t);

   if (sim >= 80) return sim;
   if (sim >= 50) return Math.round(sim * 0.8);

   return 0;
}

/**
 * Find best match from array of candidates
 * Returns the candidate with highest score and the score
 * 
 * @example
 * findBestMatch("מס'", ["מספר", "שם", "קבוצה"])
 * // { match: "מספר", score: 85 }
 */
export function findBestMatch(
   source: string,
   candidates: string[]
): { match: string | null; score: number } {
   let bestMatch: string | null = null;
   let bestScore = 0;

   for (const candidate of candidates) {
      const score = fuzzyMatchScore(source, candidate);
      if (score > bestScore) {
         bestScore = score;
         bestMatch = candidate;
      }
   }

   return { match: bestMatch, score: bestScore };
}

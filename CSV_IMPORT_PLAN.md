# Smart CSV Import System - Zero API Cost

## Overview

Client-side intelligent CSV import that handles messy formats, Hebrew/English content, and learns from user preferences - all without API costs.

## Architecture

### 1. SmartCSVParser (`src/utils/csvParser.ts`)

**Purpose:** Detect and parse CSV with various formats

- Auto-detect encoding (UTF-8, UTF-16, Hebrew)
- Find header row automatically
- Detect delimiter (comma, tab, semicolon)
- Skip empty rows and repeated headers
- Handle quoted fields with commas
- Trim whitespace

### 2. FuzzyColumnMapper (`src/services/csvMapper.ts`)

**Purpose:** Match CSV columns to app fields intelligently

- Keyword dictionary (Hebrew + English)
- Levenshtein distance for fuzzy matching
- Confidence scoring (0-100%)
- Learn from past mappings (IndexedDB)
- Handle name splitting (full name → first + last)

### 3. CSVImportWizard (`src/components/csv/CSVImportWizard.tsx`)

**Purpose:** User-friendly 4-step import flow

- Step 1: File upload & detection
- Step 2: Column mapping (auto-suggested + manual override)
- Step 3: Preview with validation warnings
- Step 4: Import progress & results

## Field Mappings

### Rider Fields

| App Field | Hebrew Keywords          | English Keywords                 |
| --------- | ------------------------ | -------------------------------- |
| bibNumber | מספר, מס', ביב, רוכב     | bib, number, rider, num          |
| firstName | שם, שם פרטי, פרטי        | first, name, given, fname        |
| lastName  | שם משפחה, משפחה, מש'     | last, surname, family, lname     |
| category  | קטגוריה, קט', גיל, שכבה  | category, cat, age, class, group |
| team      | קבוצה, קב', מועדון, צוות | team, club, squad, organization  |
| gender    | מגדר, מין, זכר/נקבה      | gender, sex, male/female, m/f    |

### Race Fields

| App Field | Hebrew Keywords  | English Keywords         |
| --------- | ---------------- | ------------------------ |
| heat      | חימום, מקצה, סבב | heat, wave, start, group |
| startTime | זמן התחלה, שעה   | start, time, clock       |
| totalLaps | סבבים, הקפות     | laps, rounds, total      |

## Smart Detection Rules

### 1. Find Header Row

```typescript
// Rules for identifying header row:
- Row with most unique values (likely column names)
- Contains keywords from mappings dictionary
- No numeric-only cells (headers are text)
- Usually in first 10 rows
```

### 2. Skip Repeated Headers

```typescript
// If row matches previous header pattern → skip
// Common in paginated exports
```

### 3. Handle Metadata Rows

```typescript
// Skip rows like:
- "Date: 13/06/2026"
- Empty rows
- Single-cell rows (titles)
```

### 4. Name Splitting

```typescript
// If only "שם מלא" / "Full Name" found:
- Split on space
- First word → firstName
- Rest → lastName
- Ask user to confirm
```

## Confidence Scoring

### Auto-map (85-100%)

- Exact keyword match: 100%
- Fuzzy match within 2 characters: 90%
- Partial keyword match: 85%

### Suggest (60-84%)

- Show suggestion with "Suggested" badge
- User can accept or change

### Manual (0-59%)

- Show dropdown, no suggestion
- User must select manually

## Learning System

### Store in IndexedDB

```typescript
interface ColumnMappingMemory {
  id: string;
  sourceColumn: string; // "מספר רוכב"
  targetField: string; // "bibNumber"
  confidence: number; // 95
  timesUsed: number; // 3
  lastUsed: Date;
}
```

### Learning Algorithm

1. When user confirms/changes mapping → save to memory
2. Next import: check if similar column name exists
3. Boost confidence by 10% for each previous use
4. Auto-select if confidence > 90%

## Validation Rules

### Pre-Import Validation

| Field     | Rule                             | Warning                     |
| --------- | -------------------------------- | --------------------------- |
| bibNumber | Required, numeric, unique        | "Duplicate bib: 123"        |
| firstName | Required, non-empty              | "Row 5: Missing name"       |
| category  | Should match existing categories | "New category: קדטים 15-16" |
| heat      | Numeric 1-99                     | "Invalid heat: ABC"         |
| startTime | Format HH:MM or HH:MM:SS         | "Invalid time: 25:00"       |

### Warning Types

- 🔴 **Error** (blocks import): Missing required field, duplicate bib
- 🟡 **Warning** (can proceed): New category, unusual value
- 🔵 **Info**: New team detected, auto-split name

## UI Flow

### Step 1: Upload

```
┌─────────────────────────────────┐
│  📁 Drag & Drop CSV File        │
│                                 │
│  or click to browse             │
│                                 │
│  Supports: UTF-8, Hebrew, RTL   │
└─────────────────────────────────┘
```

### Step 2: Map Columns

```
CSV Column          →  App Field        Confidence
─────────────────────────────────────────────────
מספר רוכב           →  bibNumber        [100%] ✓
שם מלא              →  firstName        [80%]  ?
                       (Split name?)
קטגוריה            →  category         [95%]  ✓
קבוצה              →  team             [100%] ✓
```

### Step 3: Preview

```
✓ 45 rows valid
⚠ 3 warnings
✗ 2 errors (fix to proceed)

Row | Bib | Name          | Category    | Team        | Status
────┼─────┼───────────────┼─────────────┼─────────────┼────────
1   | 123 | גלעד דולב     | קדטים 15-16 | רוכבי הקריות| ✓
2   | 124 | דוד כהן       | קדטים 15-16 |             | ⚠ No team
3   | 123 | אבי לוי       | נוער 17-18  | מכבי        | ✗ Duplicate bib
```

### Step 4: Import

```
Importing riders...  [████████░░] 80% (40/50)

✓ 40 riders imported
⚠ 3 warnings ignored
✗ 2 errors skipped

[View Imported Riders] [Import Another File]
```

## Technical Implementation

### Dependencies

```json
{
  "papaparse": "^5.4.1", // Robust CSV parsing
  "fuse.js": "^7.0.0" // Fuzzy search (optional, can use Levenshtein)
}
```

### File Structure

```
src/
├── utils/
│   ├── csvParser.ts           // Smart parsing
│   └── levenshtein.ts         // Fuzzy matching
├── services/
│   └── csvMapper.ts           // Column mapping + learning
├── components/
│   └── csv/
│       ├── CSVImportWizard.tsx
│       ├── ColumnMappingStep.tsx
│       ├── PreviewStep.tsx
│       ├── ImportProgressStep.tsx
│       └── csvImportWizard.module.css
└── types/
    └── csv.types.ts           // CSV import types
```

## Usage Example

```tsx
import { CSVImportWizard } from "@/components/csv/CSVImportWizard";

function RidersPage() {
  const handleImportComplete = (riders) => {
    console.log(`Imported ${riders.length} riders`);
    // Add to store/IndexedDB
  };

  return (
    <PermissionGate permission="rider.import">
      <CSVImportWizard
        entityType="riders"
        onComplete={handleImportComplete}
        onCancel={() => router.back()}
      />
    </PermissionGate>
  );
}
```

## Future Enhancements (Not Now)

1. **Photo/OCR Import**
   - Use mobile camera
   - OCR with Tesseract.js (client-side, free)
   - Extract table data from image

2. **Excel Support**
   - Parse .xlsx files
   - Handle multiple sheets

3. **Export Templates**
   - Download CSV template
   - Pre-filled example rows

4. **Bulk Edit After Import**
   - Fix issues in preview table
   - Inline editing

## Performance Targets

- Parse 1000 rows: < 500ms
- Fuzzy matching: < 100ms
- Import to IndexedDB: < 2s for 1000 rows
- Memory usage: < 50MB for 5000 rows

## Testing Scenarios

1. Perfect CSV (standard format)
2. Messy CSV (mixed empty rows, repeated headers)
3. Hebrew-only headers
4. English-only headers
5. Mixed Hebrew/English
6. Full name column (needs splitting)
7. Different delimiters (tab, semicolon)
8. Different encodings (UTF-8, UTF-16)
9. Very large file (5000+ rows)
10. Malformed data (missing quotes, extra commas)

---

**Estimated Implementation Time:** 3-4 hours
**Lines of Code:** ~1,500
**Zero API Costs:** ✓
**Offline Compatible:** ✓
**PWA Ready:** ✓

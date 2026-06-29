# Club Dictionary System

## Overview
Manages club name standardization. Maps multiple name variations (Hebrew + English) to a single standard club name.

## Two Files

### 1. dictionary_csv.json
**Purpose:** Field keywords for CSV column detection  
**Location:** `public/data/dictionary_csv.json`  
**Format:** Simple key-value object

```json
{
  "bib": ["bib", "number", "մի", "מספר"],
  "first_name": ["first name", "שם פרטי"],
  "club": ["club", "team", "מועדון", "קבוצה"]
}
```

**How it's used:**
- Auto-detect CSV column headers
- Match variations in different languages
- Used in `csvMapper.ts` getColumnSuggestions()

**To add field keywords:**
1. Edit `public/data/dictionary_csv.json`
2. Add new keywords to existing fields or new fields
3. Hard refresh browser to reload

---

### 2. dictionary_clubs.json
**Purpose:** Club name standardization  
**Location:** `public/data/dictionary_clubs.json`  
**Format:** Array of club mappings

```json
{
  "clubs": [
    {
      "id": "club-001",
      "standardName": "Blue Club",
      "terms": ["מועדון כחול", "כחול", "Blue Club", "Blue", "BC"]
    }
  ]
}
```

**How it's used:**
- During CSV import, "team" field values matched against all terms
- If match found, standardName is used instead
- Used in `rowToRider()` function via `clubDictionary.getState().getStandardName()`

**To add club:**
1. Edit `public/data/dictionary_clubs.json`
2. Add new club object with unique ID
3. Add all name variations to terms array
4. Hard refresh browser to reload

## Storage

### Persistent Storage
- Both dictionaries loaded on app startup (DictionaryInitializer.tsx)
- Loaded from JSON files into Zustand store
- Also stored in browser IndexedDB
- ClubDictionaryEntry type in `clubDictionaryStore.ts`

### In-App Manager
- UI component: `src/app/components/csv/ClubDictionaryManager.tsx`
- Accessed from ColumnMappingStep
- Changes stored in IndexedDB (not persisted to JSON file automatically)
- Export function available via browser console: `exportClubDictionaryToJSON()`

## Loader (dictionaryLoader.ts)

**loadClubDictionaryFromFile():**
- Fetches `dictionary_clubs.json`
- Converts terms array to store format
- Initializes Zustand store on app startup

**exportClubDictionaryToJSON():**
- Exports current store state back to JSON format
- Use for backup or database migration

## Future Plan

- Database instead of JSON files
- Admin UI for managing dictionaries
- Sync across users/devices
- History & version control

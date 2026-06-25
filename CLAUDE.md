# Commissaire - App Overview for Agents

**Last Updated:** 2026-06-25  
**Tech Stack:** Next.js (React), TypeScript, Zustand, CSV/Excel Import

## Quick Navigation

Agents: Read this file first, then drill into specific details as needed:

### Core Features
- **CSV Import Wizard** → See `./docs/csv-import.md`
- **Club Dictionary System** → See `./docs/club-dictionary.md`
- **Rider Management** → See `./docs/rider-data.md`
- **Race Management** → See `./docs/race-data.md`

### Key Files & Directories
```
src/
├── app/
│   ├── components/csv/          # CSV import components
│   ├── stores/                  # Zustand state (riders, races, categories)
│   ├── types/                   # TypeScript definitions
│   └── services/                # Business logic (csvMapper, etc)
├── utils/                       # Utilities (dictionaryLoader, etc)
└── types/                       # Global types

public/data/
├── dictionary_csv.json          # Field keywords (bib, first_name, club, etc)
├── dictionary_clubs.json        # Club name mappings
└── README.md                    # Data file guide
```

## Current Work Status

### Recently Completed
✅ CSV import wizard (4-step: upload → mapping → preview → import)  
✅ Club dictionary system with multi-term support  
✅ Middle name field added to rider model  
✅ Template system for saving column mappings  
✅ Collapsible template list in upload step  
✅ Close button + scroll handling in preview step  

### Dictionary System (NEW)
- **dictionary_csv.json**: Field keywords for auto-detecting CSV columns
  - Keys: bib, first_name, middle_name, last_name, club, category, heat, etc.
  - Values: Array of keyword variations (Hebrew + English)
  
- **dictionary_clubs.json**: Club name standardization
  - Maps multiple name variations to single standard name
  - Format: `{ "id", "standardName", "terms": [...] }`

### Known Issues
- None currently tracked

## How to Work with This App

### For CSV Import Features
1. Read `./docs/csv-import.md` for component flow
2. Check `src/app/types/csv.types.ts` for type definitions
3. Modify `public/data/dictionary_*.json` for keywords/clubs

### For Rider/Race Data
1. Read `./docs/rider-data.md` for rider structure
2. Check Zustand stores in `src/app/stores/`
3. Rider types: `src/app/types/types.ts` (RiderProps interface)

### For UI Changes
- CSS modules: `src/app/components/[feature]/[feature].module.css`
- Use existing component patterns for consistency

## Agent Task Guidelines

**Token Efficiency Rules:**
1. Always ask user clarifying questions before reading files
2. Read `CLAUDE.md` first (this file)
3. Only read specific docs when task requires it
4. Don't read entire large files - use line numbers/offset
5. For codebase exploration, use Grep or Explore agent

**Common Tasks:**
- **Add new field**: Modify types → update rowToRider → update display components
- **Fix CSV import bug**: Check types → check components → check services/csvMapper
- **Add dictionary entry**: Edit JSON files in `public/data/`
- **Update UI**: Modify component + module.css file

## Important Notes

### Directory Structure Philosophy
- One file per feature/concept
- Docs files reference specific code locations (file:line)
- Agents drill down as needed, not all at once

### Git Branch
- Current: `ver1`
- Main: `ver1`

### Important Constraints
- CSV import only: bib, first_name, middle_name, last_name, full_name, club, category, gender, heat, start_time, total_laps, position, points, federation, race_day
- Club dictionary: manual JSON editing or in-app UI manager
- No database yet (planned)
- Hebrew & English support required

## When You Need More Details

| Need | File |
|------|------|
| CSV import component flow | `docs/csv-import.md` |
| Club dictionary guide | `docs/club-dictionary.md` |
| Rider data structure | `docs/rider-data.md` |
| Race management | `docs/race-data.md` |
| All field types | `src/app/types/csv.types.ts` - RiderFieldKey type |
| Zustand stores | `src/app/stores/` directory |

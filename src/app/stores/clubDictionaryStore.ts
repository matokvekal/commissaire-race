import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface ClubDictionaryEntry {
  id: string;
  hebrewName: string;      // Original Hebrew club name from CSV
  standardName: string;    // Standardized club name
  alternateNames: string[];// Other variations to match
  createdAt: number;
  usedCount: number;
}

interface ClubDictionaryState {
  entries: ClubDictionaryEntry[];
  addEntry: (hebrewName: string, standardName: string, alternates?: string[]) => void;
  removeEntry: (id: string) => void;
  updateEntry: (id: string, updates: Partial<ClubDictionaryEntry>) => void;
  getStandardName: (hebrewName: string) => string | null;
  getAllEntries: () => ClubDictionaryEntry[];
  incrementUsageCount: (id: string) => void;
}

const useClubDictionaryStore = create<ClubDictionaryState>()(
  persist(
    (set, get) => ({
      entries: [],

      addEntry: (hebrewName: string, standardName: string, alternates = []) => {
        const newEntry: ClubDictionaryEntry = {
          id: crypto.randomUUID(),
          hebrewName: hebrewName.trim(),
          standardName: standardName.trim(),
          alternateNames: alternates.map(a => a.trim()),
          createdAt: Date.now(),
          usedCount: 0
        };
        set((state) => ({
          entries: [...state.entries, newEntry]
        }));
      },

      removeEntry: (id: string) => {
        set((state) => ({
          entries: state.entries.filter(e => e.id !== id)
        }));
      },

      updateEntry: (id: string, updates: Partial<ClubDictionaryEntry>) => {
        set((state) => ({
          entries: state.entries.map(e =>
            e.id === id ? { ...e, ...updates } : e
          )
        }));
      },

      getStandardName: (hebrewName: string) => {
        const normalized = hebrewName.trim().toLowerCase();
        const entry = get().entries.find(e =>
          e.hebrewName.toLowerCase() === normalized ||
          e.alternateNames.some(alt => alt.toLowerCase() === normalized)
        );
        return entry?.standardName ?? null;
      },

      getAllEntries: () => get().entries,

      incrementUsageCount: (id: string) => {
        set((state) => ({
          entries: state.entries.map(e =>
            e.id === id ? { ...e, usedCount: e.usedCount + 1 } : e
          )
        }));
      }
    }),
    {
      name: 'club-dictionary-store'
    }
  )
);

export default useClubDictionaryStore;

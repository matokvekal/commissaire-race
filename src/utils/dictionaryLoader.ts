import useClubDictionaryStore from '@/stores/clubDictionaryStore';

interface ClubEntry {
  id: string;
  standardName: string;
  terms: string[];
}

interface ClubDictionaryFile {
  clubs: ClubEntry[];
}

/**
 * Load club dictionary from JSON file (public/data/dictionary_clubs.json)
 * This is a temporary solution. Later, data will come from database.
 */
export async function loadClubDictionaryFromFile() {
  try {
    const response = await fetch('/data/dictionary_clubs.json');
    if (!response.ok) {
      console.warn('Club dictionary file not found or cannot be loaded');
      return;
    }

    const data: ClubDictionaryFile = await response.json();
    const store = useClubDictionaryStore.getState();

    // Load entries into store
    for (const club of data.clubs) {
      const existingEntry = store.getAllEntries().find(e => e.id === club.id);
      if (!existingEntry && club.terms.length > 0) {
        // Use first term as primary, rest as alternates
        const primaryName = club.terms[0];
        const alternates = club.terms.slice(1);

        store.addEntry(primaryName, club.standardName, alternates);
      }
    }

    console.log(`Loaded ${data.clubs.length} club dictionary entries from file`);
  } catch (error) {
    console.error('Failed to load club dictionary from file:', error);
  }
}

/**
 * Export current store state to JSON format (for backup or database migration)
 */
export function exportClubDictionaryToJSON() {
  const store = useClubDictionaryStore.getState();
  const entries = store.getAllEntries();

  const data: ClubDictionaryFile = {
    clubs: entries.map(entry => ({
      id: entry.id,
      standardName: entry.standardName,
      terms: [entry.hebrewName, ...entry.alternateNames]
    }))
  };

  return JSON.stringify(data, null, 2);
}

"use client";

import { useEffect } from "react";
import { loadClubDictionaryFromFile } from "@/utils/dictionaryLoader";

/**
 * Initialize club dictionary from JSON file on app startup
 * This component should be placed in the root layout
 */
export default function DictionaryInitializer() {
  useEffect(() => {
    loadClubDictionaryFromFile();
  }, []);

  return null;
}

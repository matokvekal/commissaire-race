"use client";

import { useState, useRef, useEffect } from "react";
import useClubDictionaryStore from "@/stores/clubDictionaryStore";
import styles from "./clubDictionaryManager.module.css";

interface ClubDictionaryManagerProps {
  onClose: () => void;
  onSelect?: (standardName: string) => void;
  targetHebrewName?: string;
}

export default function ClubDictionaryManager({
  onClose,
  onSelect,
  targetHebrewName = ""
}: ClubDictionaryManagerProps) {
  const entries = useClubDictionaryStore((state) => state.getAllEntries());
  const addEntry = useClubDictionaryStore((state) => state.addEntry);
  const removeEntry = useClubDictionaryStore((state) => state.removeEntry);
  const updateEntry = useClubDictionaryStore((state) => state.updateEntry);

  const [showForm, setShowForm] = useState(!!targetHebrewName);
  const [hebrewName, setHebrewName] = useState(targetHebrewName);
  const [standardName, setStandardName] = useState("");
  const [alternates, setAlternates] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (showForm && inputRef.current && !editingId) {
      inputRef.current.focus();
    }
  }, [showForm, editingId]);

  const handleSubmit = () => {
    if (!hebrewName.trim() || !standardName.trim()) {
      alert("Please fill in both Hebrew name and Standard name");
      return;
    }

    const alternatesList = alternates
      .split(",")
      .map((a) => a.trim())
      .filter((a) => a.length > 0);

    if (editingId) {
      updateEntry(editingId, {
        hebrewName: hebrewName.trim(),
        standardName: standardName.trim(),
        alternateNames: alternatesList
      });
      setEditingId(null);
    } else {
      addEntry(hebrewName.trim(), standardName.trim(), alternatesList);
    }

    setHebrewName("");
    setStandardName("");
    setAlternates("");
    setShowForm(false);

    if (onSelect) {
      onSelect(standardName.trim());
    }
  };

  const handleEdit = (id: string) => {
    const entry = entries.find((e) => e.id === id);
    if (entry) {
      setEditingId(id);
      setHebrewName(entry.hebrewName);
      setStandardName(entry.standardName);
      setAlternates(entry.alternateNames.join(", "));
      setShowForm(true);
    }
  };

  const handleCancel = () => {
    setHebrewName("");
    setStandardName("");
    setAlternates("");
    setEditingId(null);
    setShowForm(false);
  };

  const filteredEntries = entries.filter((entry) => {
    const query = searchQuery.toLowerCase();
    return (
      entry.hebrewName.toLowerCase().includes(query) ||
      entry.standardName.toLowerCase().includes(query) ||
      entry.alternateNames.some((alt) => alt.toLowerCase().includes(query))
    );
  });

  return (
    <div className={styles.modal}>
      <div className={styles.overlay} onClick={onClose} />
      <div className={styles.container}>
        <div className={styles.header}>
          <h3>Club Dictionary Manager</h3>
          <button className={styles.closeBtn} onClick={onClose}>
            ✕
          </button>
        </div>

        {/* Search bar */}
        {entries.length > 0 && (
          <div className={styles.searchBar}>
            <input
              type="text"
              placeholder="Search entries..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={styles.searchInput}
            />
          </div>
        )}

        {/* Entries list */}
        <div className={styles.entriesContainer}>
          {filteredEntries.length === 0 && !showForm && (
            <div className={styles.emptyState}>
              <p>No dictionary entries yet</p>
              <p className={styles.hint}>Add one to get started</p>
            </div>
          )}

          {filteredEntries.map((entry) => (
            <div key={entry.id} className={styles.entryCard}>
              <div className={styles.entryContent}>
                <div className={styles.entryMain} dir="auto">
                  <div className={styles.hebrewName}>{entry.hebrewName}</div>
                  <div className={styles.arrow}>→</div>
                  <div className={styles.standardName}>{entry.standardName}</div>
                </div>
                {entry.alternateNames.length > 0 && (
                  <div className={styles.alternates} dir="auto">
                    Aliases: {entry.alternateNames.join(", ")}
                  </div>
                )}
                <div className={styles.meta}>
                  Used {entry.usedCount} time{entry.usedCount !== 1 ? "s" : ""}
                </div>
              </div>
              <div className={styles.entryActions}>
                <button
                  className={styles.editBtn}
                  onClick={() => handleEdit(entry.id)}
                  title="Edit entry"
                >
                  ✎
                </button>
                <button
                  className={styles.deleteBtn}
                  onClick={() => removeEntry(entry.id)}
                  title="Delete entry"
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Add/Edit form */}
        {showForm && (
          <div className={styles.formSection}>
            <h4>{editingId ? "Edit Entry" : "Add New Dictionary Entry"}</h4>
            <div className={styles.form}>
              <div className={styles.formGroup}>
                <label>Hebrew Club Name</label>
                <input
                  ref={inputRef}
                  type="text"
                  value={hebrewName}
                  onChange={(e) => setHebrewName(e.target.value)}
                  placeholder="e.g., שם אגודה"
                  dir="auto"
                  className={styles.formInput}
                />
              </div>

              <div className={styles.formGroup}>
                <label>Standard Club Name</label>
                <input
                  type="text"
                  value={standardName}
                  onChange={(e) => setStandardName(e.target.value)}
                  placeholder="e.g., Club Name"
                  className={styles.formInput}
                />
              </div>

              <div className={styles.formGroup}>
                <label>Alternative Names (comma-separated)</label>
                <input
                  type="text"
                  value={alternates}
                  onChange={(e) => setAlternates(e.target.value)}
                  placeholder="e.g., Alternative 1, Alternative 2"
                  dir="auto"
                  className={styles.formInput}
                />
              </div>

              <div className={styles.formActions}>
                <button
                  className={styles.submitBtn}
                  onClick={handleSubmit}
                  disabled={!hebrewName.trim() || !standardName.trim()}
                >
                  {editingId ? "Update" : "Add"} Entry
                </button>
                <button
                  className={styles.cancelBtn}
                  onClick={handleCancel}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Add button if form is not shown */}
        {!showForm && (
          <div className={styles.footer}>
            <button
              className={styles.addBtn}
              onClick={() => {
                setHebrewName(targetHebrewName);
                setShowForm(true);
              }}
            >
              + Add New Entry
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

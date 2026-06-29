"use client";

import { useState } from "react";
import type { RiderProps } from "@/types/types";
import {
  downloadCSV,
  getAvailableFields,
  type ExportOptions,
  type ExportField
} from "@/utils/csvExporter";
import styles from "./exportCSVButton.module.css";

interface ExportCSVButtonProps {
  riders: RiderProps[];
  filename?: string;
  label?: string;
  className?: string;
}

export default function ExportCSVButton({
  riders,
  filename,
  label = "Export CSV",
  className = ""
}: ExportCSVButtonProps) {
  const [showOptions, setShowOptions] = useState(false);
  const [language, setLanguage] = useState<"he" | "en">("he");
  const [selectedFields, setSelectedFields] = useState<Set<string>>(new Set());

  const handleQuickExport = () => {
    if (riders.length === 0) {
      alert("No riders to export");
      return;
    }
    const timestamp = new Date().toISOString().split("T")[0];
    downloadCSV(riders, filename || `riders_${timestamp}.csv`, { language });
  };

  const handleCustomExport = () => {
    setShowOptions(true);
    if (selectedFields.size === 0) {
      const available = getAvailableFields(riders, language);
      setSelectedFields(new Set(available.map((f) => f.key)));
    }
  };

  const toggleField = (fieldKey: string) => {
    const next = new Set(selectedFields);
    if (next.has(fieldKey)) next.delete(fieldKey);
    else next.add(fieldKey);
    setSelectedFields(next);
  };

  const handleConfirmExport = () => {
    const available = getAvailableFields(riders, language);
    const fields = available.filter((f) => selectedFields.has(f.key));
    if (fields.length === 0) {
      alert("Please select at least one field");
      return;
    }
    const timestamp = new Date().toISOString().split("T")[0];
    downloadCSV(riders, filename || `riders_${timestamp}.csv`, { language, fields });
    setShowOptions(false);
  };

  if (showOptions) {
    const available = getAvailableFields(riders, language);
    return (
      <div className={styles.exportModal}>
        <div className={styles.modalOverlay} onClick={() => setShowOptions(false)} />
        <div className={styles.modalContent}>
          <h3>Export Options</h3>
          <div className={styles.option}>
            <label>Language:</label>
            <div className={styles.radioGroup}>
              <label>
                <input type="radio" checked={language === "he"} onChange={() => setLanguage("he")} />
                Hebrew
              </label>
              <label>
                <input type="radio" checked={language === "en"} onChange={() => setLanguage("en")} />
                English
              </label>
            </div>
          </div>
          <div className={styles.option}>
            <label>Fields to export:</label>
            <div className={styles.fieldsList}>
              {available.map((field) => (
                <label key={field.key} className={styles.fieldItem}>
                  <input
                    type="checkbox"
                    checked={selectedFields.has(field.key)}
                    onChange={() => toggleField(field.key)}
                  />
                  {field.label}
                </label>
              ))}
            </div>
          </div>
          <div className={styles.modalActions}>
            <button onClick={() => setShowOptions(false)} className={styles.cancelButton}>Cancel</button>
            <button onClick={handleConfirmExport} className={styles.exportButton}>
              Export {riders.length} Riders
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`${styles.exportButtonGroup} ${className}`}>
      <button onClick={handleQuickExport} className={styles.quickExport}>{label}</button>
      <button onClick={handleCustomExport} className={styles.optionsButton} title="Export with options">⚙️</button>
    </div>
  );
}

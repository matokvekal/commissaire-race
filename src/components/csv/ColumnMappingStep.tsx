"use client";

import { useState, useEffect } from "react";
import type { ColumnMapping, RiderFieldKey } from "@/types/csv.types";
import { FIELD_KEYWORDS } from "@/types/csv.types";
import {
  getColumnSuggestions,
  confirmMapping,
  detectNameSplitting
} from "@/services/csvMapper";
import styles from "./columnMappingStep.module.css";

interface ColumnMappingStepProps {
  headers: string[];
  mappings: ColumnMapping[];
  sampleRows: string[][];
  onConfirm: (mappings: ColumnMapping[]) => void;
  onBack: () => void;
}

export default function ColumnMappingStep({
  headers,
  mappings: initialMappings,
  sampleRows,
  onConfirm,
  onBack
}: ColumnMappingStepProps) {
  const [mappings, setMappings] = useState<ColumnMapping[]>(initialMappings);
  const [splitFullName, setSplitFullName] = useState(false);

  useEffect(() => {
    // Check if we should suggest name splitting
    const { shouldSplit } = detectNameSplitting(mappings);
    setSplitFullName(shouldSplit);
  }, [mappings]);

  const handleFieldChange = async (
    index: number,
    newField: RiderFieldKey | null
  ) => {
    const updated = [...mappings];
    const oldField = updated[index].targetField;

    updated[index] = {
      ...updated[index],
      targetField: newField,
      confidence: newField ? 100 : 0, // User confirmed = 100%
      isAutoMapped: false,
      needsConfirmation: false
    };

    setMappings(updated);

    // Save to learning system
    if (newField) {
      await confirmMapping(updated[index].sourceColumn, newField);
    }
  };

  const handleConfirm = () => {
    // Validate: at least bibNumber should be mapped
    const hasBibNumber = mappings.some((m) => m.targetField === "bibNumber");

    if (!hasBibNumber) {
      alert("Please map at least the Bib Number field to continue.");
      return;
    }

    onConfirm(mappings);
  };

  const getFieldLabel = (field: RiderFieldKey): string => {
    const keywords = FIELD_KEYWORDS.find((f) => f.field === field);
    return keywords?.english[0] || field;
  };

  const getConfidenceBadge = (confidence: number) => {
    if (confidence >= 85) {
      return (
        <span className={`${styles.badge} ${styles.badgeHigh}`}>
          High {confidence}%
        </span>
      );
    } else if (confidence >= 60) {
      return (
        <span className={`${styles.badge} ${styles.badgeMedium}`}>
          Medium {confidence}%
        </span>
      );
    } else {
      return (
        <span className={`${styles.badge} ${styles.badgeLow}`}>Manual</span>
      );
    }
  };

  const usedFields = new Set(
    mappings
      .filter((m) => m.targetField !== null)
      .map((m) => m.targetField as RiderFieldKey)
  );

  const availableFields: (RiderFieldKey | null)[] = [
    null,
    ...FIELD_KEYWORDS.map((f) => f.field).filter(
      (f) => !usedFields.has(f) || mappings.find((m) => m.targetField === f)
    )
  ];

  const mappedCount = mappings.filter((m) => m.targetField !== null).length;
  const needsConfirmationCount = mappings.filter(
    (m) => m.needsConfirmation
  ).length;

  return (
    <div className={styles.mappingStep}>
      <div className={styles.header}>
        <h3>Map CSV Columns to Fields</h3>
        <div className={styles.stats}>
          <span className={styles.stat}>
            <strong>{mappedCount}</strong> of <strong>{mappings.length}</strong>{" "}
            columns mapped
          </span>
          {needsConfirmationCount > 0 && (
            <span className={styles.stat}>
              <strong>{needsConfirmationCount}</strong> need confirmation
            </span>
          )}
        </div>
      </div>

      {splitFullName && (
        <div className={styles.nameSplitWarning}>
          <strong>ℹ️ Name Splitting:</strong> Full Name field detected. Names
          will be automatically split into First Name and Last Name.
        </div>
      )}

      <div className={styles.mappingTable}>
        <div className={styles.tableHeader}>
          <div className={styles.colCSV}>CSV Column</div>
          <div className={styles.colSample}>Sample Data</div>
          <div className={styles.colArrow}></div>
          <div className={styles.colField}>App Field</div>
          <div className={styles.colConfidence}>Confidence</div>
        </div>

        {mappings.map((mapping, index) => (
          <div key={index} className={styles.mappingRow}>
            <div className={styles.colCSV}>
              <strong>{mapping.sourceColumn}</strong>
            </div>

            <div className={styles.colSample}>
              <div className={styles.sampleData}>
                {sampleRows.map((row, i) => (
                  <div key={i} className={styles.sampleItem}>
                    {row[index] || "-"}
                  </div>
                ))}
              </div>
            </div>

            <div className={styles.colArrow}>→</div>

            <div className={styles.colField}>
              <select
                value={mapping.targetField || ""}
                onChange={(e) =>
                  handleFieldChange(
                    index,
                    (e.target.value as RiderFieldKey) || null
                  )
                }
                className={styles.fieldSelect}
              >
                {availableFields.map((field) => (
                  <option key={field || "none"} value={field || ""}>
                    {field ? getFieldLabel(field) : "(Skip this column)"}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.colConfidence}>
              {getConfidenceBadge(mapping.confidence)}
            </div>
          </div>
        ))}
      </div>

      <div className={styles.actions}>
        <button onClick={onBack} className={styles.backButton}>
          ← Back
        </button>
        <button
          onClick={handleConfirm}
          className={styles.confirmButton}
          disabled={mappedCount === 0}
        >
          Continue to Preview →
        </button>
      </div>
    </div>
  );
}

"use client";

import styles from "./multiDayDialog.module.css";

interface MultiDayDialogProps {
  raceName: string;
  dayValues: string[];
  rowCounts: Record<string, number>;
  onSplit: () => void;
  onImportAll: () => void;
  onCancel: () => void;
}

export default function MultiDayDialog({
  raceName,
  dayValues,
  rowCounts,
  onSplit,
  onImportAll,
  onCancel
}: MultiDayDialogProps) {
  return (
    <div className={styles.overlay}>
      <div className={styles.dialog}>
        <div className={styles.iconRow}>
          <span className={styles.icon}>📅</span>
          <h3>Multi-Day Race Detected</h3>
        </div>

        <p className={styles.intro}>
          This file contains riders from <strong>{dayValues.length} different days</strong>.
          Mixing them in one race will cause schedule and result conflicts.
        </p>

        <div className={styles.dayList}>
          {dayValues.map((day, i) => (
            <div key={day} className={styles.dayRow}>
              <span className={styles.dayNum}>Day {i + 1}</span>
              <span className={styles.dayName}>{day}</span>
              <span className={styles.dayCount}>{rowCounts[day] ?? 0} riders</span>
            </div>
          ))}
        </div>

        <div className={styles.splitPreview}>
          <div className={styles.splitLabel}>Will create / rename:</div>
          {dayValues.map((day, i) => (
            <div key={day} className={styles.raceRow}>
              <span className={styles.raceName}>{raceName} — {day}</span>
              <span className={i === 0 ? styles.tagCurrent : styles.tagNew}>
                {i === 0 ? "current race" : "new race"}
              </span>
            </div>
          ))}
        </div>

        <div className={styles.actions}>
          <button className={styles.splitBtn} onClick={onSplit}>
            Create Separate Races
          </button>
          <button className={styles.allBtn} onClick={onImportAll}>
            Import All to One Race
          </button>
          <button className={styles.cancelBtn} onClick={onCancel}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

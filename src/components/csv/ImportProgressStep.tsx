"use client";

import type { ImportProgress } from "@/types/csv.types";
import styles from "./importProgressStep.module.css";

interface ImportProgressStepProps {
  progress: ImportProgress;
  onClose: () => void;
}

export default function ImportProgressStep({
  progress,
  onClose
}: ImportProgressStepProps) {
  const percentage =
    progress.total > 0
      ? Math.round((progress.processed / progress.total) * 100)
      : 0;

  const isComplete = progress.status === "completed";
  const hasErrors = progress.failed > 0;

  return (
    <div className={styles.progressStep}>
      {!isComplete ? (
        <>
          <div className={styles.header}>
            <h3>Importing Riders...</h3>
            <p>Please wait while we import the riders from your CSV file.</p>
          </div>

          <div className={styles.progressContainer}>
            <div className={styles.progressBar}>
              <div
                className={styles.progressFill}
                style={{ width: `${percentage}%` }}
              />
            </div>
            <div className={styles.progressText}>
              {progress.processed} / {progress.total} ({percentage}%)
            </div>
          </div>

          <div className={styles.stats}>
            <div className={styles.stat}>
              <span className={styles.statLabel}>Processed:</span>
              <span className={styles.statValue}>{progress.processed}</span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statLabel}>Successful:</span>
              <span className={`${styles.statValue} ${styles.success}`}>
                {progress.successful}
              </span>
            </div>
            {progress.failed > 0 && (
              <div className={styles.stat}>
                <span className={styles.statLabel}>Failed:</span>
                <span className={`${styles.statValue} ${styles.error}`}>
                  {progress.failed}
                </span>
              </div>
            )}
          </div>
        </>
      ) : (
        <>
          <div className={styles.completedHeader}>
            <div className={styles.successIcon}>{hasErrors ? "⚠️" : "✅"}</div>
            <h3>
              {hasErrors
                ? "Import Completed with Errors"
                : "Import Completed Successfully!"}
            </h3>
          </div>

          <div className={styles.completedStats}>
            <div className={styles.completedStat}>
              <span className={styles.completedLabel}>Total Processed:</span>
              <span className={styles.completedValue}>
                {progress.processed}
              </span>
            </div>
            <div className={styles.completedStat}>
              <span className={styles.completedLabel}>
                Successfully Imported:
              </span>
              <span className={`${styles.completedValue} ${styles.success}`}>
                {progress.successful}
              </span>
            </div>
            {hasErrors && (
              <div className={styles.completedStat}>
                <span className={styles.completedLabel}>Failed:</span>
                <span className={`${styles.completedValue} ${styles.error}`}>
                  {progress.failed}
                </span>
              </div>
            )}
          </div>

          {hasErrors && (
            <div className={styles.errorMessage}>
              <p>
                Some riders could not be imported due to validation errors.
                Please check the error log for details.
              </p>
            </div>
          )}

          <div className={styles.completedActions}>
            <button onClick={onClose} className={styles.closeButton}>
              Close
            </button>
          </div>
        </>
      )}
    </div>
  );
}

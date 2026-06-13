"use client";

import { useState } from "react";
import type {
  CSVParseResult,
  ColumnMapping,
  ValidationResult,
  ImportProgress
} from "@/types/csv.types";
import { parseCSVFile } from "@/utils/csvParser";
import { autoMapColumns } from "@/services/csvMapper";
import UploadStep from "./UploadStep";
import ColumnMappingStep from "./ColumnMappingStep";
import PreviewStep from "./PreviewStep";
import ImportProgressStep from "./ImportProgressStep";
import styles from "./csvImportWizard.module.css";

type WizardStep = "upload" | "mapping" | "preview" | "importing";

export default function CSVImportWizard() {
  const [currentStep, setCurrentStep] = useState<WizardStep>("upload");
  const [parseResult, setParseResult] = useState<CSVParseResult | null>(null);
  const [columnMappings, setColumnMappings] = useState<ColumnMapping[]>([]);
  const [validationResult, setValidationResult] =
    useState<ValidationResult | null>(null);
  const [importProgress, setImportProgress] = useState<ImportProgress | null>(
    null
  );

  // Step 1: Handle file upload and parsing
  const handleFileUpload = async (file: File) => {
    try {
      const result = await parseCSVFile(file);
      setParseResult(result);

      // Auto-map columns
      const mappings = await autoMapColumns(result.headers);
      setColumnMappings(mappings);

      setCurrentStep("mapping");
    } catch (error) {
      console.error("Failed to parse CSV:", error);
      alert("Failed to parse CSV file. Please check the file format.");
    }
  };

  // Step 2: Handle column mapping confirmation
  const handleMappingConfirm = (mappings: ColumnMapping[]) => {
    setColumnMappings(mappings);
    setCurrentStep("preview");
  };

  // Step 3: Handle preview validation and import start
  const handleStartImport = async (validation: ValidationResult) => {
    setValidationResult(validation);
    setCurrentStep("importing");

    // Simulate import process
    const total = parseResult?.rows.length || 0;
    setImportProgress({
      total,
      processed: 0,
      successful: 0,
      failed: 0,
      status: "importing"
    });

    // Import riders (will integrate with actual rider store later)
    for (let i = 0; i < total; i++) {
      // Simulate processing delay
      await new Promise((resolve) => setTimeout(resolve, 50));

      setImportProgress((prev) =>
        prev
          ? {
              ...prev,
              processed: i + 1,
              successful: i + 1, // Simplified - actual will have error handling
              status: i + 1 === total ? "completed" : "importing"
            }
          : null
      );
    }
  };

  // Navigation
  const handleBack = () => {
    const stepOrder: WizardStep[] = [
      "upload",
      "mapping",
      "preview",
      "importing"
    ];
    const currentIndex = stepOrder.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(stepOrder[currentIndex - 1]);
    }
  };

  const handleClose = () => {
    // Reset wizard
    setCurrentStep("upload");
    setParseResult(null);
    setColumnMappings([]);
    setValidationResult(null);
    setImportProgress(null);
  };

  return (
    <div className={styles.wizard}>
      <div className={styles.header}>
        <h2>Import Riders from CSV</h2>
        <button className={styles.closeButton} onClick={handleClose}>
          ✕
        </button>
      </div>

      {/* Progress indicator */}
      <div className={styles.progressBar}>
        <div
          className={`${styles.step} ${currentStep === "upload" ? styles.active : currentStep !== "upload" ? styles.completed : ""}`}
        >
          <span className={styles.stepNumber}>1</span>
          <span className={styles.stepLabel}>Upload</span>
        </div>
        <div
          className={`${styles.step} ${currentStep === "mapping" ? styles.active : ["preview", "importing"].includes(currentStep) ? styles.completed : ""}`}
        >
          <span className={styles.stepNumber}>2</span>
          <span className={styles.stepLabel}>Mapping</span>
        </div>
        <div
          className={`${styles.step} ${currentStep === "preview" ? styles.active : currentStep === "importing" ? styles.completed : ""}`}
        >
          <span className={styles.stepNumber}>3</span>
          <span className={styles.stepLabel}>Preview</span>
        </div>
        <div
          className={`${styles.step} ${currentStep === "importing" ? styles.active : ""}`}
        >
          <span className={styles.stepNumber}>4</span>
          <span className={styles.stepLabel}>Import</span>
        </div>
      </div>

      {/* Step content */}
      <div className={styles.content}>
        {currentStep === "upload" && (
          <UploadStep onFileUpload={handleFileUpload} />
        )}

        {currentStep === "mapping" && parseResult && (
          <ColumnMappingStep
            headers={parseResult.headers}
            mappings={columnMappings}
            sampleRows={parseResult.rows.slice(0, 3)}
            onConfirm={handleMappingConfirm}
            onBack={handleBack}
          />
        )}

        {currentStep === "preview" && parseResult && (
          <PreviewStep
            parseResult={parseResult}
            mappings={columnMappings}
            onStartImport={handleStartImport}
            onBack={handleBack}
          />
        )}

        {currentStep === "importing" && importProgress && (
          <ImportProgressStep progress={importProgress} onClose={handleClose} />
        )}
      </div>
    </div>
  );
}

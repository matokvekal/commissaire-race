"use client";

import { useState, useRef, DragEvent } from "react";
import styles from "./uploadStep.module.css";

interface UploadStepProps {
  onFileUpload: (file: File) => void;
}

export default function UploadStep({ onFileUpload }: UploadStepProps) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragEnter = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      if (file.name.endsWith(".csv")) {
        onFileUpload(file);
      } else {
        alert("Please upload a CSV file");
      }
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      onFileUpload(files[0]);
    }
  };

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={styles.uploadStep}>
      <div className={styles.instructions}>
        <h3>Upload CSV File</h3>
        <p>
          Upload a CSV file containing rider information. The file can have
          columns in any order, in Hebrew or English.
        </p>

        <div className={styles.supportedFields}>
          <h4>Supported Fields:</h4>
          <ul>
            <li>
              <strong>Bib Number</strong> - מס׳ רוכב / Bib / Number
            </li>
            <li>
              <strong>First Name</strong> - שם פרטי / First Name
            </li>
            <li>
              <strong>Last Name</strong> - שם משפחה / Last Name
            </li>
            <li>
              <strong>Full Name</strong> - שם מלא / Full Name (will be split
              automatically)
            </li>
            <li>
              <strong>Category</strong> - קטגוריה / Category
            </li>
            <li>
              <strong>Team</strong> - קבוצה / Team / Club
            </li>
            <li>
              <strong>Heat</strong> - מקצה / Heat
            </li>
            <li>
              <strong>Total Laps</strong> - סיבובים / Laps
            </li>
            <li>
              <strong>Start Time</strong> - שעת התחלה / Start Time
            </li>
            <li>
              <strong>Position</strong> - מיקום / Position
            </li>
          </ul>
        </div>

        <div className={styles.exampleNote}>
          <strong>Note:</strong> The system will automatically detect encoding,
          delimiter, and skip metadata rows.
        </div>
      </div>

      <div
        className={`${styles.dropZone} ${isDragging ? styles.dragging : ""}`}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={handleBrowseClick}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          onChange={handleFileSelect}
          className={styles.fileInput}
        />

        <div className={styles.dropZoneContent}>
          <svg
            className={styles.uploadIcon}
            width="64"
            height="64"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
            />
          </svg>

          {isDragging ? (
            <p className={styles.dropText}>Drop CSV file here</p>
          ) : (
            <>
              <p className={styles.dropText}>Drag & drop CSV file here</p>
              <p className={styles.orText}>or</p>
              <button type="button" className={styles.browseButton}>
                Browse Files
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

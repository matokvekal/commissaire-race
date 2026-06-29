"use client";

import { useState } from "react";
import styles from "./deleteConfirmModal.module.css";

interface DeleteConfirmModalProps {
  title: string;
  description: string;
  onConfirm: () => Promise<void> | void;
  onCancel: () => void;
}

export default function DeleteConfirmModal({
  title,
  description,
  onConfirm,
  onCancel
}: DeleteConfirmModalProps) {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const isValid = input.toUpperCase() === "DELETE";

  const handleConfirm = async () => {
    if (!isValid || loading) return;
    setLoading(true);
    try {
      await onConfirm();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.overlay} onClick={onCancel}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.icon}>⚠️</div>
        <h3 className={styles.title}>{title}</h3>
        <p className={styles.description}>{description}</p>

        <div className={styles.confirmGroup}>
          <label className={styles.label}>
            Type <strong>DELETE</strong> to confirm
          </label>
          <input
            className={styles.input}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") handleConfirm(); }}
            placeholder="DELETE"
            autoFocus
          />
        </div>

        <div className={styles.actions}>
          <button className={styles.cancelBtn} onClick={onCancel} disabled={loading}>
            Cancel
          </button>
          <button
            className={styles.confirmBtn}
            onClick={handleConfirm}
            disabled={!isValid || loading}
          >
            {loading ? "Deleting…" : "Confirm Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}

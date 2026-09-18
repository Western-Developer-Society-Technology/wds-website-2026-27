"use client";

import { useRef } from "react";
import styles from "./apply.module.css";

export default function ResumeUploadField({ value, onChange, attributes }) {
  const input = useRef(null);
  return (
    <div>
      <input
        {...attributes}
        ref={input}
        className={styles.fileInput}
        type="file"
        accept=".pdf,application/pdf"
        onChange={(event) => onChange(event.target.files[0] ?? null)}
      />
      {value && (
        <div className={styles.fileDetails}>
          <span>{value.name} · {(value.size / 1000).toLocaleString(undefined, { maximumFractionDigits: 3 })} KB</span>
          <button type="button" className={styles.textButton} onClick={() => {
            input.current.value = "";
            onChange(null);
            input.current.focus();
          }}>remove</button>
        </div>
      )}
    </div>
  );
}

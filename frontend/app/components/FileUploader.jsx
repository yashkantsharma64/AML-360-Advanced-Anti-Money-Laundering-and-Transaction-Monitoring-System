// app/components/FileUploader.jsx
"use client";
import React, { useRef, useState } from "react";

/**
 * FileUploader
 * props:
 *  - onFilePicked: (File) => void
 *  - accept (string) default ".csv"
 */
export default function FileUploader({ onFilePicked, accept = ".csv,text/csv" }) {
  const fileInputRef = useRef(null);
  const [dragActive, setDragActive] = useState(false);

  function onChange(e) {
    const file = e.target.files?.[0];
    if (file && onFilePicked) onFilePicked(file);
  }

  function onDrop(e) {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file && onFilePicked) onFilePicked(file);
  }

  return (
    <div
      onDrop={onDrop}
      onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
      onDragLeave={() => setDragActive(false)}
      className={`border-2 border-dashed rounded-2xl p-12 text-center transition-all ${dragActive ? "border-blue-400 bg-blue-500/10" : "border-slate-600 bg-slate-700/20"}`}
    >
      <div className="mx-auto mb-4">
        <svg className="w-12 h-12 text-slate-400" viewBox="0 0 24 24" fill="none"><path d="M12 3v14" stroke="currentColor" strokeWidth="1.5"></path></svg>
      </div>

      <p className="text-slate-300 font-semibold mb-2">Drag & drop your CSV file here</p>
      <p className="text-slate-500 text-sm mb-4">or click to browse</p>

      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={onChange}
        className="hidden"
      />
      <button
        onClick={() => fileInputRef.current?.click()}
        className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg"
      >
        Choose File
      </button>

      <p className="text-xs text-slate-500 mt-4">Expected columns: transaction_id, account_key, transaction_date, originator_name, beneficiary_name, transaction_amount, currency_code, payment_type</p>
    </div>
  );
}

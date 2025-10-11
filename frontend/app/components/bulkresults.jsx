// app/components/BulkResultList.jsx
"use client";
import React from "react";
import ResultCard from "./ResultCard";

export default function BulkResultList({ rows = [], predictions = [] }) {
  if (!rows || rows.length === 0) {
    return <div className="text-slate-400">No transactions to display</div>;
  }
  return (
    <div className="space-y-6">
      {rows.map((row, idx) => (
        <ResultCard key={idx} title={`Transaction #${idx + 1}`} data={row} preds={predictions[idx] || {}} />
      ))}
    </div>
  );
}

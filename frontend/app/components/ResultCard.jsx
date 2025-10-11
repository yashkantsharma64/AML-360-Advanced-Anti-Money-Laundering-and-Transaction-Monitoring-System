// app/components/ResultCard.jsx
"use client";
import React from "react";
import FieldBadge from "./FieldBadge";

export default function ResultCard({ title = "Transaction", data = {}, preds = {} }) {
  const keys = Object.keys(data);
  return (
    <article className="bg-slate-800/60 border border-slate-700 rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="text-sm text-slate-300 font-medium">{title}</div>
        <div className="text-xs text-slate-400">id: {data.transaction_id ?? data.id ?? "—"}</div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {keys.map((k) => <FieldBadge key={k} name={k} value={data[k]} pred={preds?.[k]} />)}
      </div>
    </article>
  );
}

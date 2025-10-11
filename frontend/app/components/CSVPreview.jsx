// app/components/CSVPreview.jsx
"use client";
import React from "react";

/**
 * CSVPreview
 * props:
 *  - headers: array
 *  - rows: array
 */
export default function CSVPreview({ headers = [], rows = [] }) {
  if (!rows || rows.length === 0) return null;

  return (
    <div className="mt-8">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold text-white">Preview: {rows.length} Transaction{rows.length !== 1 ? "s" : ""}</h3>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-600 bg-slate-900/50">
        <table className="w-full text-sm">
          <thead className="sticky top-0 bg-gradient-to-r from-slate-700 to-slate-800 border-b border-slate-600">
            <tr>
              <th className="px-4 py-3 text-left font-semibold text-slate-200 w-12">#</th>
              {headers.map((h) => (
                <th key={h} className="px-4 py-3 text-left font-semibold text-slate-200 whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i} className={`border-b border-slate-700 ${i % 2 === 0 ? "bg-slate-800/30" : "bg-slate-700/20"} hover:bg-slate-700/40`}>
                <td className="px-4 py-3 text-slate-400 font-medium">{i + 1}</td>
                {headers.map((k) => (
                  <td key={k} className="px-4 py-3 text-slate-300 max-w-xs">
                    <span className="block truncate" title={String(row[k] ?? "")}>
                      {String(row[k] ?? "")}
                    </span>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

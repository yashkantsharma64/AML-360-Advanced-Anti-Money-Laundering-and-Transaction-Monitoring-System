// app/components/Tabs.jsx
"use client";
import React from "react";

/**
 * Tabs
 * props:
 *  - active: "single" | "bulk"
 *  - onChange: (tab) => void
 */
export default function Tabs({ active = "single", onChange }) {
  return (
    <div className="flex gap-2 mb-6">
      <button
        onClick={() => onChange("single")}
        className={`px-6 py-3 rounded-lg font-medium transition-all ${
          active === "single" ? "bg-purple-600 text-white shadow-lg" : "bg-slate-700/50 text-slate-300 hover:bg-slate-700"
        }`}
      >
        Single Transaction
      </button>

      <button
        onClick={() => onChange("bulk")}
        className={`px-6 py-3 rounded-lg font-medium transition-all ${
          active === "bulk" ? "bg-blue-600 text-white shadow-lg" : "bg-slate-700/50 text-slate-300 hover:bg-slate-700"
        }`}
      >
        Bulk Upload (CSV)
      </button>
    </div>
  );
}

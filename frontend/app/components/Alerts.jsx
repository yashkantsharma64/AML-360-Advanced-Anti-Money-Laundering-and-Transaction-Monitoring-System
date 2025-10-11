// app/components/Alerts.jsx
"use client";
import React from "react";

/**
 * Alerts
 * props:
 *  - errors: string[]
 *  - successMsg: string
 */
export default function Alerts({ errors = [], successMsg = "" }) {
  return (
    <div className="space-y-4">
      {errors && errors.length > 0 && (
        <div className="bg-red-500/10 border border-red-500/50 rounded-xl p-4">
          <div className="flex gap-3">
            <div className="text-red-400 font-semibold">Validation Errors</div>
            <div className="text-red-300">
              <ul className="space-y-1">
                {errors.map((err, i) => <li key={i}>• {err}</li>)}
              </ul>
            </div>
          </div>
        </div>
      )}

      {successMsg && (
        <div className="bg-green-500/10 border border-green-500/50 rounded-xl p-4">
          <div className="flex gap-3">
            <div className="text-green-300 font-medium">{successMsg}</div>
          </div>
        </div>
      )}
    </div>
  );
}

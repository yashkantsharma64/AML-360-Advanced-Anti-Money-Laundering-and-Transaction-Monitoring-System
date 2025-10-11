// app/components/FieldBadge.jsx
"use client";
import React from "react";

export default function FieldBadge({ name, value, pred }) {
  const style =
    pred === 1
      ? { wrapper: "p-3 rounded-lg border border-red-300 bg-red-50", title: "text-red-700 font-semibold", valueClass: "text-red-900", badge: "bg-red-100 text-red-800 font-bold px-2 py-0.5 rounded" }
      : pred === 0
      ? { wrapper: "p-3 rounded-lg border border-green-300 bg-green-50", title: "text-green-700 font-semibold", valueClass: "text-green-900", badge: "bg-green-100 text-green-800 font-bold px-2 py-0.5 rounded" }
      : { wrapper: "p-3 rounded-lg border border-slate-300 bg-slate-50", title: "text-slate-700 font-semibold", valueClass: "text-slate-900", badge: "bg-slate-100 text-slate-800 px-2 py-0.5 rounded" };

  return (
    <div className={`${style.wrapper} flex justify-between items-start`}>
      <div className="max-w-[70%]">
        <div className={style.title}>{name}</div>
        <div className={`mt-1 ${style.valueClass} text-sm break-words`}>{value === null || value === undefined || value === "" ? "—" : String(value)}</div>
      </div>
      <div className="ml-4">
        <div className={style.badge}>{pred === 1 ? "1" : pred === 0 ? "0" : "—"}</div>
      </div>
    </div>
  );
}

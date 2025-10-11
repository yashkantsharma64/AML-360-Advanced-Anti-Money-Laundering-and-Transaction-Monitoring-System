// app/components/Header.jsx
"use client";
import React from "react";

export default function Header() {
  return (
    <div className="mb-8">
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 bg-gradient-to-br from-purple-500 to-blue-600 rounded-lg">
          <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none"><path d="M12 2v20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </div>
        <h1 className="text-4xl font-bold text-white">AML Fraud Detector</h1>
      </div>
      <p className="text-slate-400 ml-11">Detect suspicious transactions and money laundering patterns in real-time</p>
    </div>
  );
}

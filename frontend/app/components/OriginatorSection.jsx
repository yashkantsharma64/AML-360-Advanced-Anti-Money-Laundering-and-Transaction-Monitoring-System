
"use client";
import React from "react";


export default function OriginatorSection({ form, onChange, originOptions = [] }) {
  return (
    <div className="pt-4 border-t border-slate-700">
      <h3 className="text-lg font-semibold text-slate-200 mb-4">Originator Information</h3>

      <div className="space-y-2 mb-4">
        <label className="block text-sm font-semibold text-slate-300">Originator Name</label>
        <input
          name="originator_name"
          value={form.originator_name}
          onChange={onChange}
          placeholder="John Doe"
          className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-slate-300">Address Line 1</label>
          <input
            name="originator_address1"
            value={form.originator_address1}
            onChange={onChange}
            placeholder="123 Main St"
            className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-semibold text-slate-300">Address Line 2</label>
          <input
            name="originator_address2"
            value={form.originator_address2}
            onChange={onChange}
            placeholder="Apt 4B"
            className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-semibold text-slate-300">Originator Country</label>
        <select
          name="originator_country"
          value={form.originator_country}
          onChange={onChange}
          className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
        >
          <option value="">Select country</option>
          {originOptions.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>
    </div>
  );
}

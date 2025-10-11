// app/components/BeneficiarySection.jsx
"use client";
import React from "react";

/**
 * BeneficiarySection
 * props:
 *  - form
 *  - onChange
 *  - beneficiaryOptions (array)
 */
export default function BeneficiarySection({ form, onChange, beneficiaryOptions = [] }) {
  return (
    <div className="pt-4 border-t border-slate-700">
      <h3 className="text-lg font-semibold text-slate-200 mb-4">Beneficiary Information</h3>

      <div className="space-y-2 mb-4">
        <label className="block text-sm font-semibold text-slate-300">Beneficiary Name</label>
        <input
          name="beneficiary_name"
          value={form.beneficiary_name}
          onChange={onChange}
          placeholder="Jane Smith"
          className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-slate-300">Address Line 1</label>
          <input
            name="beneficiary_address1"
            value={form.beneficiary_address1}
            onChange={onChange}
            placeholder="456 Oak Ave"
            className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-semibold text-slate-300">Beneficiary Country</label>
          <select
            name="beneficiary_country"
            value={form.beneficiary_country}
            onChange={onChange}
            className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
          >
            <option value="">Select country</option>
            {beneficiaryOptions.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}

// app/components/PaymentSection.jsx
"use client";
import React from "react";

/**
 * PaymentSection
 * props:
 *  - form
 *  - onChange
 *  - currencyOptions
 *  - paymentTypeOptions
 *  - paymentInstructionOptions
 */
export default function PaymentSection({
  form,
  onChange,
  currencyOptions = [],
  paymentTypeOptions = [],
  paymentInstructionOptions = []
}) {
  return (
    <div className="pt-4 border-t border-slate-700">
      <h3 className="text-lg font-semibold text-slate-200 mb-4">Payment Details</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-slate-300">Currency Code</label>
          <select
            name="currency_code"
            value={form.currency_code}
            onChange={onChange}
            className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
          >
            <option value="">Select currency</option>
            {currencyOptions.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-semibold text-slate-300">Payment Type</label>
          <select
            name="payment_type"
            value={form.payment_type}
            onChange={onChange}
            className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
          >
            <option value="">Select payment type</option>
            {paymentTypeOptions.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-semibold text-slate-300">Payment Instruction</label>
        <select
          name="payment_instruction"
          value={form.payment_instruction}
          onChange={onChange}
          className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
        >
          <option value="">Select instruction</option>
          {paymentInstructionOptions.map((pi, i) => (
            <option key={i} value={pi}>{pi}</option>
          ))}
        </select>
      </div>
    </div>
  );
}

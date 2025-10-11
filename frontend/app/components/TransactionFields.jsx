// app/components/TransactionFields.jsx
"use client";
import React from "react";

/**
 * TransactionFields
 * props:
 *  - form: object
 *  - onChange: (e) => void
 */
export default function TransactionFields({ form, onChange }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-slate-300">Transaction ID *</label>
          <input
            name="transaction_id"
            value={form.transaction_id}
            onChange={onChange}
            placeholder="txn_12345"
            className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-semibold text-slate-300">Account Key *</label>
          <input
            name="account_key"
            value={form.account_key}
            onChange={onChange}
            placeholder="acc_abc123"
            className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-slate-300">Transaction Date *</label>
          <input
            type="date"
            name="transaction_date"
            value={form.transaction_date}
            onChange={onChange}
            className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-semibold text-slate-300">Transaction Amount *</label>
          <input
            name="transaction_amount"
            value={form.transaction_amount}
            onChange={onChange}
            placeholder="10000.50"
            className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
          />
        </div>
      </div>
    </div>
  );
}

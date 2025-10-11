"use client";

import { useState, useRef } from "react";
import Papa from "papaparse";
import { Upload, AlertCircle, CheckCircle, ArrowRight, Zap, FileUp, X } from "lucide-react";

const PAYMENT_TYPE_OPTIONS = ["SWIFT", "ACH", "NEFT", "SEPA", "IMPS"];
const CURRENCY_CODE_OPTIONS = ["CNY", "JPY", "INR", "USD", "EUR", "BRL", "GBP", "AED"];
const PAYMENT_INSTRUCTION_OPTIONS = [
  "Memory population recent drive money.",
  "Sometimes member ok hospital keep his city.",
  "Question manager both.",
  "Drug four note civil order.",
  "Have glass child that they number generation.",
  "Address whose how term there allow certain dinner.",
  "Both analysis leader wind service free rest.",
  "Develop outside air billion star medical him court.",
  "Mind eat itself kitchen power knowledge.",
  "Material should how several seem someone."
];
const ORIGIN_COUNTRY_OPTIONS = ["US","FR","BR","IN","SY","AE","KP","CA","GB","DE","CU","MX","IR","ZA","RU"];
const BENEFICIARY_COUNTRY_OPTIONS = ORIGIN_COUNTRY_OPTIONS;

export default function AmlTransactionForm() {
  const [activeTab, setActiveTab] = useState("single");
  const [form, setForm] = useState({
    transaction_id: "",
    account_key: "",
    transaction_date: "",
    originator_name: "",
    originator_address1: "",
    originator_address2: "",
    originator_country: "",
    beneficiary_name: "",
    beneficiary_address1: "",
    beneficiary_country: "",
    transaction_amount: "",
    currency_code: "",
    payment_instruction: "",
    payment_type: "",
  });

  const [csvPreview, setCsvPreview] = useState([]);
  const [csvHeaders, setCsvHeaders] = useState([]);
  const [errors, setErrors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: value }));
  };

  const validateSingle = (data) => {
    const errs = [];
    if (!data.transaction_id) errs.push("transaction_id is required");
    if (!data.account_key) errs.push("account_key is required");
    if (!data.transaction_date) errs.push("transaction_date is required");
    if (!data.transaction_amount || isNaN(Number(data.transaction_amount))) errs.push("transaction_amount must be a number");
    return errs;
  };

  const resetForm = () => {
    setForm({
      transaction_id: "",
      account_key: "",
      transaction_date: "",
      originator_name: "",
      originator_address1: "",
      originator_address2: "",
      originator_country: "",
      beneficiary_name: "",
      beneficiary_address1: "",
      beneficiary_country: "",
      transaction_amount: "",
      currency_code: "",
      payment_instruction: "",
      payment_type: "",
    });
    setErrors([]);
    setSuccessMsg("");
  };

  const submitSingle = async (e) => {
    e.preventDefault();
    setErrors([]);
    setSuccessMsg("");
    const errs = validateSingle(form);
    if (errs.length) return setErrors(errs);

    setLoading(true);
    try {
      const res = await fetch("/api/aml/single", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Server error");
      const data = await res.json();
      setSuccessMsg(data.message || "✓ Transaction submitted successfully");
      resetForm();
    } catch (err) {
      setErrors([err.message || "Unknown error"]);
    } finally {
      setLoading(false);
    }
  };

  

  const handleFilePicked = (file) => {
    if (!file) return;
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.errors && results.errors.length) {
          setErrors(results.errors.map((r) => r.message || JSON.stringify(r)));
          return;
        }

        const rows = results.data;
        const headers = results.meta.fields || [];
        setCsvHeaders(headers);
        setCsvPreview(rows.slice(0, 100));

        if (rows.length === 1) {
          const r = rows[0];
          setForm((prev) => ({
            transaction_id: r.transaction_id || r.id || prev.transaction_id,
            account_key: r.account_key || prev.account_key,
            transaction_date: r.transaction_date || prev.transaction_date,
            originator_name: r.originator_name || r.from_name || prev.originator_name,
            originator_address1: r.originator_address1 || prev.originator_address1,
            originator_address2: r.originator_address2 || prev.originator_address2,
            originator_country: r.originator_country || prev.originator_country,
            beneficiary_name: r.beneficiary_name || prev.beneficiary_name,
            beneficiary_address1: r.beneficiary_address1 || prev.beneficiary_address1,
            beneficiary_country: r.beneficiary_country || prev.beneficiary_country,
            transaction_amount: r.transaction_amount || r.amount || prev.transaction_amount,
            currency_code: r.currency_code || prev.currency_code,
            payment_instruction: r.payment_instruction || prev.payment_instruction,
            payment_type: r.payment_type || prev.payment_type,
          }));
        }
      },
    });
  };

  const onFileChange = (e) => {
    setErrors([]);
    const file = e.target.files?.[0];
    handleFilePicked(file);
  };

  

  const onDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    setErrors([]);
    const file = e.dataTransfer.files?.[0];
    handleFilePicked(file);
  };

  const resetCsv = () => {
    setCsvPreview([]);
    setCsvHeaders([]);
    if (fileInputRef.current) fileInputRef.current.value = null;
    setErrors([]);
  };

  const submitCsv = async () => {
    if (!csvPreview || csvPreview.length === 0) {
      setErrors(["No CSV data parsed to submit"]);
      return;
    }
    setLoading(true);
    setErrors([]);
    setSuccessMsg("");
    try {
      const res = await fetch("/api/aml/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rows: csvPreview }),
      });
      if (!res.ok) throw new Error("Server error while uploading CSV");
      const body = await res.json();
      setSuccessMsg(`✓ Successfully uploaded ${csvPreview.length} transactions`);
      resetCsv();
    } catch (err) {
      setErrors([err.message || "Unknown error while uploading CSV"]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-gradient-to-br from-purple-500 to-blue-600 rounded-lg">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-white">AML Fraud Detector</h1>
          </div>
          <p className="text-slate-400 ml-11">Detect suspicious transactions and money laundering patterns in real-time</p>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab("single")}
            className={`px-6 py-3 rounded-lg font-medium transition-all ${
              activeTab === "single"
                ? "bg-purple-600 text-white shadow-lg shadow-purple-600/50"
                : "bg-slate-700/50 text-slate-300 hover:bg-slate-700"
            }`}
          >
            Single Transaction
          </button>
          <button
            onClick={() => setActiveTab("bulk")}
            className={`px-6 py-3 rounded-lg font-medium transition-all ${
              activeTab === "bulk"
                ? "bg-blue-600 text-white shadow-lg shadow-blue-600/50"
                : "bg-slate-700/50 text-slate-300 hover:bg-slate-700"
            }`}
          >
            Bulk Upload (CSV)
          </button>
        </div>

        {/* Main Content */}
        <div className="space-y-6">
          {/* Single Transaction Tab */}
          {activeTab === "single" && (
            <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-8 shadow-2xl">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                <ArrowRight className="w-6 h-6 text-purple-400" />
                Enter Transaction Details
              </h2>

              <div className="space-y-6">
                {/* Row 1 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-slate-300">Transaction ID *</label>
                    <input
                      name="transaction_id"
                      value={form.transaction_id}
                      onChange={handleChange}
                      placeholder="txn_12345"
                      className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-slate-300">Account Key *</label>
                    <input
                      name="account_key"
                      value={form.account_key}
                      onChange={handleChange}
                      placeholder="acc_abc123"
                      className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                    />
                  </div>
                </div>

                {/* Row 2 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-slate-300">Transaction Date *</label>
                    <input
                      type="date"
                      name="transaction_date"
                      value={form.transaction_date}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-slate-300">Transaction Amount *</label>
                    <input
                      name="transaction_amount"
                      value={form.transaction_amount}
                      onChange={handleChange}
                      placeholder="10000.50"
                      className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                    />
                  </div>
                </div>

                {/* Originator Section */}
                <div className="pt-4 border-t border-slate-700">
                  <h3 className="text-lg font-semibold text-slate-200 mb-4">Originator Information</h3>
                  
                  <div className="space-y-2 mb-4">
                    <label className="block text-sm font-semibold text-slate-300">Originator Name</label>
                    <input
                      name="originator_name"
                      value={form.originator_name}
                      onChange={handleChange}
                      placeholder="John Doe"
                      className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-slate-300">Address Line 1</label>
                      <input
                        name="originator_address1"
                        value={form.originator_address1}
                        onChange={handleChange}
                        placeholder="123 Main St"
                        className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-slate-300">Address Line 2</label>
                      <input
                        name="originator_address2"
                        value={form.originator_address2}
                        onChange={handleChange}
                        placeholder="Apt 4B"
                        className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-slate-300">Originator Country</label>
                    <select
                      name="originator_country"
                      value={form.originator_country}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                    >
                      <option value="">Select country</option>
                      {ORIGIN_COUNTRY_OPTIONS.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Beneficiary Section */}
                <div className="pt-4 border-t border-slate-700">
                  <h3 className="text-lg font-semibold text-slate-200 mb-4">Beneficiary Information</h3>
                  
                  <div className="space-y-2 mb-4">
                    <label className="block text-sm font-semibold text-slate-300">Beneficiary Name</label>
                    <input
                      name="beneficiary_name"
                      value={form.beneficiary_name}
                      onChange={handleChange}
                      placeholder="Jane Smith"
                      className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-slate-300">Address Line 1</label>
                      <input
                        name="beneficiary_address1"
                        value={form.beneficiary_address1}
                        onChange={handleChange}
                        placeholder="456 Oak Ave"
                        className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-slate-300">Beneficiary Country</label>
                      <select
                        name="beneficiary_country"
                        value={form.beneficiary_country}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                      >
                        <option value="">Select country</option>
                        {BENEFICIARY_COUNTRY_OPTIONS.map((c) => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Payment Details Section */}
                <div className="pt-4 border-t border-slate-700">
                  <h3 className="text-lg font-semibold text-slate-200 mb-4">Payment Details</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-slate-300">Currency Code</label>
                      <select
                        name="currency_code"
                        value={form.currency_code}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                      >
                        <option value="">Select currency</option>
                        {CURRENCY_CODE_OPTIONS.map((c) => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-slate-300">Payment Type</label>
                      <select
                        name="payment_type"
                        value={form.payment_type}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                      >
                        <option value="">Select payment type</option>
                        {PAYMENT_TYPE_OPTIONS.map((p) => (
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
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                    >
                      <option value="">Select instruction</option>
                      {PAYMENT_INSTRUCTION_OPTIONS.map((pi, i) => (
                        <option key={i} value={pi}>{pi}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Buttons */}
                <div className="flex gap-3 pt-6">
                  <button
                    onClick={submitSingle}
                    disabled={loading}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 text-white font-semibold rounded-lg transition-all shadow-lg hover:shadow-purple-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? "Processing..." : "Analyze Transaction"}
                  </button>
                  <button
                    onClick={resetForm}
                    className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-lg transition-all"
                  >
                    Reset
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Bulk Upload Tab */}
          {activeTab === "bulk" && (
            <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-8 shadow-2xl">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                <FileUp className="w-6 h-6 text-blue-400" />
                Upload Multiple Transactions
              </h2>

              {/* Drag & Drop Area */}
              <div
                onDrop={onDrop}
                onDragOver={() => setDragActive(true)}
                onDragLeave={() => setDragActive(false)}
                className={`border-2 border-dashed rounded-2xl p-12 text-center transition-all ${
                  dragActive
                    ? "border-blue-400 bg-blue-500/10"
                    : "border-slate-600 bg-slate-700/20"
                }`}
              >
                <Upload className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                <p className="text-slate-300 font-semibold mb-2">Drag & drop your CSV file here</p>
                <p className="text-slate-500 text-sm mb-4">or click to browse</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,text/csv"
                  onChange={onFileChange}
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-all"
                >
                  Choose File
                </button>
                <p className="text-xs text-slate-500 mt-4">
                  Expected columns: transaction_id, account_key, transaction_date, originator_name, beneficiary_name, transaction_amount, currency_code, payment_type
                </p>
              </div>

              {/* CSV Preview */}
              {csvPreview.length > 0 && (
                <div className="mt-8">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold text-white">
                      Preview: {csvPreview.length} Transaction{csvPreview.length !== 1 ? "s" : ""}
                    </h3>
                  </div>

                  <div className="overflow-x-auto rounded-xl border border-slate-600 bg-slate-900/50">
                    <table className="w-full text-sm">
                      <thead className="sticky top-0 bg-gradient-to-r from-slate-700 to-slate-800 border-b border-slate-600">
                        <tr>
                          <th className="px-4 py-3 text-left font-semibold text-slate-200 w-12">#</th>
                          {csvHeaders.map((h) => (
                            <th key={h} className="px-4 py-3 text-left font-semibold text-slate-200 whitespace-nowrap">
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {csvPreview.map((row, i) => (
                          <tr key={i} className={`border-b border-slate-700 ${i % 2 === 0 ? "bg-slate-800/30" : "bg-slate-700/20"} hover:bg-slate-700/40 transition-colors`}>
                            <td className="px-4 py-3 text-slate-400 font-medium">{i + 1}</td>
                            {csvHeaders.map((k) => (
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

                  <div className="flex gap-3 mt-6">
                    <button
                      onClick={submitCsv}
                      disabled={loading}
                      className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white font-semibold rounded-lg transition-all shadow-lg hover:shadow-blue-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? "Uploading..." : `Upload ${csvPreview.length} Transactions`}
                    </button>
                    <button
                      onClick={resetCsv}
                      className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-lg transition-all"
                    >
                      Clear
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Error Messages */}
          {errors.length > 0 && (
            <div className="bg-red-500/10 border border-red-500/50 rounded-xl p-4">
              <div className="flex gap-3">
                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-red-400 mb-2">Validation Errors</h3>
                  <ul className="space-y-1">
                    {errors.map((err, i) => (
                      <li key={i} className="text-red-300 text-sm">
                        • {err}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Success Messages */}
          {successMsg && (
            <div className="bg-green-500/10 border border-green-500/50 rounded-xl p-4">
              <div className="flex gap-3">
                <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                <p className="text-green-300 font-medium">{successMsg}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
"use client";

import { useState, useRef } from "react";
import Papa from "papaparse";

// AML Transaction Input (updated to use exact field names requested)
// Fields:
// transaction_id
// account_key
// transaction_date
// originator_name
// originator_address1
// originator_address2
// originator_country
// beneficiary_name
// beneficiary_address1
// beneficiary_country
// transaction_amount
// currency_code
// payment_instruction
// payment_type

// NOTE: The select options for some fields (payment_type, currency_code,
// payment_instruction, originator_country, beneficiary_country) were auto-scanned
// from the uploaded CSV and embedded as default options below. You can edit or
// expand these lists as needed.

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
  const fileInputRef = useRef(null);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: value }));
  }

  function validateSingle(data) {
    const errs = [];
    if (!data.transaction_id) errs.push("transaction_id is required");
    if (!data.account_key) errs.push("account_key is required");
    if (!data.transaction_date) errs.push("transaction_date is required");
    if (!data.transaction_amount || isNaN(Number(data.transaction_amount))) errs.push("transaction_amount must be a number");
    return errs;
  }

  async function submitSingle(e) {
    e.preventDefault();
    console.log(form);
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
      setSuccessMsg(data.message || "Submitted successfully");
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
    } catch (err) {
      setErrors([err.message || "Unknown error"]);
    } finally {
      setLoading(false);
    }
  }

  function handleFilePicked(file) {
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
        setCsvPreview(rows.slice(0, 100)); // preview first 100 rows for bulk

        if (rows.length === 1) {
          const r = rows[0];
          setForm((prev) => ({
            transaction_id: r.transaction_id || r.id || prev.transaction_id,
            account_key: r.account_key || prev.account_key,
            transaction_date: r.transaction_date || r.transaction_date || prev.transaction_date,
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
  }

  function onFileChange(e) {
    setErrors([]);
    const file = e.target.files?.[0];
    handleFilePicked(file);
  }

  function onDrop(e) {
    e.preventDefault();
    setErrors([]);
    const file = e.dataTransfer.files?.[0];
    handleFilePicked(file);
  }

  function onDragOver(e) {
    e.preventDefault();
  }

  async function submitCsv() {
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
      setSuccessMsg(body.message || `Uploaded ${csvPreview.length} rows`);
      setCsvPreview([]);
      setCsvHeaders([]);
      if (fileInputRef.current) fileInputRef.current.value = null;
    } catch (err) {
      setErrors([err.message || "Unknown error while uploading CSV"]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-5xl mx-auto p-6 bg-white rounded-2xl shadow-lg mt-6">
      <h2 className="text-2xl font-semibold mb-2">AML Transaction Input</h2>
      <p className="text-sm text-gray-500 mb-6">Use this form to submit a single transaction or upload a CSV for bulk ingestion. Field names match exactly the schema you requested.</p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <form onSubmit={submitSingle} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label className="flex flex-col">
              <span className="text-sm font-medium">transaction_id</span>
              <input name="transaction_id" value={form.transaction_id} onChange={handleChange} className="mt-1 p-2 rounded-md border" placeholder="txn_12345" />
            </label>

            <label className="flex flex-col">
              <span className="text-sm font-medium">account_key</span>
              <input name="account_key" value={form.account_key} onChange={handleChange} className="mt-1 p-2 rounded-md border" placeholder="acc_abc123" />
            </label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label className="flex flex-col">
              <span className="text-sm font-medium">transaction_date</span>
              <input type="date" name="transaction_date" value={form.transaction_date} onChange={handleChange} className="mt-1 p-2 rounded-md border" />
            </label>

            <label className="flex flex-col">
              <span className="text-sm font-medium">transaction_amount</span>
              <input name="transaction_amount" value={form.transaction_amount} onChange={handleChange} className="mt-1 p-2 rounded-md border" placeholder="1000.50" />
            </label>
          </div>

          <label className="flex flex-col">
            <span className="text-sm font-medium">originator_name</span>
            <input name="originator_name" value={form.originator_name} onChange={handleChange} className="mt-1 p-2 rounded-md border" />
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label className="flex flex-col">
              <span className="text-sm font-medium">originator_address1</span>
              <input name="originator_address1" value={form.originator_address1} onChange={handleChange} className="mt-1 p-2 rounded-md border" />
            </label>

            <label className="flex flex-col">
              <span className="text-sm font-medium">originator_address2</span>
              <input name="originator_address2" value={form.originator_address2} onChange={handleChange} className="mt-1 p-2 rounded-md border" />
            </label>
          </div>

          <label className="flex flex-col">
            <span className="text-sm font-medium">originator_country</span>
            <select name="originator_country" value={form.originator_country} onChange={handleChange} className="mt-1 p-2 rounded-md border">
              <option value="">Select country (or type)</option>
              {ORIGIN_COUNTRY_OPTIONS.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </label>

          <label className="flex flex-col">
            <span className="text-sm font-medium">beneficiary_name</span>
            <input name="beneficiary_name" value={form.beneficiary_name} onChange={handleChange} className="mt-1 p-2 rounded-md border" />
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label className="flex flex-col">
              <span className="text-sm font-medium">beneficiary_address1</span>
              <input name="beneficiary_address1" value={form.beneficiary_address1} onChange={handleChange} className="mt-1 p-2 rounded-md border" />
            </label>

            <label className="flex flex-col">
              <span className="text-sm font-medium">beneficiary_country</span>
              <select name="beneficiary_country" value={form.beneficiary_country} onChange={handleChange} className="mt-1 p-2 rounded-md border">
                <option value="">Select country (or type)</option>
                {BENEFICIARY_COUNTRY_OPTIONS.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label className="flex flex-col">
              <span className="text-sm font-medium">currency_code</span>
              <select name="currency_code" value={form.currency_code} onChange={handleChange} className="mt-1 p-2 rounded-md border">
                <option value="">Select currency</option>
                {CURRENCY_CODE_OPTIONS.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </label>

            <label className="flex flex-col">
              <span className="text-sm font-medium">payment_type</span>
              <select name="payment_type" value={form.payment_type} onChange={handleChange} className="mt-1 p-2 rounded-md border">
                <option value="">Select payment type</option>
                {PAYMENT_TYPE_OPTIONS.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </label>
          </div>

          <label className="flex flex-col">
            <span className="text-sm font-medium">payment_instruction</span>
            <select name="payment_instruction" value={form.payment_instruction} onChange={handleChange} className="mt-1 p-2 rounded-md border">
              <option value="">Select instruction (or type)</option>
              {PAYMENT_INSTRUCTION_OPTIONS.map((pi, i) => <option key={i} value={pi}>{pi}</option>)}
            </select>
          </label>

          <div className="flex items-center gap-3">
            <button type="submit" disabled={loading} className="px-4 py-2 rounded-lg bg-indigo-600 text-white font-medium shadow-sm hover:opacity-95">
              {loading ? "Submitting..." : "Submit Single Transaction"}
            </button>

            <button type="button" onClick={() => { setForm({
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
            }); setErrors([]); setSuccessMsg(""); }} className="px-3 py-2 rounded-lg border">
              Reset
            </button>
          </div>
        </form>

        <div>
          <div onDrop={onDrop} onDragOver={onDragOver} className="border-dashed border-2 border-gray-200 rounded-lg p-6 flex flex-col items-center justify-center h-full">
            <p className="text-sm text-gray-600 mb-3">Drag & drop CSV here, or</p>
            <input ref={fileInputRef} type="file" accept=".csv,text/csv" onChange={onFileChange} className="mb-3" />
            <p className="text-xs text-gray-400">CSV should have headers that match the field names above. Mapping is best-effort.</p>

            <div className="mt-4">
              <button onClick={() => fileInputRef.current?.click()} className="px-4 py-2 bg-white border rounded-md">Choose File</button>
            </div>
          </div>

          {csvPreview && csvPreview.length > 0 && (
            <div className="mt-4">
              <h3 className="text-lg font-medium">CSV Preview ({csvPreview.length} rows)</h3>
              <div className="overflow-x-auto mt-2 rounded-md border">
                <table className="min-w-full text-sm table-auto">
                  <thead className="bg-gray-50">
                    <tr>
                      {csvHeaders.length ? csvHeaders.map((h) => <th key={h} className="px-3 py-2 text-left">{h}</th>) : Object.keys(csvPreview[0]).map((k) => <th key={k} className="px-3 py-2 text-left">{k}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {csvPreview.map((row, i) => (
                      <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                        {(csvHeaders.length ? csvHeaders : Object.keys(row)).map((k) => (
                          <td key={k} className="px-3 py-2 align-top whitespace-pre-wrap max-w-xs">{String(row[k] ?? "")}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex gap-3 mt-3">
                <button onClick={submitCsv} disabled={loading} className="px-4 py-2 rounded-lg bg-green-600 text-white">{loading ? 'Uploading...' : 'Upload CSV (preview rows only)'}</button>
                <button onClick={() => { setCsvPreview([]); setCsvHeaders([]); if (fileInputRef.current) fileInputRef.current.value = null; }} className="px-3 py-2 border rounded-md">Clear</button>
              </div>
            </div>
          )}
        </div>
      </div>

      {(errors && errors.length > 0) && (
        <div className="mt-4 bg-red-50 border border-red-200 text-red-700 p-3 rounded">
          <strong className="block font-medium">Errors</strong>
          <ul className="list-disc pl-5 mt-2">
            {errors.map((err, i) => <li key={i}>{err}</li>)}
          </ul>
        </div>
      )}

      {successMsg && (
        <div className="mt-4 bg-green-50 border border-green-200 text-green-700 p-3 rounded">
          {successMsg}
        </div>
      )}

      <div className="mt-6 text-xs text-gray-400">Tip: You can expand the option arrays at the top if you want different default selects. The component will also try to auto-map common alternate header names when a single-row CSV is uploaded.</div>
    </div>
  );
}

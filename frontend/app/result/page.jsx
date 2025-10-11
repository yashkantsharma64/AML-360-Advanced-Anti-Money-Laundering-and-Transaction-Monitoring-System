"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";

export default function DashboardPage() {
  // Get query parameters from the URL (like ?type=customers)
  const searchParams = useSearchParams();
  const queryType = searchParams.get("type") || "transactions";

  // State hooks
  const [results, setResults] = useState([]);
  const [selected, setSelected] = useState(queryType);
  const [search, setSearch] = useState("");

  // Mock AML data
  useEffect(() => {
    const mockData = [
      { id: "1", name: "Alice", amount: 2500, score: 85, status: "Low Risk" },
      { id: "2", name: "Bob", amount: 6000, score: 92, status: "High Risk" },
      { id: "3", name: "Charlie", amount: 4000, score: 78, status: "Medium Risk" },
      { id: "4", name: "David", amount: 5500, score: 88, status: "Low Risk" },
      { id: "5", name: "Eva", amount: 7200, score: 95, status: "High Risk" },
    ];
    setResults(mockData);
  }, []);

  // Handle tab change
  const handleTabClick = (tab) => {
    setSelected(tab);
  };

  // Filtered results based on search input
  const filteredResults = results.filter((item) =>
    item.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <main className="flex bg-gray-50 min-h-screen">
      {/* LEFT GAP / SIDEBAR PLACEHOLDER */}
      <div className="w-48 bg-white border-r border-gray-200 p-4">
        {/* Empty left space — you can later add navigation or logo here */}
      </div>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 p-8 space-y-6">
        {/* Header */}
        <h1 className="text-2xl font-bold text-gray-800 mb-4">
          AML 360 Dashboard
        </h1>

        {/* Tabs */}
        <div className="flex gap-4">
          <button
            onClick={() => handleTabClick("transactions")}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              selected === "transactions"
                ? "bg-blue-600 text-white"
                : "bg-white text-gray-600 border border-gray-300 hover:bg-gray-100"
            }`}
          >
            Transactions
          </button>

          <button
            onClick={() => handleTabClick("customers")}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              selected === "customers"
                ? "bg-blue-600 text-white"
                : "bg-white text-gray-600 border border-gray-300 hover:bg-gray-100"
            }`}
          >
            Customers
          </button>
        </div>

        {/* Query Parameters */}
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <h2 className="font-semibold mb-2 text-gray-700">Search Parameters</h2>
          <p className="text-sm text-gray-600">
            <strong>type:</strong> {queryType}
          </p>
        </div>

        {/* Search Bar */}
        <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow-sm border">
          <h2 className="font-semibold text-gray-700">Search Records</h2>
          <input
            type="text"
            placeholder="Search by name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm w-60 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        {/* Results Table */}
        <div className="bg-white p-4 rounded-lg shadow-sm border overflow-x-auto">
          <h2 className="font-semibold mb-3 text-gray-700">Results</h2>
          {filteredResults.length === 0 ? (
            <p className="text-gray-500 text-sm">No matching results.</p>
          ) : (
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="bg-gray-100 text-gray-700">
                  <th className="border p-2 text-left">ID</th>
                  <th className="border p-2 text-left">Name</th>
                  <th className="border p-2 text-left">Amount</th>
                  <th className="border p-2 text-left">Score</th>
                  <th className="border p-2 text-left">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredResults.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="border p-2">{item.id}</td>
                    <td className="border p-2">{item.name}</td>
                    <td className="border p-2">${item.amount}</td>
                    <td className="border p-2">{item.score}</td>
                    <td
                      className={`border p-2 font-medium ${
                        item.status === "High Risk"
                          ? "text-red-600"
                          : item.status === "Medium Risk"
                          ? "text-yellow-600"
                          : "text-green-600"
                      }`}
                    >
                      {item.status}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Footer */}
        <footer className="text-center text-sm text-gray-500 pt-4 border-t">
          © 2025 AML 360 | Built for Hackathon
        </footer>
      </div>
    </main>
  );
}

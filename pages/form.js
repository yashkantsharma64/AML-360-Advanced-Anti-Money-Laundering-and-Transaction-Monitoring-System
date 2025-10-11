import Head from 'next/head';
import Link from 'next/link';
import { useState } from 'react';
import { ExchangeRateAPI, RiskScoringEngine, TransactionDatabase } from '../lib/aml-engine';

export default function TransactionForm() {
  const [formData, setFormData] = useState({
    transaction_date: '',
    originator_name: '',
    originator_address1: '',
    originator_address2: '',
    originator_country: '',
    beneficiary_name: '',
    beneficiary_address1: '',
    beneficiary_address2: '',
    beneficiary_country: '',
    transaction_amount: '',
    currency_code: 'USD',
    payment_instruction: '',
    payment_type: 'transfer'
  });

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const exchangeAPI = new ExchangeRateAPI('4299650994279511afe6ed48');
  const riskEngine = new RiskScoringEngine();
  const db = new TransactionDatabase();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);

    try {
      // Convert amount to USD
      const amountUsd = await exchangeAPI.convertToUSD(
        parseFloat(formData.transaction_amount),
        formData.currency_code,
        formData.transaction_date
      );

      // Calculate risk score
      const riskResult = riskEngine.calculateRiskScore({
        ...formData,
        transaction_amount: parseFloat(formData.transaction_amount),
        amount_usd: amountUsd
      });

      // Create transaction object
      const transaction = {
        ...formData,
        transaction_amount: parseFloat(formData.transaction_amount),
        amount_usd: amountUsd,
        usd_rate: amountUsd / parseFloat(formData.transaction_amount),
        risk_score: riskResult.totalScore,
        triggered_rules: riskResult.triggeredRules,
        isSuspicious: riskResult.isSuspicious
      };

      // Save to database
      const savedTransaction = db.addTransaction(transaction);

      setResult(savedTransaction);
    } catch (err) {
      setError('Error processing transaction: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const currencies = ['USD', 'EUR', 'GBP', 'INR', 'CNY', 'JPY', 'AED', 'BRL'];
  const countries = ['US', 'GB', 'DE', 'FR', 'CA', 'AU', 'IN', 'CN', 'JP', 'AE', 'BR', 'MX', 'RU', 'IR', 'KP', 'SY', 'CU'];

  return (
    <>
      <Head>
        <title>Add Transaction - AML Monitoring</title>
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div>
                <Link href="/" className="text-blue-600 hover:text-blue-800">← Back to Home</Link>
                <h1 className="text-3xl font-bold text-gray-900 mt-2">Add Transaction</h1>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Transaction Details</h2>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Transaction Date & Amount */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Transaction Date
                  </label>
                  <input
                    type="date"
                    name="transaction_date"
                    value={formData.transaction_date}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Amount
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    name="transaction_amount"
                    value={formData.transaction_amount}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Currency
                  </label>
                  <select
                    name="currency_code"
                    value={formData.currency_code}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {currencies.map(currency => (
                      <option key={currency} value={currency}>{currency}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Originator Information */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Originator Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Name
                    </label>
                    <input
                      type="text"
                      name="originator_name"
                      value={formData.originator_name}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Country
                    </label>
                    <select
                      name="originator_country"
                      value={formData.originator_country}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select Country</option>
                      {countries.map(country => (
                        <option key={country} value={country}>{country}</option>
                      ))}
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Address Line 1
                    </label>
                    <input
                      type="text"
                      name="originator_address1"
                      value={formData.originator_address1}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Address Line 2
                    </label>
                    <input
                      type="text"
                      name="originator_address2"
                      value={formData.originator_address2}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Beneficiary Information */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Beneficiary Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Name
                    </label>
                    <input
                      type="text"
                      name="beneficiary_name"
                      value={formData.beneficiary_name}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Country
                    </label>
                    <select
                      name="beneficiary_country"
                      value={formData.beneficiary_country}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select Country</option>
                      {countries.map(country => (
                        <option key={country} value={country}>{country}</option>
                      ))}
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Address Line 1
                    </label>
                    <input
                      type="text"
                      name="beneficiary_address1"
                      value={formData.beneficiary_address1}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Address Line 2
                    </label>
                    <input
                      type="text"
                      name="beneficiary_address2"
                      value={formData.beneficiary_address2}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Payment Information */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Payment Information</h3>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Payment Instruction
                    </label>
                    <textarea
                      name="payment_instruction"
                      value={formData.payment_instruction}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Payment Type
                    </label>
                    <select
                      name="payment_type"
                      value={formData.payment_type}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="transfer">Transfer</option>
                      <option value="wire">Wire</option>
                      <option value="ach">ACH</option>
                      <option value="check">Check</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="border-t pt-6">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Processing...' : 'Analyze Transaction'}
                </button>
              </div>
            </form>

            {/* Results */}
            {error && (
              <div className="px-6 pb-6">
                <div className="bg-red-50 border border-red-200 rounded-md p-4">
                  <p className="text-red-800">{error}</p>
                </div>
              </div>
            )}

            {result && (
              <div className="px-6 pb-6">
                <div className={`border rounded-md p-6 ${result.isSuspicious ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'}`}>
                  <div className="flex items-center mb-4">
                    <div className={`w-3 h-3 rounded-full mr-3 ${result.isSuspicious ? 'bg-red-500' : 'bg-green-500'}`}></div>
                    <h3 className={`text-lg font-medium ${result.isSuspicious ? 'text-red-800' : 'text-green-800'}`}>
                      {result.isSuspicious ? 'Suspicious Transaction Detected' : 'Normal Transaction'}
                    </h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-600">Risk Score</p>
                      <p className={`text-2xl font-bold ${result.isSuspicious ? 'text-red-600' : 'text-green-600'}`}>
                        {result.risk_score}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Amount (USD)</p>
                      <p className="text-lg font-semibold text-gray-900">
                        ${result.amount_usd.toLocaleString()}
                      </p>
                    </div>
                  </div>

                  {result.triggered_rules.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-2">Triggered Rules:</p>
                      <ul className="space-y-2">
                        {result.triggered_rules.map((rule, index) => (
                          <li key={index} className="text-sm text-gray-600">
                            <span className="font-medium">{rule.rule}</span> (+{rule.score}) - {rule.details}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="mt-4 flex space-x-4">
                    <Link href="/transactions" className="text-blue-600 hover:text-blue-800">
                      View All Transactions →
                    </Link>
                    <Link href={`/dashboard/${result.id}`} className="text-blue-600 hover:text-blue-800">
                      View Detailed Report →
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </>
  );
}

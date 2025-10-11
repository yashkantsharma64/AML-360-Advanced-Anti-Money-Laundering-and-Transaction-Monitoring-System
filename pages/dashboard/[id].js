import Head from 'next/head';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { TransactionDatabase } from '../../lib/aml-engine';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export default function TransactionDashboard({ transactionId }) {
  const [transaction, setTransaction] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const db = new TransactionDatabase();
    const foundTransaction = db.getTransactionById(transactionId);
    setTransaction(foundTransaction);
    setLoading(false);
  }, [transactionId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading transaction details...</p>
        </div>
      </div>
    );
  }

  if (!transaction) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Transaction Not Found</h1>
          <Link href="/transactions" className="text-blue-600 hover:text-blue-800">
            ← Back to Transactions
          </Link>
        </div>
      </div>
    );
  }

  const riskData = [
    { name: 'Triggered Rules', value: transaction.triggered_rules?.length || 0 },
    { name: 'Remaining Rules', value: 5 - (transaction.triggered_rules?.length || 0) }
  ];

  const ruleBreakdown = transaction.triggered_rules?.map(rule => ({
    name: rule.rule,
    score: rule.score,
    details: rule.details
  })) || [];

  const COLORS = ['#EF4444', '#F59E0B', '#10B981', '#3B82F6', '#8B5CF6'];

  return (
    <>
      <Head>
        <title>Transaction Dashboard - AML Monitoring</title>
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div>
                <Link href="/transactions" className="text-blue-600 hover:text-blue-800">← Back to Transactions</Link>
                <h1 className="text-3xl font-bold text-gray-900 mt-2">Transaction Analysis</h1>
              </div>
              <div className="flex items-center space-x-4">
                <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                  transaction.isSuspicious 
                    ? 'bg-red-100 text-red-800' 
                    : 'bg-green-100 text-green-800'
                }`}>
                  {transaction.isSuspicious ? 'Suspicious' : 'Normal'}
                </div>
                <span className="text-sm text-gray-500">
                  Risk Score: {transaction.risk_score}
                </span>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Transaction Overview */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            {/* Transaction Details */}
            <div className="lg:col-span-2 bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">Transaction Details</h2>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-3">Originator</h3>
                    <div className="space-y-2">
                      <p className="text-sm text-gray-900"><strong>Name:</strong> {transaction.originator_name}</p>
                      <p className="text-sm text-gray-900"><strong>Country:</strong> {transaction.originator_country}</p>
                      <p className="text-sm text-gray-900"><strong>Address:</strong> {transaction.originator_address1}</p>
                      {transaction.originator_address2 && (
                        <p className="text-sm text-gray-900">{transaction.originator_address2}</p>
                      )}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-3">Beneficiary</h3>
                    <div className="space-y-2">
                      <p className="text-sm text-gray-900"><strong>Name:</strong> {transaction.beneficiary_name}</p>
                      <p className="text-sm text-gray-900"><strong>Country:</strong> {transaction.beneficiary_country}</p>
                      <p className="text-sm text-gray-900"><strong>Address:</strong> {transaction.beneficiary_address1}</p>
                      {transaction.beneficiary_address2 && (
                        <p className="text-sm text-gray-900">{transaction.beneficiary_address2}</p>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h3 className="text-sm font-medium text-gray-500 mb-3">Payment Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <p className="text-sm text-gray-900"><strong>Amount:</strong> {transaction.currency_code} {transaction.transaction_amount?.toLocaleString()}</p>
                      <p className="text-sm text-gray-900"><strong>USD Equivalent:</strong> ${transaction.amount_usd?.toLocaleString()}</p>
                      <p className="text-sm text-gray-900"><strong>Exchange Rate:</strong> {transaction.usd_rate?.toFixed(4)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-900"><strong>Payment Type:</strong> {transaction.payment_type}</p>
                      <p className="text-sm text-gray-900"><strong>Date:</strong> {new Date(transaction.transaction_date).toLocaleDateString()}</p>
                    </div>
                  </div>
                  {transaction.payment_instruction && (
                    <div className="mt-4">
                      <p className="text-sm text-gray-900"><strong>Payment Instruction:</strong></p>
                      <p className="text-sm text-gray-600 mt-1 p-3 bg-gray-50 rounded">{transaction.payment_instruction}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Risk Assessment */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">Risk Assessment</h2>
              </div>
              <div className="p-6">
                <div className="text-center mb-6">
                  <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full text-2xl font-bold ${
                    transaction.isSuspicious ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'
                  }`}>
                    {transaction.risk_score}
                  </div>
                  <p className="text-sm text-gray-500 mt-2">Risk Score</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">Risk Level</span>
                      <span className={`font-medium ${
                        transaction.risk_score >= 10 ? 'text-red-600' :
                        transaction.risk_score >= 6 ? 'text-orange-600' :
                        transaction.risk_score >= 3 ? 'text-yellow-600' : 'text-green-600'
                      }`}>
                        {transaction.risk_score >= 10 ? 'High' :
                         transaction.risk_score >= 6 ? 'Medium' :
                         transaction.risk_score >= 3 ? 'Low' : 'Minimal'}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${
                          transaction.risk_score >= 10 ? 'bg-red-500' :
                          transaction.risk_score >= 6 ? 'bg-orange-500' :
                          transaction.risk_score >= 3 ? 'bg-yellow-500' : 'bg-green-500'
                        }`}
                        style={{ width: `${Math.min((transaction.risk_score / 15) * 100, 100)}%` }}
                      ></div>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600 mb-2">Status</p>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      transaction.isSuspicious 
                        ? 'bg-red-100 text-red-800' 
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {transaction.isSuspicious ? 'Suspicious Transaction' : 'Normal Transaction'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Risk Analysis Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Rule Breakdown */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">Rule Breakdown</h2>
              </div>
              <div className="p-6">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={riskData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {riskData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Triggered Rules */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">Triggered Rules</h2>
              </div>
              <div className="p-6">
                {ruleBreakdown.length > 0 ? (
                  <div className="space-y-4">
                    {ruleBreakdown.map((rule, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="text-sm font-medium text-gray-900">{rule.name}</h3>
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                            +{rule.score}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">{rule.details}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <svg className="w-12 h-12 text-green-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-gray-500">No rules triggered</p>
                    <p className="text-sm text-gray-400">This transaction appears to be normal</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Risk Factors Analysis */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Risk Factors Analysis</h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                {/* High-Risk Country Check */}
                <div className="text-center">
                  <div className={`w-12 h-12 rounded-full mx-auto mb-2 flex items-center justify-center ${
                    ['IR', 'KP', 'SY', 'RU', 'CU'].includes(transaction.beneficiary_country) 
                      ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'
                  }`}>
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <p className="text-sm font-medium text-gray-900">Country Risk</p>
                  <p className="text-xs text-gray-500">
                    {['IR', 'KP', 'SY', 'RU', 'CU'].includes(transaction.beneficiary_country) ? 'High Risk' : 'Normal'}
                  </p>
                </div>

                {/* Amount Check */}
                <div className="text-center">
                  <div className={`w-12 h-12 rounded-full mx-auto mb-2 flex items-center justify-center ${
                    transaction.amount_usd > 1000000 ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'
                  }`}>
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                  </div>
                  <p className="text-sm font-medium text-gray-900">Amount</p>
                  <p className="text-xs text-gray-500">
                    {transaction.amount_usd > 1000000 ? 'High Value' : 'Normal'}
                  </p>
                </div>

                {/* Keyword Check */}
                <div className="text-center">
                  <div className={`w-12 h-12 rounded-full mx-auto mb-2 flex items-center justify-center ${
                    transaction.triggered_rules?.some(rule => rule.rule === 'Suspicious keyword') 
                      ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'
                  }`}>
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                    </svg>
                  </div>
                  <p className="text-sm font-medium text-gray-900">Keywords</p>
                  <p className="text-xs text-gray-500">
                    {transaction.triggered_rules?.some(rule => rule.rule === 'Suspicious keyword') ? 'Suspicious' : 'Clean'}
                  </p>
                </div>

                {/* Structuring Check */}
                <div className="text-center">
                  <div className={`w-12 h-12 rounded-full mx-auto mb-2 flex items-center justify-center ${
                    transaction.triggered_rules?.some(rule => rule.rule === 'Potential structuring') 
                      ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'
                  }`}>
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <p className="text-sm font-medium text-gray-900">Structuring</p>
                  <p className="text-xs text-gray-500">
                    {transaction.triggered_rules?.some(rule => rule.rule === 'Potential structuring') ? 'Detected' : 'Normal'}
                  </p>
                </div>

                {/* Rounded Amount Check */}
                <div className="text-center">
                  <div className={`w-12 h-12 rounded-full mx-auto mb-2 flex items-center justify-center ${
                    transaction.triggered_rules?.some(rule => rule.rule === 'Rounded amount') 
                      ? 'bg-yellow-100 text-yellow-600' : 'bg-green-100 text-green-600'
                  }`}>
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <p className="text-sm font-medium text-gray-900">Rounded</p>
                  <p className="text-xs text-gray-500">
                    {transaction.triggered_rules?.some(rule => rule.rule === 'Rounded amount') ? 'Rounded' : 'Normal'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Recommendations */}
          <div className="mt-8 bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Recommendations</h2>
            </div>
            <div className="p-6">
              {transaction.isSuspicious ? (
                <div className="bg-red-50 border border-red-200 rounded-md p-4">
                  <div className="flex">
                    <svg className="w-5 h-5 text-red-400 mt-0.5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                    <div>
                      <h3 className="text-sm font-medium text-red-800">Suspicious Transaction Detected</h3>
                      <div className="mt-2 text-sm text-red-700">
                        <ul className="list-disc list-inside space-y-1">
                          <li>This transaction has triggered multiple risk rules</li>
                          <li>Manual review is recommended</li>
                          <li>Consider enhanced due diligence procedures</li>
                          <li>Monitor related transactions for patterns</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-green-50 border border-green-200 rounded-md p-4">
                  <div className="flex">
                    <svg className="w-5 h-5 text-green-400 mt-0.5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                      <h3 className="text-sm font-medium text-green-800">Normal Transaction</h3>
                      <div className="mt-2 text-sm text-green-700">
                        <ul className="list-disc list-inside space-y-1">
                          <li>No suspicious patterns detected</li>
                          <li>Transaction appears to be legitimate</li>
                          <li>Standard processing can continue</li>
                          <li>Regular monitoring is sufficient</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </>
  );
}

export async function getServerSideProps({ params }) {
  return {
    props: {
      transactionId: params.id
    }
  };
}

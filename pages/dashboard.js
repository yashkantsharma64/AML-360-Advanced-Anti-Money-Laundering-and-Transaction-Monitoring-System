import Head from 'next/head';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { TransactionDatabase } from '../lib/aml-engine';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';

export default function Dashboard() {
  const [stats, setStats] = useState({ total: 0, suspicious: 0, normal: 0, suspiciousRate: 0 });
  const [transactions, setTransactions] = useState([]);
  const [countryData, setCountryData] = useState([]);
  const [keywordData, setKeywordData] = useState([]);
  const [timeSeriesData, setTimeSeriesData] = useState([]);

  useEffect(() => {
    const db = new TransactionDatabase();
    const allTransactions = db.getAllTransactions();
    setTransactions(allTransactions);
    setStats(db.getTransactionStats());

    // Process data for charts
    processChartData(allTransactions);
  }, []);

  const processChartData = (transactions) => {
    // Country risk analysis
    const countryCounts = {};
    const suspiciousByCountry = {};
    
    transactions.forEach(t => {
      const country = t.beneficiary_country;
      countryCounts[country] = (countryCounts[country] || 0) + 1;
      if (t.isSuspicious) {
        suspiciousByCountry[country] = (suspiciousByCountry[country] || 0) + 1;
      }
    });

    const countryData = Object.entries(countryCounts)
      .map(([country, total]) => ({
        country,
        total,
        suspicious: suspiciousByCountry[country] || 0,
        suspiciousRate: ((suspiciousByCountry[country] || 0) / total * 100).toFixed(1)
      }))
      .sort((a, b) => b.suspicious - a.suspicious)
      .slice(0, 10);

    setCountryData(countryData);

    // Keyword analysis
    const keywordCounts = {};
    transactions.forEach(t => {
      if (t.triggered_rules) {
        t.triggered_rules.forEach(rule => {
          if (rule.rule === 'Suspicious keyword') {
            const keyword = rule.details.replace('Found keyword: "', '').replace('"', '');
            keywordCounts[keyword] = (keywordCounts[keyword] || 0) + 1;
          }
        });
      }
    });

    const keywordData = Object.entries(keywordCounts)
      .map(([keyword, count]) => ({ keyword, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    setKeywordData(keywordData);

    // Time series analysis
    const dailyData = {};
    transactions.forEach(t => {
      const date = new Date(t.transaction_date).toISOString().split('T')[0];
      if (!dailyData[date]) {
        dailyData[date] = { date, total: 0, suspicious: 0 };
      }
      dailyData[date].total += 1;
      if (t.isSuspicious) {
        dailyData[date].suspicious += 1;
      }
    });

    const timeSeriesData = Object.values(dailyData)
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .slice(-30); // Last 30 days

    setTimeSeriesData(timeSeriesData);
  };

  const COLORS = ['#EF4444', '#F59E0B', '#10B981', '#3B82F6', '#8B5CF6'];

  return (
    <>
      <Head>
        <title>Dashboard - AML Monitoring</title>
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div>
                <Link href="/" className="text-blue-600 hover:text-blue-800">← Back to Home</Link>
                <h1 className="text-3xl font-bold text-gray-900 mt-2">AML Dashboard</h1>
              </div>
              <div className="flex space-x-4">
                <Link href="/transactions" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                  View Transactions
                </Link>
                <Link href="/form" className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">
                  Add Transaction
                </Link>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Overview Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Transactions</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.total}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <div className="p-2 bg-red-100 rounded-lg">
                  <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Suspicious</p>
                  <p className="text-2xl font-semibold text-red-600">{stats.suspicious}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Normal</p>
                  <p className="text-2xl font-semibold text-green-600">{stats.normal}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Suspicious Rate</p>
                  <p className="text-2xl font-semibold text-yellow-600">{stats.suspiciousRate}%</p>
                </div>
              </div>
            </div>
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Transaction Volume */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">Transaction Volume</h2>
              </div>
              <div className="p-6">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={[
                    { name: 'Suspicious', value: stats.suspicious, color: '#EF4444' },
                    { name: 'Normal', value: stats.normal, color: '#10B981' }
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#3B82F6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Suspicious vs Normal Pie Chart */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">Transaction Distribution</h2>
              </div>
              <div className="p-6">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Suspicious', value: stats.suspicious },
                        { name: 'Normal', value: stats.normal }
                      ]}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      <Cell fill="#EF4444" />
                      <Cell fill="#10B981" />
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Country Risk Analysis */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">Top Countries by Suspicious Transactions</h2>
              </div>
              <div className="p-6">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={countryData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="country" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="suspicious" fill="#EF4444" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">Top Suspicious Keywords</h2>
              </div>
              <div className="p-6">
                {keywordData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={keywordData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="keyword" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" fill="#F59E0B" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No suspicious keywords detected</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Time Series Analysis */}
          <div className="bg-white rounded-lg shadow mb-8">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Transaction Trends Over Time</h2>
            </div>
            <div className="p-6">
              {timeSeriesData.length > 0 ? (
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={timeSeriesData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="total" stroke="#3B82F6" strokeWidth={2} name="Total Transactions" />
                    <Line type="monotone" dataKey="suspicious" stroke="#EF4444" strokeWidth={2} name="Suspicious Transactions" />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">No time series data available</p>
                </div>
              )}
            </div>
          </div>

          {/* Risk Heatmap */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Country Risk Heatmap</h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {countryData.map((country, index) => (
                  <div key={index} className="text-center">
                    <div className={`w-16 h-16 rounded-lg mx-auto mb-2 flex items-center justify-center text-white font-bold ${
                      parseFloat(country.suspiciousRate) > 50 ? 'bg-red-500' :
                      parseFloat(country.suspiciousRate) > 25 ? 'bg-orange-500' :
                      parseFloat(country.suspiciousRate) > 10 ? 'bg-yellow-500' : 'bg-green-500'
                    }`}>
                      {country.country}
                    </div>
                    <p className="text-xs text-gray-600">{country.suspiciousRate}%</p>
                    <p className="text-xs text-gray-500">{country.suspicious}/{country.total}</p>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex items-center justify-center space-x-6 text-sm">
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-green-500 rounded mr-2"></div>
                  <span>Low Risk (0-10%)</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-yellow-500 rounded mr-2"></div>
                  <span>Medium Risk (10-25%)</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-orange-500 rounded mr-2"></div>
                  <span>High Risk (25-50%)</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-red-500 rounded mr-2"></div>
                  <span>Very High Risk (50%+)</span>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}

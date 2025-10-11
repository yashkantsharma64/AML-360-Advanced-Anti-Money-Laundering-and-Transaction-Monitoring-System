import Head from 'next/head';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';

export default function Dashboard() {
  const [stats, setStats] = useState({ total: 0, suspicious: 0, normal: 0, suspiciousRate: 0 });
  const [transactions, setTransactions] = useState([]);
  const [countryData, setCountryData] = useState([]);
  const [keywordData, setKeywordData] = useState([]);
  const [suspiciousAccountsData, setSuspiciousAccountsData] = useState([]);
  const [timeSeriesData, setTimeSeriesData] = useState([]);
  const [timePeriod, setTimePeriod] = useState('days'); // 'days', 'months', 'years'
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch stats first
        const statsResponse = await fetch('/api/stats');
        const statsResult = await statsResponse.json();
        
        if (statsResult.success) {
          setStats(statsResult.stats);
          
          // Process suspicious accounts data
          if (statsResult.stats.topSuspiciousAccounts) {
            const accountsData = statsResult.stats.topSuspiciousAccounts.map(account => ({
              account_id: account._id,
              count: account.count,
              totalAmount: Math.round(account.totalAmount),
              avgAmount: Math.round(account.avgAmount)
            }));
            setSuspiciousAccountsData(accountsData);
          }
          
          // Process keywords data
          if (statsResult.stats.topKeywords) {
            const keywordsData = statsResult.stats.topKeywords.map(keyword => ({
              keyword: keyword._id,
              count: keyword.count
            }));
            setKeywordData(keywordsData);
          }
        }

        // Fetch transactions
        const transactionsResponse = await fetch('/api/transactions/list');
        const transactionsResult = await transactionsResponse.json();
        
        if (transactionsResult.success) {
          setTransactions(transactionsResult.transactions);
          processChartData(transactionsResult.transactions);
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Reprocess time series data when time period changes
  useEffect(() => {
    if (transactions.length > 0) {
      processChartData(transactions);
    }
  }, [timePeriod, transactions]);

  const processChartData = (transactions) => {
    if (!transactions || !Array.isArray(transactions)) {
      setCountryData([]);
      setKeywordData([]);
      setTimeSeriesData([]);
      return;
    }

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
          if (rule.rule === 'Suspicious keyword' && rule.details) {
            const keyword = rule.details.replace('Found keyword: "', '').replace('"', '');
            if (keyword && keyword !== rule.details) { // Ensure replacement worked
              keywordCounts[keyword] = (keywordCounts[keyword] || 0) + 1;
            }
          }
        });
      }
    });

    const keywordData = Object.entries(keywordCounts)
      .map(([keyword, count]) => ({ keyword, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    setKeywordData(keywordData);

    // Time series analysis based on selected period
    const timeData = {};
    transactions.forEach(t => {
      const transactionDate = new Date(t.transaction_date);
      let periodKey;
      
      if (timePeriod === 'days') {
        periodKey = transactionDate.toISOString().split('T')[0]; // YYYY-MM-DD
      } else if (timePeriod === 'months') {
        periodKey = `${transactionDate.getFullYear()}-${String(transactionDate.getMonth() + 1).padStart(2, '0')}`; // YYYY-MM
      } else if (timePeriod === 'years') {
        periodKey = transactionDate.getFullYear().toString(); // YYYY
      }
      
      if (!timeData[periodKey]) {
        timeData[periodKey] = { 
          period: periodKey, 
          total: 0, 
          suspicious: 0,
          normal: 0,
          suspiciousRate: 0
        };
      }
      
      timeData[periodKey].total += 1;
      if (t.isSuspicious) {
        timeData[periodKey].suspicious += 1;
      } else {
        timeData[periodKey].normal += 1;
      }
    });

    // Calculate suspicious rates and format data
    const processedTimeData = Object.values(timeData).map(item => ({
      ...item,
      suspiciousRate: item.total > 0 ? ((item.suspicious / item.total) * 100).toFixed(1) : 0
    }));

    // Sort by period and limit based on time period
    let limit;
    if (timePeriod === 'days') {
      limit = 30; // Last 30 days
    } else if (timePeriod === 'months') {
      limit = 12; // Last 12 months
    } else {
      limit = 5; // Last 5 years
    }

    const timeSeriesData = processedTimeData
      .sort((a, b) => a.period.localeCompare(b.period))
      .slice(-limit);

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
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-lg text-gray-600">Loading dashboard...</span>
            </div>
          ) : (
            <>
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

          {/* Top Suspicious Accounts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">Top 5 Suspicious Accounts</h2>
              </div>
              <div className="p-6">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={suspiciousAccountsData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="account_id" 
                      angle={-45}
                      textAnchor="end"
                      height={80}
                    />
                    <YAxis />
                    <Tooltip 
                      formatter={(value, name) => [
                        name === 'count' ? `${value} transactions` : `$${value.toLocaleString()}`,
                        name === 'count' ? 'Suspicious Transactions' : 'Total Amount'
                      ]}
                    />
                    <Bar dataKey="count" fill="#EF4444" name="count" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">Account Details</h2>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {suspiciousAccountsData.length > 0 ? (
                    suspiciousAccountsData.map((account, index) => (
                      <div key={account.account_id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900">#{index + 1} {account.account_id}</p>
                          <p className="text-sm text-gray-600">{account.count} suspicious transactions</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-red-600">${account.totalAmount.toLocaleString()}</p>
                          <p className="text-xs text-gray-500">Avg: ${account.avgAmount.toLocaleString()}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-center py-8">No suspicious accounts found</p>
                  )}
                </div>
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
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-medium text-gray-900">Transaction Trends Over Time</h2>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setTimePeriod('days')}
                    className={`px-3 py-1 text-sm rounded-md ${
                      timePeriod === 'days' 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    Days
                  </button>
                  <button
                    onClick={() => setTimePeriod('months')}
                    className={`px-3 py-1 text-sm rounded-md ${
                      timePeriod === 'months' 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    Months
                  </button>
                  <button
                    onClick={() => setTimePeriod('years')}
                    className={`px-3 py-1 text-sm rounded-md ${
                      timePeriod === 'years' 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    Years
                  </button>
                </div>
              </div>
            </div>
            <div className="p-6">
              {timeSeriesData.length > 0 ? (
                <div>
                  <ResponsiveContainer width="100%" height={400}>
                    <LineChart data={timeSeriesData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="period" 
                        angle={timePeriod === 'days' ? -45 : 0}
                        textAnchor={timePeriod === 'days' ? 'end' : 'middle'}
                        height={timePeriod === 'days' ? 80 : 60}
                      />
                      <YAxis />
                      <Tooltip 
                        formatter={(value, name) => [
                          typeof value === 'number' ? value.toLocaleString() : value,
                          name === 'total' ? 'Total Transactions' :
                          name === 'suspicious' ? 'Suspicious Transactions' :
                          name === 'normal' ? 'Normal Transactions' :
                          name === 'suspiciousRate' ? 'Suspicious Rate (%)' : name
                        ]}
                        labelFormatter={(label) => {
                          if (timePeriod === 'days') {
                            return new Date(label).toLocaleDateString();
                          } else if (timePeriod === 'months') {
                            const [year, month] = label.split('-');
                            return new Date(year, month - 1).toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
                          } else {
                            return `Year ${label}`;
                          }
                        }}
                      />
                      <Line type="monotone" dataKey="total" stroke="#3B82F6" strokeWidth={2} name="total" />
                      <Line type="monotone" dataKey="suspicious" stroke="#EF4444" strokeWidth={2} name="suspicious" />
                      <Line type="monotone" dataKey="normal" stroke="#10B981" strokeWidth={2} name="normal" />
                    </LineChart>
                  </ResponsiveContainer>
                  
                  {/* Summary Stats */}
                  <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-600">Total Periods</p>
                      <p className="text-2xl font-semibold text-gray-900">{timeSeriesData.length}</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-600">Total Transactions</p>
                      <p className="text-2xl font-semibold text-blue-600">
                        {timeSeriesData.reduce((sum, item) => sum + item.total, 0).toLocaleString()}
                      </p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-600">Suspicious Transactions</p>
                      <p className="text-2xl font-semibold text-red-600">
                        {timeSeriesData.reduce((sum, item) => sum + item.suspicious, 0).toLocaleString()}
                      </p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-600">Avg Suspicious Rate</p>
                      <p className="text-2xl font-semibold text-yellow-600">
                        {timeSeriesData.length > 0 
                          ? (timeSeriesData.reduce((sum, item) => sum + parseFloat(item.suspiciousRate), 0) / timeSeriesData.length).toFixed(1)
                          : 0}%
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">No time series data available for the selected period</p>
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
            </>
          )}
        </main>
      </div>
    </>
  );
}

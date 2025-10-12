import Head from 'next/head';
import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import Papa from 'papaparse';
import ThemeToggle from '../../components/ThemeToggle';

export default function TransactionDashboard({ transactionId }) {
  const [transaction, setTransaction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [downloading, setDownloading] = useState(false);
  const [showDownloadMenu, setShowDownloadMenu] = useState(false);
  const contentRef = useRef(null);

  useEffect(() => {
    const fetchTransaction = async () => {
      try {
        console.log('Fetching transaction with ID:', transactionId);
        console.log('ID type:', typeof transactionId);
        const response = await fetch(`/api/transactions/${transactionId}`);
        const result = await response.json();
        
        console.log('Transaction API response:', result);
        
        if (result.success) {
          setTransaction(result.transaction);
        } else {
          console.error('Transaction not found:', result.error);
          setError(result.error || 'Transaction not found');
        }
      } catch (error) {
        console.error('Error fetching transaction:', error);
        setError('Failed to load transaction');
      } finally {
        setLoading(false);
      }
    };

    if (transactionId) {
      fetchTransaction();
    } else {
      console.error('No transaction ID provided');
      setError('No transaction ID provided');
      setLoading(false);
    }
  }, [transactionId]);

  // Close download menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showDownloadMenu && !event.target.closest('.download-menu')) {
        setShowDownloadMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDownloadMenu]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-300">Loading transaction details...</p>
        </div>
      </div>
    );
  }

  if (!transaction && !loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Transaction Not Found</h1>
          <p className="text-gray-600 dark:text-gray-300 mb-4">{error}</p>
          <Link href="/transactions" className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">
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

  // Download functions
  const downloadPDF = async () => {
    if (!contentRef.current) return;
    
    setDownloading(true);
    try {
      const canvas = await html2canvas(contentRef.current, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff'
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      // Zoom in by reducing the image width (making it appear larger)
      const imgWidth = 160; // Reduced from 210 for zoom effect
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      
      let position = 0;
      
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
      
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }
      
      const fileName = `transaction-analysis-${transaction.transaction_id || transactionId}.pdf`;
      pdf.save(fileName);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF. Please try again.');
    } finally {
      setDownloading(false);
    }
  };

  const downloadCSV = () => {
    if (!transaction) return;
    
    try {
      // Prepare transaction data for CSV
      const csvData = {
        'Transaction ID': transaction.transaction_id || 'N/A',
        'Account ID': transaction.account_id || 'N/A',
        'Transaction Date': transaction.transaction_date || 'N/A',
        'Originator Name': transaction.originator_name || 'N/A',
        'Originator Country': transaction.originator_country || 'N/A',
        'Beneficiary Name': transaction.beneficiary_name || 'N/A',
        'Beneficiary Country': transaction.beneficiary_country || 'N/A',
        'Amount': transaction.transaction_amount || 'N/A',
        'Currency': transaction.currency_code || 'N/A',
        'Amount USD': transaction.amount_usd || 'N/A',
        'Exchange Rate': transaction.usd_rate || 'N/A',
        'Payment Type': transaction.payment_type || 'N/A',
        'Payment Instruction': transaction.payment_instruction || 'N/A',
        'Risk Score': transaction.risk_score || 0,
        'Risk Level': transaction.risk_report?.risk_level || 'N/A',
        'Suspicious': transaction.isSuspicious ? 'Yes' : 'No',
        'Triggered Rules Count': transaction.triggered_rules?.length || 0,
        'Created At': transaction.created_at || 'N/A',
        'Updated At': transaction.updated_at || 'N/A'
      };

      // Add triggered rules details
      if (transaction.triggered_rules && transaction.triggered_rules.length > 0) {
        transaction.triggered_rules.forEach((rule, index) => {
          csvData[`Rule ${index + 1}`] = `${rule.rule} (${rule.score} points) - ${rule.details}`;
        });
      }

      // Add risk report details
      if (transaction.risk_report) {
        csvData['Investigation Required'] = transaction.risk_report.investigation_required ? 'Yes' : 'No';
        csvData['Priority'] = transaction.risk_report.priority || 'N/A';
        csvData['Recommendations'] = transaction.risk_report.recommendations?.join('; ') || 'N/A';
      }

      const csv = Papa.unparse([csvData]);
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      
      if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `transaction-analysis-${transaction.transaction_id || transactionId}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (error) {
      console.error('Error generating CSV:', error);
      alert('Error generating CSV. Please try again.');
    }
  };

  return (
    <>
      <Head>
        <title>Transaction Dashboard - AML Monitoring</title>
      </Head>

      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Header */}
        <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div>
                <Link href="/transactions" className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">← Back to Transactions</Link>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mt-2">Transaction Analysis</h1>
              </div>
              <div className="flex items-center space-x-4">
                <ThemeToggle />
                {/* Download Dropdown */}
                <div className="relative download-menu">
                  <button
                    onClick={() => setShowDownloadMenu(!showDownloadMenu)}
                    disabled={downloading}
                    className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${
                      downloading 
                        ? 'bg-gray-400 cursor-not-allowed' 
                        : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                    }`}
                  >
                    {downloading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Generating...
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Download
                        <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </>
                    )}
                  </button>
                  
                  {showDownloadMenu && !downloading && (
                    <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-700 rounded-md shadow-lg py-1 z-50 border border-gray-200 dark:border-gray-600">
                      <button
                        onClick={() => {
                          downloadPDF();
                          setShowDownloadMenu(false);
                        }}
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <svg className="w-4 h-4 mr-3 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Download as PDF
                      </button>
                      <button
                        onClick={() => {
                          downloadCSV();
                          setShowDownloadMenu(false);
                        }}
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <svg className="w-4 h-4 mr-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Download as CSV
                      </button>
                    </div>
                  )}
                </div>
                
                <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                  transaction.isSuspicious 
                    ? 'bg-red-100 text-red-800' 
                    : 'bg-green-100 text-green-800'
                }`}>
                  {transaction.isSuspicious ? 'Suspicious' : 'Normal'}
                </div>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Risk Score: {transaction.risk_score}
                </span>
              </div>
            </div>
          </div>
        </header>

        <main ref={contentRef} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Transaction Overview */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            {/* Transaction Details */}
            <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-700">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-medium text-gray-900 dark:text-white">Transaction Details</h2>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">Originator</h3>
                    <div className="space-y-2">
                      <p className="text-sm text-gray-900 dark:text-white"><strong>Name:</strong> {transaction.originator_name}</p>
                      <p className="text-sm text-gray-900 dark:text-white"><strong>Country:</strong> {transaction.originator_country}</p>
                      <p className="text-sm text-gray-900 dark:text-white"><strong>Address:</strong> {transaction.originator_address1}</p>
                      {transaction.originator_address2 && (
                        <p className="text-sm text-gray-900 dark:text-white">{transaction.originator_address2}</p>
                      )}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">Beneficiary</h3>
                    <div className="space-y-2">
                      <p className="text-sm text-gray-900 dark:text-white"><strong>Name:</strong> {transaction.beneficiary_name}</p>
                      <p className="text-sm text-gray-900 dark:text-white"><strong>Country:</strong> {transaction.beneficiary_country}</p>
                      <p className="text-sm text-gray-900 dark:text-white"><strong>Address:</strong> {transaction.beneficiary_address1}</p>
                      {transaction.beneficiary_address2 && (
                        <p className="text-sm text-gray-900 dark:text-white">{transaction.beneficiary_address2}</p>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">Payment Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <p className="text-sm text-gray-900 dark:text-white"><strong>Amount:</strong> {transaction.currency_code} {transaction.transaction_amount?.toLocaleString()}</p>
                      <p className="text-sm text-gray-900 dark:text-white"><strong>USD Equivalent:</strong> ${transaction.amount_usd?.toLocaleString()}</p>
                      <p className="text-sm text-gray-900 dark:text-white"><strong>Exchange Rate:</strong> {transaction.usd_rate?.toFixed(4)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-900 dark:text-white"><strong>Payment Type:</strong> {transaction.payment_type}</p>
                      <p className="text-sm text-gray-900 dark:text-white"><strong>Date:</strong> {new Date(transaction.transaction_date).toLocaleDateString()}</p>
                    </div>
                  </div>
                  {transaction.payment_instruction && (
                    <div className="mt-4">
                      <p className="text-sm text-gray-900 dark:text-white"><strong>Payment Instruction:</strong></p>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 p-3 bg-gray-50 dark:bg-gray-700 rounded">{transaction.payment_instruction}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Risk Assessment */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-700">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-medium text-gray-900 dark:text-white">Risk Assessment</h2>
              </div>
              <div className="p-6">
                <div className="text-center mb-6">
                  <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full text-2xl font-bold ${
                    transaction.isSuspicious ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'
                  }`}>
                    {transaction.risk_score}
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Risk Score</p>
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
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-700">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-medium text-gray-900 dark:text-white">Rule Breakdown</h2>
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
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-700">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-medium text-gray-900 dark:text-white">Triggered Rules</h2>
              </div>
              <div className="p-6">
                {ruleBreakdown.length > 0 ? (
                  <div className="space-y-4">
                    {ruleBreakdown.map((rule, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="text-sm font-medium text-gray-900 dark:text-white">{rule.name}</h3>
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
                    <p className="text-gray-500 dark:text-gray-400">No rules triggered</p>
                    <p className="text-sm text-gray-400 dark:text-gray-500">This transaction appears to be normal</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Risk Factors Analysis */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-700">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white">Risk Factors Analysis</h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                {/* High-Risk Country Check */}
                <div className="text-center">
                  <div className={`w-12 h-12 rounded-full mx-auto mb-2 flex items-center justify-center ${
                    transaction.triggered_rules?.some(rule => rule.rule === 'High-risk country') 
                      ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'
                  }`}>
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Country Risk</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {transaction.triggered_rules?.some(rule => rule.rule === 'High-risk country') ? 'High Risk' : 'Normal'}
                  </p>
                </div>

                {/* Amount Check */}
                <div className="text-center">
                  <div className={`w-12 h-12 rounded-full mx-auto mb-2 flex items-center justify-center ${
                    transaction.triggered_rules?.some(rule => rule.rule === 'High amount') 
                      ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'
                  }`}>
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                  </div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Amount</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {transaction.triggered_rules?.some(rule => rule.rule === 'High amount') ? 'High Value' : 'Normal'}
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
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Keywords</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {transaction.triggered_rules?.some(rule => rule.rule === 'Suspicious keyword') ? 'Suspicious' : 'Clean'}
                  </p>
                </div>

                {/* Structuring Check */}
                <div className="text-center">
                  <div className={`w-12 h-12 rounded-full mx-auto mb-2 flex items-center justify-center ${
                    transaction.triggered_rules?.some(rule => rule.rule === 'Structuring pattern') 
                      ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'
                  }`}>
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Structuring</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {transaction.triggered_rules?.some(rule => rule.rule === 'Structuring pattern') ? 'Detected' : 'Normal'}
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
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Rounded</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {transaction.triggered_rules?.some(rule => rule.rule === 'Rounded amount') ? 'Rounded' : 'Normal'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Recommendations */}
          <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-700">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white">Recommendations</h2>
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

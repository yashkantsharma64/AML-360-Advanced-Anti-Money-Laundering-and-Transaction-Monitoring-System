import Head from 'next/head';
import Link from 'next/link';
import { useState, useRef } from 'react';
import Papa from 'papaparse';
import { RiskScoringEngine } from '../lib/aml-engine-client';

export default function CSVUpload() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const riskEngine = new RiskScoringEngine();

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type === 'text/csv') {
      setFile(selectedFile);
      setError('');
    } else {
      setError('Please select a valid CSV file');
    }
  };

  const processTransaction = async (row) => {
    try {
      // Convert date format from DD-MM-YYYY to YYYY-MM-DD
      const convertDateFormat = (dateStr) => {
        if (!dateStr) return dateStr;
        
        console.log('Converting date:', dateStr);
        
        // Check if date is in DD-MM-YYYY format
        const ddmmyyyyPattern = /^(\d{2})-(\d{2})-(\d{4})$/;
        const match = dateStr.toString().match(ddmmyyyyPattern);
        
        if (match) {
          const [, day, month, year] = match;
          const formatted = `${year}-${month}-${day}`;
          console.log('Date converted from', dateStr, 'to', formatted);
          return formatted;
        }
        
        // If already in YYYY-MM-DD format, return as is
        console.log('Date already in correct format:', dateStr);
        return dateStr;
      };

      const formattedDate = convertDateFormat(row.transaction_date);
      console.log('Final formatted date:', formattedDate);

      // Convert amount to USD using server-side API
      let amountUsd = parseFloat(row.transaction_amount);
      
      try {
        const response = await fetch('/api/convert-currency', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            amount: parseFloat(row.transaction_amount),
            fromCurrency: row.currency_code,
            toCurrency: 'USD',
            date: formattedDate
          }),
        });
        
        const result = await response.json();
        if (result.success) {
          amountUsd = result.convertedAmount;
        } else {
          console.error('Currency conversion failed:', result.error);
          // Use original amount as fallback
          amountUsd = parseFloat(row.transaction_amount);
        }
      } catch (error) {
        console.error('Currency conversion error:', error);
        // Use original amount as fallback
        amountUsd = parseFloat(row.transaction_amount);
      }

      // Calculate risk score
      const transactionForRisk = {
        ...row,
        transaction_amount: parseFloat(row.transaction_amount),
        amount_usd: amountUsd
      };
      
      console.log('Transaction for risk scoring:', transactionForRisk);
      console.log('Amount USD:', amountUsd);
      console.log('Beneficiary country:', row.beneficiary_country);
      
      const riskResult = await riskEngine.calculateRiskScore(transactionForRisk);
      
      console.log('Risk result:', riskResult);

      return {
        ...row,
        transaction_date: formattedDate, // Use formatted date
        transaction_amount: parseFloat(row.transaction_amount),
        amount_usd: amountUsd,
        usd_rate: amountUsd / parseFloat(row.transaction_amount),
        risk_score: riskResult.totalScore,
        triggered_rules: riskResult.triggeredRules,
        isSuspicious: riskResult.isSuspicious
      };
    } catch (err) {
      console.error('Error processing transaction:', err);
      return null;
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a CSV file');
      return;
    }

    setLoading(true);
    setError('');
    setResults(null);

    try {
      Papa.parse(file, {
        header: false, // Don't use first row as headers
        skipEmptyLines: true,
        complete: async (results) => {
          console.log('CSV parsing results:', results);
          console.log('First few rows:', results.data.slice(0, 3));
          
          if (results.errors.length > 0) {
            setError('CSV parsing errors: ' + results.errors.map(e => e.message).join(', '));
            setLoading(false);
            return;
          }

          // Map CSV columns to expected field names
          // Based on your CSV structure: transaction_id, account_id, transaction_date, originator_name, originator_address1, originator_address2, originator_country, beneficiary_name, beneficiary_address1, beneficiary_address2, beneficiary_country, transaction_amount, currency_code, payment_instruction, payment_type
          const mapRowToTransaction = (row) => {
            if (!row || row.length < 15) return null;
            
            return {
              transaction_id: row[0],
              account_id: row[1],
              transaction_date: row[2],
              originator_name: row[3],
              originator_address1: row[4],
              originator_address2: row[5],
              originator_country: row[6],
              beneficiary_name: row[7],
              beneficiary_address1: row[8],
              beneficiary_address2: row[9],
              beneficiary_country: row[10],
              transaction_amount: row[11],
              currency_code: row[12],
              payment_instruction: row[13],
              payment_type: row[14]
            };
          };

          const transactions = results.data
            .map(mapRowToTransaction)
            .filter(row => {
              if (!row) return false;
              
              // Check if row has required fields and is not empty
              const hasRequiredFields = row.transaction_amount && 
                                      row.currency_code && 
                                      row.transaction_date &&
                                      row.originator_name &&
                                      row.beneficiary_name;
              
              // Check if row has actual data (not just empty strings)
              const hasData = Object.values(row).some(value => 
                value && value.toString().trim() !== ''
              );
              
              console.log('Row check:', {
                row: row,
                hasRequiredFields,
                hasData,
                transaction_amount: row.transaction_amount,
                currency_code: row.currency_code,
                transaction_date: row.transaction_date
              });
              
              return hasRequiredFields && hasData;
            });

          if (transactions.length === 0) {
            setError('No valid transactions found in CSV');
            setLoading(false);
            return;
          }

          // Process transactions in batches to avoid overwhelming the API
          const batchSize = 10;
          const processedTransactions = [];
          let suspiciousCount = 0;

          for (let i = 0; i < transactions.length; i += batchSize) {
            const batch = transactions.slice(i, i + batchSize);
            const batchPromises = batch.map(processTransaction);
            const batchResults = await Promise.all(batchPromises);
            
            const validResults = batchResults.filter(t => t !== null);
            processedTransactions.push(...validResults);
            
            suspiciousCount += validResults.filter(t => t.isSuspicious).length;
            
            // Add delay between batches to respect API limits
            if (i + batchSize < transactions.length) {
              await new Promise(resolve => setTimeout(resolve, 1000));
            }
          }

          // Save all transactions to MongoDB via API
          const savedTransactions = [];
          for (const transaction of processedTransactions) {
            try {
              const response = await fetch('/api/transactions', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify(transaction),
              });
              
              const result = await response.json();
              if (result.success) {
                savedTransactions.push(result.transaction);
              } else {
                console.error('Failed to save transaction:', result.error);
              }
            } catch (error) {
              console.error('Error saving transaction:', error);
            }
          }

          setResults({
            total: savedTransactions.length,
            suspicious: suspiciousCount,
            normal: savedTransactions.length - suspiciousCount,
            transactions: savedTransactions.slice(0, 10) // Show first 10 for preview
          });
        },
        error: (error) => {
          setError('Error parsing CSV: ' + error.message);
        }
      });
    } catch (err) {
      setError('Error processing file: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.type === 'text/csv') {
      setFile(droppedFile);
      setError('');
    } else {
      setError('Please drop a valid CSV file');
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  return (
    <>
      <Head>
        <title>CSV Upload - AML Monitoring</title>
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div>
                <Link href="/" className="text-blue-600 hover:text-blue-800">← Back to Home</Link>
                <h1 className="text-3xl font-bold text-gray-900 mt-2">CSV Upload</h1>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Upload Transaction CSV</h2>
              <p className="text-sm text-gray-600 mt-1">
                Upload a CSV file with transaction data for batch processing and risk analysis.
              </p>
            </div>

            <div className="p-6">
              {/* File Upload Area */}
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center ${
                  file ? 'border-green-300 bg-green-50' : 'border-gray-300'
                }`}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
              >
                {file ? (
                  <div>
                    <svg className="w-12 h-12 text-green-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-lg font-medium text-green-800">{file.name}</p>
                    <p className="text-sm text-green-600">File selected successfully</p>
                    <button
                      onClick={() => {
                        setFile(null);
                        fileInputRef.current.value = '';
                      }}
                      className="mt-2 text-sm text-red-600 hover:text-red-800"
                    >
                      Remove file
                    </button>
                  </div>
                ) : (
                  <div>
                    <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <p className="text-lg font-medium text-gray-900 mb-2">Drop your CSV file here</p>
                    <p className="text-sm text-gray-600 mb-4">or</p>
                    <button
                      onClick={() => fileInputRef.current.click()}
                      className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                    >
                      Browse Files
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".csv"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                  </div>
                )}
              </div>

              {/* CSV Format Info */}
              <div className="mt-6 bg-blue-50 border border-blue-200 rounded-md p-4">
                <h3 className="text-sm font-medium text-blue-800 mb-2">Expected CSV Format</h3>
                <p className="text-sm text-blue-700 mb-2">
                  Your CSV should include the following columns:
                </p>
                <div className="text-xs text-blue-600 font-mono">
                  transaction_date, originator_name, originator_address1, originator_address2, originator_country,<br/>
                  beneficiary_name, beneficiary_address1, beneficiary_address2, beneficiary_country,<br/>
                  transaction_amount, currency_code, payment_instruction, payment_type
                </div>
              </div>

              {/* Upload Button */}
              <div className="mt-6">
                <button
                  onClick={handleUpload}
                  disabled={!file || loading}
                  className="w-full bg-green-600 text-white py-3 px-4 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Processing...' : 'Process Transactions'}
                </button>
              </div>

              {/* Error Display */}
              {error && (
                <div className="mt-6 bg-red-50 border border-red-200 rounded-md p-4">
                  <p className="text-red-800">{error}</p>
                </div>
              )}

              {/* Results Display */}
              {results && (
                <div className="mt-6">
                  <div className="bg-green-50 border border-green-200 rounded-md p-6">
                    <div className="flex items-center mb-4">
                      <svg className="w-6 h-6 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <h3 className="text-lg font-medium text-green-800">Processing Complete</h3>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-gray-900">{results.total}</p>
                        <p className="text-sm text-gray-600">Total Transactions</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-red-600">{results.suspicious}</p>
                        <p className="text-sm text-gray-600">Suspicious</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-green-600">{results.normal}</p>
                        <p className="text-sm text-gray-600">Normal</p>
                      </div>
                    </div>

                    {/* Sample Transactions */}
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-3">Sample Processed Transactions:</h4>
                      <div className="space-y-2">
                        {results.transactions.map((transaction, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-white rounded border">
                            <div>
                              <p className="text-sm font-medium text-gray-900">
                                {transaction.originator_name} → {transaction.beneficiary_name}
                              </p>
                              <p className="text-xs text-gray-600">
                                ${transaction.amount_usd.toLocaleString()} | {transaction.beneficiary_country}
                              </p>
                            </div>
                            <div className="flex items-center">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                transaction.isSuspicious 
                                  ? 'bg-red-100 text-red-800' 
                                  : 'bg-green-100 text-green-800'
                              }`}>
                                Score: {transaction.risk_score}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="mt-6 flex space-x-4">
                      <Link href="/transactions" className="text-blue-600 hover:text-blue-800">
                        View All Transactions →
                      </Link>
                      <Link href="/dashboard" className="text-blue-600 hover:text-blue-800">
                        View Dashboard →
                      </Link>
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

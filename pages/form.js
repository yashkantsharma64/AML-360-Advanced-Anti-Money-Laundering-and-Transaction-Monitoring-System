import Head from 'next/head';
import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { ExchangeRateAPI, RiskScoringEngine } from '../lib/aml-engine-client';
import ThemeToggle from '../components/ThemeToggle';

export default function TransactionForm() {
  const [formData, setFormData] = useState({
    transaction_date: '',
    account_id: '',
    originator_name: '',
    originator_address1: '',
    originator_address2: '',
    originator_address3: '',
    originator_country: '',
    beneficiary_name: '',
    beneficiary_address1: '',
    beneficiary_address2: '',
    beneficiary_address3: '',
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
      
      console.log('Form submission debug:', {
        originalAmount: formData.transaction_amount,
        parsedAmount: parseFloat(formData.transaction_amount),
        currency: formData.currency_code,
        date: formData.transaction_date,
        amountUsd: amountUsd,
        amountUsdType: typeof amountUsd
      });

      // Calculate risk score
      const riskResult = await riskEngine.calculateRiskScore({
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

      // Save to database via API
      const response = await fetch('/api/transactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(transaction),
      });

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to save transaction');
      }

      setResult(result.transaction);
    } catch (err) {
      setError('Error processing transaction: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const currencies = [
    { code: 'USD', name: 'US Dollar' },
    { code: 'EUR', name: 'Euro' },
    { code: 'GBP', name: 'British Pound' },
    { code: 'INR', name: 'Indian Rupee' },
    { code: 'CNY', name: 'Chinese Yuan' },
    { code: 'JPY', name: 'Japanese Yen' },
    { code: 'AED', name: 'UAE Dirham' },
    { code: 'BRL', name: 'Brazilian Real' },
    { code: 'CAD', name: 'Canadian Dollar' },
    { code: 'AUD', name: 'Australian Dollar' },
    { code: 'CHF', name: 'Swiss Franc' },
    { code: 'SGD', name: 'Singapore Dollar' },
    { code: 'HKD', name: 'Hong Kong Dollar' },
    { code: 'SEK', name: 'Swedish Krona' },
    { code: 'NOK', name: 'Norwegian Krone' },
    { code: 'DKK', name: 'Danish Krone' },
    { code: 'PLN', name: 'Polish Zloty' },
    { code: 'CZK', name: 'Czech Koruna' },
    { code: 'HUF', name: 'Hungarian Forint' },
    { code: 'RUB', name: 'Russian Ruble' }
  ];

  const countries = [
    { code: 'US', name: 'United States' },
    { code: 'GB', name: 'United Kingdom' },
    { code: 'DE', name: 'Germany' },
    { code: 'FR', name: 'France' },
    { code: 'CA', name: 'Canada' },
    { code: 'AU', name: 'Australia' },
    { code: 'IN', name: 'India' },
    { code: 'CN', name: 'China' },
    { code: 'JP', name: 'Japan' },
    { code: 'AE', name: 'United Arab Emirates' },
    { code: 'BR', name: 'Brazil' },
    { code: 'MX', name: 'Mexico' },
    { code: 'RU', name: 'Russia' },
    { code: 'IR', name: 'Iran' },
    { code: 'KP', name: 'North Korea' },
    { code: 'SY', name: 'Syria' },
    { code: 'CU', name: 'Cuba' },
    { code: 'IT', name: 'Italy' },
    { code: 'ES', name: 'Spain' },
    { code: 'NL', name: 'Netherlands' },
    { code: 'BE', name: 'Belgium' },
    { code: 'CH', name: 'Switzerland' },
    { code: 'AT', name: 'Austria' },
    { code: 'SE', name: 'Sweden' },
    { code: 'NO', name: 'Norway' },
    { code: 'DK', name: 'Denmark' },
    { code: 'FI', name: 'Finland' },
    { code: 'PL', name: 'Poland' },
    { code: 'CZ', name: 'Czech Republic' },
    { code: 'HU', name: 'Hungary' },
    { code: 'SG', name: 'Singapore' },
    { code: 'HK', name: 'Hong Kong' },
    { code: 'KR', name: 'South Korea' },
    { code: 'TH', name: 'Thailand' },
    { code: 'MY', name: 'Malaysia' },
    { code: 'ID', name: 'Indonesia' },
    { code: 'PH', name: 'Philippines' },
    { code: 'VN', name: 'Vietnam' },
    { code: 'ZA', name: 'South Africa' },
    { code: 'EG', name: 'Egypt' },
    { code: 'NG', name: 'Nigeria' },
    { code: 'KE', name: 'Kenya' },
    { code: 'AR', name: 'Argentina' },
    { code: 'CL', name: 'Chile' },
    { code: 'CO', name: 'Colombia' },
    { code: 'PE', name: 'Peru' },
    { code: 'VE', name: 'Venezuela' }
  ];

  const [currencySearch, setCurrencySearch] = useState('');
  const [originatorCountrySearch, setOriginatorCountrySearch] = useState('');
  const [beneficiaryCountrySearch, setBeneficiaryCountrySearch] = useState('');
  const [showCurrencyDropdown, setShowCurrencyDropdown] = useState(false);
  const [showOriginatorCountryDropdown, setShowOriginatorCountryDropdown] = useState(false);
  const [showBeneficiaryCountryDropdown, setShowBeneficiaryCountryDropdown] = useState(false);

  // Refs for dropdowns
  const currencyDropdownRef = useRef(null);
  const originatorCountryDropdownRef = useRef(null);
  const beneficiaryCountryDropdownRef = useRef(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (currencyDropdownRef.current && !currencyDropdownRef.current.contains(event.target)) {
        setShowCurrencyDropdown(false);
      }
      if (originatorCountryDropdownRef.current && !originatorCountryDropdownRef.current.contains(event.target)) {
        setShowOriginatorCountryDropdown(false);
      }
      if (beneficiaryCountryDropdownRef.current && !beneficiaryCountryDropdownRef.current.contains(event.target)) {
        setShowBeneficiaryCountryDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Filter functions
  const filteredCurrencies = currencies.filter(currency =>
    currency.code.toLowerCase().includes(currencySearch.toLowerCase()) ||
    currency.name.toLowerCase().includes(currencySearch.toLowerCase())
  );

  const filteredOriginatorCountries = countries.filter(country =>
    country.code.toLowerCase().includes(originatorCountrySearch.toLowerCase()) ||
    country.name.toLowerCase().includes(originatorCountrySearch.toLowerCase())
  );

  const filteredBeneficiaryCountries = countries.filter(country =>
    country.code.toLowerCase().includes(beneficiaryCountrySearch.toLowerCase()) ||
    country.name.toLowerCase().includes(beneficiaryCountrySearch.toLowerCase())
  );

  const handleCurrencySelect = (currency) => {
    setFormData(prev => ({ ...prev, currency_code: currency.code }));
    setCurrencySearch(currency.code);
    setShowCurrencyDropdown(false);
  };

  const handleOriginatorCountrySelect = (country) => {
    setFormData(prev => ({ ...prev, originator_country: country.code }));
    setOriginatorCountrySearch(country.code);
    setShowOriginatorCountryDropdown(false);
  };

  const handleBeneficiaryCountrySelect = (country) => {
    setFormData(prev => ({ ...prev, beneficiary_country: country.code }));
    setBeneficiaryCountrySearch(country.code);
    setShowBeneficiaryCountryDropdown(false);
  };

  return (
    <>
      <Head>
        <title>Add Transaction - AML Monitoring</title>
      </Head>

      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Header */}
        <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div>
                <Link href="/" className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">← Back to Home</Link>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mt-2">Add Transaction</h1>
              </div>
              <div className="flex space-x-4">
                <ThemeToggle />
                <Link href="/transactions" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                  View Transactions
                </Link>
                <Link href="/upload" className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
                  Upload CSV
                </Link>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-700">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white">Transaction Details</h2>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Transaction Date, Account ID & Amount */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Transaction Date *
                  </label>
                  <input
                    type="date"
                    name="transaction_date"
                    value={formData.transaction_date}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Account ID *
                  </label>
                  <input
                    type="text"
                    name="account_id"
                    value={formData.account_id}
                    onChange={handleInputChange}
                    required
                    placeholder="e.g., ACC1234"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Amount *
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
              </div>

              {/* Currency & Payment Type */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Currency *
                  </label>
                  <div className="relative" ref={currencyDropdownRef}>
                    <input
                      type="text"
                      value={currencySearch}
                      onChange={(e) => {
                        setCurrencySearch(e.target.value);
                        setShowCurrencyDropdown(true);
                      }}
                      onFocus={() => setShowCurrencyDropdown(true)}
                      placeholder="Type currency code (e.g., USD, INR)"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {showCurrencyDropdown && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                        {filteredCurrencies.map(currency => (
                          <div
                            key={currency.code}
                            onClick={() => handleCurrencySelect(currency)}
                            className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                          >
                            <span className="font-medium">{currency.code}</span> - {currency.name}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
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

              {/* Originator Information */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Originator Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Name *
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
                      Country *
                    </label>
                    <div className="relative" ref={originatorCountryDropdownRef}>
                      <input
                        type="text"
                        value={originatorCountrySearch}
                        onChange={(e) => {
                          setOriginatorCountrySearch(e.target.value);
                          setShowOriginatorCountryDropdown(true);
                        }}
                        onFocus={() => setShowOriginatorCountryDropdown(true)}
                        placeholder="Type country code (e.g., US, IN)"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      {showOriginatorCountryDropdown && (
                        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                          {filteredOriginatorCountries.map(country => (
                            <div
                              key={country.code}
                              onClick={() => handleOriginatorCountrySelect(country)}
                              className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                            >
                              <span className="font-medium">{country.code}</span> - {country.name}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Address Line 1 *
                    </label>
                    <input
                      type="text"
                      name="originator_address1"
                      value={formData.originator_address1}
                      onChange={handleInputChange}
                      required
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
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Address Line 3
                    </label>
                    <input
                      type="text"
                      name="originator_address3"
                      value={formData.originator_address3}
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
                      Name *
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
                      Country *
                    </label>
                    <div className="relative" ref={beneficiaryCountryDropdownRef}>
                      <input
                        type="text"
                        value={beneficiaryCountrySearch}
                        onChange={(e) => {
                          setBeneficiaryCountrySearch(e.target.value);
                          setShowBeneficiaryCountryDropdown(true);
                        }}
                        onFocus={() => setShowBeneficiaryCountryDropdown(true)}
                        placeholder="Type country code (e.g., US, IN)"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      {showBeneficiaryCountryDropdown && (
                        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                          {filteredBeneficiaryCountries.map(country => (
                            <div
                              key={country.code}
                              onClick={() => handleBeneficiaryCountrySelect(country)}
                              className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                            >
                              <span className="font-medium">{country.code}</span> - {country.name}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Address Line 1 *
                    </label>
                    <input
                      type="text"
                      name="beneficiary_address1"
                      value={formData.beneficiary_address1}
                      onChange={handleInputChange}
                      required
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
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Address Line 3
                    </label>
                    <input
                      type="text"
                      name="beneficiary_address3"
                      value={formData.beneficiary_address3}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Payment Information */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Payment Information</h3>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Payment Instruction *
                  </label>
                  <textarea
                    name="payment_instruction"
                    value={formData.payment_instruction}
                    onChange={handleInputChange}
                    required
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
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
                        ${result.amount_usd ? result.amount_usd.toLocaleString() : 'N/A'}
                      </p>
                    </div>
                  </div>

                  {result.triggered_rules && result.triggered_rules.length > 0 && (
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

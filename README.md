# AML Transaction Monitoring System

A comprehensive Next.js application for Anti-Money Laundering (AML) transaction monitoring and risk scoring.

## Features

### ✅ Core Functionality
- **Manual Transaction Entry**: Real-time risk assessment for individual transactions
- **CSV Upload**: Batch processing of multiple transactions
- **Rule-Based Scoring**: 5 comprehensive risk rules with configurable scoring
- **Exchange Rate Conversion**: Real-time USD conversion using ExchangeRate-API
- **Risk Assessment**: Automatic suspicious transaction detection
- **Interactive Dashboard**: Comprehensive analytics and visualization

### 🎯 Risk Scoring Rules
1. **High-Risk Country Check** (Score: 2-10)
   - Level 1: 2 points (Low-risk countries)
   - Level 2: 4 points (Medium-risk countries)  
   - Level 3: 10 points (High-risk countries)

2. **Suspicious Keywords** (Score: 3)
   - Detects 80+ suspicious keywords in payment instructions
   - Includes crypto, offshore, structuring, and fraud-related terms

3. **High Amount Transactions** (Score: 3)
   - Flags transactions over $1 million USD

4. **Structuring Detection** (Score: 5)
   - Identifies amounts in $8,000-$9,999 range (potential structuring)

5. **Rounded Amounts** (Score: 2)
   - Flags suspiciously round amounts (e.g., $1,000,000, $500,000)

### 📊 Dashboard Features
- **Transaction Volume Analysis**: Suspicious vs Normal transactions
- **Country Risk Heatmap**: Visual risk assessment by country
- **Keyword Analysis**: Top suspicious keywords detected
- **Time Series Trends**: Transaction patterns over time
- **Risk Factor Breakdown**: Detailed rule analysis per transaction

## Technology Stack

- **Frontend**: Next.js 14, React 18, Tailwind CSS
- **Charts**: Recharts for data visualization
- **Data Processing**: PapaParse for CSV handling
- **API Integration**: ExchangeRate-API for currency conversion
- **Storage**: LocalStorage (can be replaced with database)

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd aml-transaction-monitoring
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open in browser**
   ```
   http://localhost:3000
   ```

## Usage

### Manual Transaction Entry
1. Navigate to "Add Transaction" from the home page
2. Fill in transaction details (originator, beneficiary, amount, etc.)
3. System automatically converts to USD and calculates risk score
4. View detailed risk analysis and triggered rules

### CSV Upload
1. Navigate to "Upload CSV" from the home page
2. Upload CSV file with transaction data
3. System processes transactions in batches
4. View summary of processed transactions

### Transaction Monitoring
1. View all transactions in the transaction list
2. Filter by risk level, status, or search terms
3. Click "View Details" for comprehensive risk analysis
4. Monitor trends in the main dashboard

## File Structure

```
├── pages/
│   ├── index.js              # Home page with overview
│   ├── form.js               # Manual transaction entry
│   ├── upload.js             # CSV upload functionality
│   ├── transactions.js       # Transaction list view
│   ├── dashboard.js          # Main analytics dashboard
│   └── dashboard/
│       └── [id].js           # Individual transaction analysis
├── lib/
│   └── aml-engine.js         # Core AML logic and utilities
├── styles/
│   └── globals.css           # Global styles
└── fast-api/                 # Reference data files
    ├── sus_words.txt         # Suspicious keywords list
    └── country_list.txt      # Country risk levels
```

## API Integration

### Exchange Rate API
- **Provider**: ExchangeRate-API
- **API Key**: Configured in `lib/aml-engine.js`
- **Usage**: Real-time currency conversion to USD
- **Caching**: Built-in rate caching to minimize API calls

### Risk Data Sources
- **Suspicious Keywords**: Comprehensive list of 80+ AML-related terms
- **Country Risk Levels**: 3-tier risk classification system
- **Rule Engine**: Configurable scoring system

## Configuration

### Exchange Rate API Key
Update the API key in `lib/aml-engine.js`:
```javascript
const exchangeAPI = new ExchangeRateAPI('YOUR_API_KEY');
```

### Risk Rules
Modify risk scoring rules in `lib/aml-engine.js`:
- Adjust score thresholds
- Add new risk rules
- Modify country risk levels
- Update suspicious keywords list

## Data Storage

Currently uses LocalStorage for data persistence. To integrate with a database:

1. Replace `TransactionDatabase` class in `lib/aml-engine.js`
2. Implement database connection and CRUD operations
3. Update API endpoints for data retrieval

## Security Considerations

- **API Key Protection**: Store API keys securely
- **Data Encryption**: Implement encryption for sensitive data
- **Access Control**: Add authentication and authorization
- **Audit Logging**: Implement comprehensive logging
- **Rate Limiting**: Add API rate limiting

## Performance Optimization

- **Batch Processing**: CSV uploads processed in batches
- **API Caching**: Exchange rates cached to reduce API calls
- **Lazy Loading**: Charts and components loaded on demand
- **Data Pagination**: Large datasets paginated for performance

## Future Enhancements

- **Machine Learning**: ML-based anomaly detection
- **Real-time Streaming**: Live transaction monitoring
- **Advanced Analytics**: Predictive risk modeling
- **Mobile App**: React Native mobile application
- **API Integration**: Connect to external AML databases
- **Reporting**: Automated compliance reporting

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For questions or support, please contact the development team or create an issue in the repository.

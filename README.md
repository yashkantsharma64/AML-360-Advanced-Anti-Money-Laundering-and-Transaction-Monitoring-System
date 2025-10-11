# 🛡️ AML 360 - Advanced Anti-Money Laundering Transaction Monitoring System

<div align="center">

![AML 360 Logo](https://img.shields.io/badge/AML-360-blue?style=for-the-badge&logo=shield-check)
![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)
![React](https://img.shields.io/badge/React-18-blue?style=for-the-badge&logo=react)
![MongoDB](https://img.shields.io/badge/MongoDB-Database-green?style=for-the-badge&logo=mongodb)
![Python](https://img.shields.io/badge/Python-3.8+-yellow?style=for-the-badge&logo=python)

**A comprehensive, real-time AML transaction monitoring and risk scoring platform with advanced analytics, AI-powered chatbot, and intelligent fraud detection.**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](http://makeapullrequest.com)
[![Contributors](https://img.shields.io/github/contributors/your-org/aml-360)](https://github.com/your-org/aml-360/graphs/contributors)

</div>

---

## 📋 Table of Contents

- [🌟 Features](#-features)
- [🏗️ System Architecture](#️-system-architecture)
- [🔄 Data Flow](#-data-flow)
- [💻 Technology Stack](#-technology-stack)
- [🚀 Quick Start](#-quick-start)
- [⚙️ Installation](#️-installation)
- [🔧 Configuration](#-configuration)
- [📊 Usage Guide](#-usage-guide)
- [🤖 AI Chatbot](#-ai-chatbot)
- [📈 Analytics Dashboard](#-analytics-dashboard)
- [🔍 Risk Scoring Rules](#-risk-scoring-rules)
- [📁 Data Export](#-data-export)
- [🧪 API Documentation](#-api-documentation)
- [🐳 Docker Deployment](#-docker-deployment)
- [🤝 Contributing](#-contributing)
- [📄 License](#-license)

---

## 🌟 Features

### 🎯 Core AML Functionality
- **🔍 Real-time Risk Assessment** - Instant transaction analysis with hybrid rule-based + ML scoring
- **📊 Advanced Analytics Dashboard** - Comprehensive visualizations and trend analysis
- **🤖 AI-Powered Chatbot** - Natural language queries using RAG (Retrieval-Augmented Generation)
- **📈 Machine Learning Pipeline** - Advanced fraud detection with scikit-learn after rule-based filtering
- **🧠 Hybrid Risk Scoring** - Combines rule-based scoring with ML predictions for enhanced accuracy
- **🔄 Model Retraining** - Automated model updates with new transaction data
- **📊 Feature Engineering** - Advanced feature extraction for ML models
- **💱 Multi-Currency Support** - Real-time exchange rate conversion via ExchangeRate-API
- **📁 Bulk Data Processing** - CSV upload and batch transaction analysis
- **🔒 Secure Data Handling** - MongoDB integration with encrypted storage

### 📊 Analytics & Reporting
- **📈 Interactive Charts** - Recharts-powered visualizations
- **🌍 Country Risk Heatmap** - Geographic risk assessment
- **⏰ Time Series Analysis** - Transaction trends over days, months, and years
- **🔍 Keyword Analysis** - Suspicious keyword detection and frequency
- **👥 Account Monitoring** - Top suspicious accounts tracking
- **📋 Comprehensive Reports** - Detailed risk analysis per transaction

### 🔧 Advanced Features
- **📥 Smart Data Export** - Filtered dataset downloads by country and year
- **🧠 ML Model Training** - Continuous learning from transaction patterns
- **📊 Feature Engineering** - Advanced feature extraction for ML models
- **🎯 Model Validation** - Cross-validation and performance metrics
- **🔄 Model Retraining** - Automated model updates with new data
- **🌙 Dark/Light Theme** - Modern UI with theme switching
- **📱 Responsive Design** - Mobile-first approach with Tailwind CSS
- **⚡ Real-time Updates** - Live data synchronization
- **🔐 Role-based Access** - Secure user management
- **📊 Performance Monitoring** - System health and performance metrics

---

## 🏗️ System Architecture

```mermaid
graph TB
    subgraph "Frontend Layer"
        A[Next.js 14 App] --> B[React Components]
        B --> C[Tailwind CSS]
        B --> D[Recharts]
        B --> E[Theme Toggle]
    end
    
    subgraph "API Layer"
        F[Next.js API Routes] --> G[Transaction API]
        F --> H[Stats API]
        F --> I[Download API]
        F --> J[Filter API]
        F --> K[ML API]
    end
    
    subgraph "Business Logic"
        L[AML Engine] --> M[Rule-Based Scoring]
        L --> N[Currency Conversion]
        L --> O[Data Validation]
        M --> P[ML Pipeline]
        P --> Q[Feature Engineering]
        P --> R[Model Prediction]
        R --> S[Hybrid Risk Score]
    end
    
    subgraph "ML Pipeline"
        T[Scikit-learn] --> U[Random Forest]
        T --> V[Gradient Boosting]
        T --> W[Logistic Regression]
        U --> X[Model Ensemble]
        V --> X
        W --> X
        X --> Y[Risk Prediction]
    end
    
    subgraph "Data Layer"
        Z[MongoDB] --> AA[Transactions Collection]
        Z --> BB[Risk Reports Collection]
        Z --> CC[ML Models Collection]
        Z --> DD[Training Data Collection]
    end
    
    subgraph "External Services"
        EE[ExchangeRate-API] --> N
        FF[Ollama LLM] --> GG[AI Chatbot]
    end
    
    subgraph "File Processing"
        HH[CSV Upload] --> II[PapaParse]
        II --> JJ[Data Validation]
        JJ --> Z
    end
    
    A --> F
    F --> L
    L --> Z
    L --> EE
    GG --> Z
    P --> T
    T --> Z
    HH --> F
```

---

## 🔄 Data Flow

```mermaid
flowchart TD
    A[User Input] --> B{Input Type}
    B -->|Manual Entry| C[Transaction Form]
    B -->|CSV Upload| D[Bulk Upload]
    B -->|Chat Query| E[AI Chatbot]
    
    C --> F[Data Validation]
    D --> G[CSV Processing]
    E --> H[RAG Processing]
    
    F --> I[Currency Conversion]
    G --> I
    H --> J[Vector Search]
    
    I --> K[Rule-Based Risk Scoring]
    J --> L[LLM Response]
    
    K --> M[Rule Evaluation]
    M --> N[Rule Score Calculation]
    N --> O[Feature Engineering]
    
    O --> P[ML Model Prediction]
    P --> Q[ML Risk Score]
    Q --> R[Hybrid Score Combination]
    
    R --> S[Final Risk Score]
    S --> T[Database Storage]
    
    T --> U[Analytics Update]
    U --> V[Dashboard Refresh]
    
    L --> W[Chat Response]
    
    subgraph "Rule-Based Scoring"
        X[High-Risk Country]
        Y[Suspicious Keywords]
        Z[High Amount]
        AA[Structuring Detection]
        BB[Rounded Amounts]
    end
    
    subgraph "ML Pipeline"
        CC[Feature Extraction]
        DD[Model Ensemble]
        EE[Risk Prediction]
        FF[Confidence Score]
    end
    
    M --> X
    M --> Y
    M --> Z
    M --> AA
    M --> BB
    
    O --> CC
    CC --> DD
    DD --> EE
    EE --> FF
```

---

## 💻 Technology Stack

### Frontend
- **Framework**: Next.js 14 with App Router
- **UI Library**: React 18 with Hooks
- **Styling**: Tailwind CSS with Dark Mode
- **Charts**: Recharts for data visualization
- **State Management**: React Context API
- **File Processing**: PapaParse for CSV handling

### Backend
- **Runtime**: Node.js with Next.js API Routes
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT-based security
- **File Storage**: Local filesystem with MongoDB metadata

### AI & ML
- **LLM**: Ollama with Llama 3.1 8B model
- **Embeddings**: Sentence Transformers
- **ML Pipeline**: Scikit-learn with ensemble methods
- **Models**: Random Forest, Gradient Boosting, Logistic Regression
- **Feature Engineering**: Advanced feature extraction and selection
- **Model Training**: Automated retraining with new data
- **Vector Store**: FAISS for similarity search
- **Hybrid Scoring**: Rule-based + ML prediction combination

### External APIs
- **Currency**: ExchangeRate-API for real-time conversion
- **Risk Data**: Custom country risk levels
- **Keywords**: Comprehensive suspicious word database

### Development Tools
- **Package Manager**: npm
- **Linting**: ESLint with Next.js config
- **Formatting**: Prettier
- **Version Control**: Git
- **Deployment**: Vercel/Netlify ready

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- MongoDB (local or Atlas)
- Python 3.8+ (for AI chatbot)
- Ollama (for LLM functionality)

### 1. Clone the Repository
```bash
git clone https://github.com/your-org/aml-360.git
cd aml-360
```

### 2. Install Dependencies
```bash
# Install Node.js dependencies
npm install

# Install Python dependencies (for AI chatbot)
cd chatbot
pip install -r requirements_chatbot.txt
cd ..
```

### 3. Environment Setup
```bash
# Copy environment template
cp env.example .env.local

# Edit environment variables
nano .env.local
```

### 4. Start Services
```bash
# Start MongoDB (if local)
mongod

# Start Ollama (for AI chatbot)
ollama serve
ollama pull llama3.1:8b

# Start AI Chatbot API
cd chatbot
python api.py &

# Start Next.js application
cd ..
npm run dev
```

### 5. Access the Application
- **Main App**: http://localhost:3000
- **AI Chatbot API**: http://localhost:8001
- **API Documentation**: http://localhost:8001/docs

---

## ⚙️ Installation

### Detailed Installation Guide

#### 1. System Requirements
```bash
# Check Node.js version
node --version  # Should be 18+

# Check npm version
npm --version   # Should be 8+

# Check Python version
python --version  # Should be 3.8+

# Check MongoDB
mongod --version  # Should be 4.4+
```

#### 2. MongoDB Setup

**Option A: Local MongoDB**
```bash
# Ubuntu/Debian
sudo apt-get install mongodb

# macOS
brew install mongodb-community

# Windows
# Download from https://www.mongodb.com/try/download/community

# Start MongoDB
sudo systemctl start mongod
# or
mongod --dbpath /data/db
```

**Option B: MongoDB Atlas (Cloud)**
1. Create account at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a new cluster
3. Get connection string
4. Add to `.env.local`

#### 3. Ollama Setup (for AI Chatbot)
```bash
# Install Ollama
curl -fsSL https://ollama.ai/install.sh | sh

# Start Ollama service
ollama serve

# Pull required model
ollama pull llama3.1:8b

# Verify installation
ollama list
```

#### 4. Project Installation
```bash
# Clone repository
git clone https://github.com/your-org/aml-360.git
cd aml-360

# Install Node.js dependencies
npm install

# Install Python dependencies
cd chatbot
pip install -r requirements_chatbot.txt
cd ..

# Set up environment
cp env.example .env.local
```

---

## 🔧 Configuration

### Environment Variables

Create `.env.local` file:

```env
# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017
MONGODB_DB=aml_monitoring

# Exchange Rate API
EXCHANGE_RATE_API_KEY=your_api_key_here

# AI Chatbot Configuration
OLLAMA_MODEL=llama3.1:8b
OLLAMA_BASE_URL=http://localhost:11434

# Application Settings
NEXTAUTH_SECRET=your_secret_here
NEXTAUTH_URL=http://localhost:3000

# Optional: External Services
SENTRY_DSN=your_sentry_dsn
ANALYTICS_ID=your_analytics_id
```

### MongoDB Configuration

#### Indexes (Auto-created)
```javascript
// Transactions collection indexes
db.transactions.createIndex({ "account_key": 1 })
db.transactions.createIndex({ "transaction_date": 1 })
db.transactions.createIndex({ "isSuspicious": 1 })
db.transactions.createIndex({ "account_key": 1, "transaction_date": 1 })
db.transactions.createIndex({ "originator_country": 1 })
db.transactions.createIndex({ "beneficiary_country": 1 })
```

#### Collections Structure
```javascript
// Transactions collection
{
  _id: ObjectId,
  transaction_id: String,
  account_key: String,
  transaction_date: Date,
  originator_name: String,
  originator_country: String,
  beneficiary_name: String,
  beneficiary_country: String,
  transaction_amount: Number,
  currency_code: String,
  amount_usd: Number,
  risk_score: Number,
  isSuspicious: Boolean,
  triggered_rules: Array,
  created_at: Date,
  updated_at: Date
}
```

---

## 📊 Usage Guide

### 1. Manual Transaction Entry

1. **Navigate** to "Add Transaction" from the home page
2. **Fill in** transaction details:
   - Transaction ID and Account Key
   - Transaction Date and Amount
   - Originator Information
   - Beneficiary Information
   - Payment Details
3. **System automatically**:
   - Converts currency to USD
   - Applies rule-based risk scoring (0-50 points)
   - Extracts features for ML pipeline
   - Runs ML model prediction (0-50 points)
   - Combines scores for hybrid risk assessment
   - Determines final risk level and suspicious status
4. **View** detailed risk analysis including:
   - Rule-based score breakdown
   - ML prediction confidence
   - Feature importance scores
   - Triggered rules and ML insights

### 2. CSV Bulk Upload

1. **Navigate** to "Upload CSV" from the home page
2. **Prepare CSV** with required columns:
   ```csv
   transaction_id,account_key,transaction_date,originator_name,beneficiary_name,transaction_amount,currency_code,payment_type
   TXN001,ACC001,2024-01-15,John Doe,Jane Smith,5000,USD,SWIFT
   ```
3. **Upload** CSV file (drag & drop or browse)
4. **Preview** data before processing
5. **Process** transactions in batches with:
   - Rule-based risk scoring for each transaction
   - ML feature extraction and prediction
   - Hybrid score combination
   - Batch processing optimization
6. **View** summary of processed transactions including:
   - Overall risk distribution
   - ML model performance metrics
   - Feature importance analysis
   - Processing time and efficiency stats

### 3. Transaction Monitoring

1. **View** all transactions in the transaction list
2. **Filter** by:
   - Risk level (High, Medium, Low, Minimal)
   - Status (Suspicious, Normal)
   - Date range
   - Country
   - Amount range
   - ML confidence level
   - Rule vs ML score comparison
3. **Search** by transaction ID, account, or names
4. **Click** "View Details" for comprehensive risk analysis including:
   - Rule-based score breakdown
   - ML prediction details
   - Feature importance scores
   - Model confidence intervals
   - Historical risk trends
5. **Monitor** trends in the main dashboard with ML insights

### 4. Analytics Dashboard

1. **Overview Stats**: Total, suspicious, normal transactions with ML accuracy metrics
2. **Charts**: Volume analysis, distribution, trends with ML confidence intervals
3. **Country Analysis**: Risk heatmap and suspicious transactions with ML predictions
4. **Keyword Analysis**: Top suspicious keywords detected with ML feature importance
5. **Time Series**: Transaction patterns over time with ML trend analysis
6. **Account Monitoring**: Top suspicious accounts with ML risk profiling
7. **ML Performance**: Model accuracy, precision, recall, and F1-score metrics
8. **Feature Importance**: Top contributing features for ML predictions
9. **Model Comparison**: Rule-based vs ML scoring performance analysis

---

## 🤖 AI Chatbot

### Features
- **Natural Language Queries**: Ask questions about transaction data
- **RAG Integration**: Retrieval-Augmented Generation for accurate responses
- **CSV Upload**: Upload transaction data for analysis
- **Real-time Data**: Connect to MongoDB for live data
- **Source Attribution**: See which data sources were used

### Setup
```bash
# Start Ollama service
ollama serve

# Pull required model
ollama pull llama3.1:8b

# Start chatbot API
cd chatbot
python api.py
```

### Usage Examples
```
"Show me all suspicious transactions"
"What's the risk score for transaction ID XYZ?"
"How many transactions are from India?"
"Find transactions with amount greater than $10,000"
"What's the average risk score?"
"Which countries have the highest risk?"
```

### API Endpoints
- `POST /chat` - Send chat message
- `POST /upload-csv` - Upload CSV data
- `POST /refresh-data` - Refresh from MongoDB
- `GET /health` - Health check

---

## 📈 Analytics Dashboard

### Key Metrics
- **Total Transactions**: Overall transaction volume
- **Suspicious Rate**: Percentage of flagged transactions
- **Country Risk**: Geographic risk assessment
- **Time Trends**: Transaction patterns over time
- **Account Analysis**: Top suspicious accounts

### Visualizations
- **Bar Charts**: Transaction volume and distribution
- **Pie Charts**: Suspicious vs normal transactions
- **Line Charts**: Time series trends
- **Heatmaps**: Country risk visualization
- **Tables**: Detailed account information

### Filters
- **Time Period**: Days, months, years
- **Country**: Filter by specific countries
- **Risk Level**: Filter by risk scores
- **Date Range**: Custom date ranges

---

## 🔍 Hybrid Risk Scoring System

### Phase 1: Rule-Based Scoring (0-50 points)

#### 1. High-Risk Country Check (2-10 points)
```javascript
// Risk levels by country
const countryRiskLevels = {
  'US': 2,    // Low risk
  'CA': 2,    // Low risk
  'GB': 4,    // Medium risk
  'DE': 4,    // Medium risk
  'CN': 10,   // High risk
  'IR': 10,   // High risk
  'KP': 10    // High risk
};
```

#### 2. Suspicious Keywords (3 points)
- **Crypto-related**: bitcoin, cryptocurrency, crypto
- **Offshore**: offshore, tax haven, shell company
- **Structuring**: structuring, smurfing, layering
- **Fraud**: fraud, scam, money laundering
- **Total**: 80+ suspicious keywords

#### 3. High Amount Transactions (3 points)
- **Threshold**: $1,000,000 USD
- **Detection**: Automatic flagging of large amounts
- **Rationale**: Large transactions require additional scrutiny

#### 4. Structuring Detection (5 points)
- **Range**: $8,000 - $9,999 USD
- **Pattern**: Multiple transactions just under reporting threshold
- **Detection**: Account-based pattern analysis

#### 5. Rounded Amounts (2 points)
- **Pattern**: Suspiciously round amounts
- **Examples**: $1,000,000, $500,000, $100,000
- **Detection**: Mathematical pattern recognition

### Phase 2: Machine Learning Scoring (0-50 points)

#### Feature Engineering
```python
def extract_features(transaction):
    features = {
        # Transaction features
        'amount_usd': transaction['amount_usd'],
        'amount_log': np.log(transaction['amount_usd'] + 1),
        'hour_of_day': transaction['transaction_date'].hour,
        'day_of_week': transaction['transaction_date'].weekday(),
        'month': transaction['transaction_date'].month,
        
        # Country risk features
        'originator_country_risk': get_country_risk(transaction['originator_country']),
        'beneficiary_country_risk': get_country_risk(transaction['beneficiary_country']),
        'country_risk_diff': abs(originator_risk - beneficiary_risk),
        
        # Pattern features
        'is_weekend': transaction['transaction_date'].weekday() >= 5,
        'is_month_end': transaction['transaction_date'].day >= 28,
        'is_quarter_end': transaction['transaction_date'].month % 3 == 0,
        
        # Account features
        'account_transaction_count': get_account_count(transaction['account_key']),
        'account_avg_amount': get_account_avg_amount(transaction['account_key']),
        'account_risk_history': get_account_risk_history(transaction['account_key']),
        
        # Text features
        'payment_instruction_length': len(transaction['payment_instruction']),
        'has_suspicious_keywords': has_suspicious_keywords(transaction['payment_instruction']),
        'keyword_count': count_suspicious_keywords(transaction['payment_instruction']),
        
        # Temporal features
        'time_since_last_transaction': get_time_since_last(transaction['account_key']),
        'transactions_last_24h': get_recent_transactions(transaction['account_key'], hours=24),
        'transactions_last_7d': get_recent_transactions(transaction['account_key'], days=7),
    }
    return features
```

#### Model Ensemble
```python
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import cross_val_score
import joblib

class MLRiskScorer:
    def __init__(self):
        self.models = {
            'random_forest': RandomForestClassifier(n_estimators=100, random_state=42),
            'gradient_boosting': GradientBoostingClassifier(n_estimators=100, random_state=42),
            'logistic_regression': LogisticRegression(random_state=42, max_iter=1000)
        }
        self.feature_selector = None
        self.scaler = None
        
    def train(self, X, y):
        # Feature selection
        from sklearn.feature_selection import SelectKBest, f_classif
        self.feature_selector = SelectKBest(f_classif, k=20)
        X_selected = self.feature_selector.fit_transform(X, y)
        
        # Feature scaling
        from sklearn.preprocessing import StandardScaler
        self.scaler = StandardScaler()
        X_scaled = self.scaler.fit_transform(X_selected)
        
        # Train models
        for name, model in self.models.items():
            model.fit(X_scaled, y)
            
        # Cross-validation scores
        for name, model in self.models.items():
            scores = cross_val_score(model, X_scaled, y, cv=5)
            print(f"{name} CV Score: {scores.mean():.3f} (+/- {scores.std() * 2:.3f})")
    
    def predict_risk(self, transaction):
        features = extract_features(transaction)
        X = np.array([list(features.values())])
        
        # Apply feature selection and scaling
        X_selected = self.feature_selector.transform(X)
        X_scaled = self.scaler.transform(X_selected)
        
        # Get predictions from all models
        predictions = {}
        for name, model in self.models.items():
            prob = model.predict_proba(X_scaled)[0][1]  # Probability of being suspicious
            predictions[name] = prob
            
        # Ensemble prediction (weighted average)
        weights = {'random_forest': 0.4, 'gradient_boosting': 0.4, 'logistic_regression': 0.2}
        ensemble_score = sum(predictions[name] * weights[name] for name in predictions)
        
        # Convert to 0-50 scale
        ml_score = ensemble_score * 50
        
        return ml_score, predictions
```

### Phase 3: Hybrid Score Combination

#### Final Risk Score Calculation
```javascript
const calculateHybridRiskScore = async (transaction) => {
  // Phase 1: Rule-based scoring (0-50 points)
  let ruleScore = 0;
  
  // Country risk
  ruleScore += getCountryRisk(transaction.originator_country);
  ruleScore += getCountryRisk(transaction.beneficiary_country);
  
  // Keyword detection
  if (hasSuspiciousKeywords(transaction.payment_instruction)) {
    ruleScore += 3;
  }
  
  // High amount
  if (transaction.amount_usd > 1000000) {
    ruleScore += 3;
  }
  
  // Structuring detection
  if (isStructuringPattern(transaction)) {
    ruleScore += 5;
  }
  
  // Rounded amounts
  if (isRoundedAmount(transaction.amount_usd)) {
    ruleScore += 2;
  }
  
  // Cap rule score at 50
  ruleScore = Math.min(ruleScore, 50);
  
  // Phase 2: ML scoring (0-50 points)
  const mlResult = await mlRiskScorer.predictRisk(transaction);
  const mlScore = mlResult.score;
  const mlConfidence = mlResult.confidence;
  
  // Phase 3: Hybrid combination
  let finalScore;
  let riskLevel;
  
  if (ruleScore >= 30 || mlScore >= 30) {
    // High risk if either score is high
    finalScore = Math.max(ruleScore, mlScore);
    riskLevel = 'High';
  } else if (ruleScore >= 15 || mlScore >= 15) {
    // Medium risk if either score is medium
    finalScore = (ruleScore + mlScore) / 2;
    riskLevel = 'Medium';
  } else {
    // Low risk if both scores are low
    finalScore = (ruleScore + mlScore) / 2;
    riskLevel = 'Low';
  }
  
  // Determine if suspicious
  const isSuspicious = finalScore >= 25;
  
  return {
    finalScore: Math.round(finalScore),
    ruleScore: Math.round(ruleScore),
    mlScore: Math.round(mlScore),
    mlConfidence: mlConfidence,
    riskLevel: riskLevel,
    isSuspicious: isSuspicious,
    triggeredRules: getTriggeredRules(transaction),
    mlFeatures: mlResult.features
  };
};
```

### Model Performance Metrics
```python
# Model evaluation metrics
def evaluate_model_performance(y_true, y_pred, y_prob):
    from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, roc_auc_score
    
    metrics = {
        'accuracy': accuracy_score(y_true, y_pred),
        'precision': precision_score(y_true, y_pred),
        'recall': recall_score(y_true, y_pred),
        'f1_score': f1_score(y_true, y_pred),
        'roc_auc': roc_auc_score(y_true, y_prob)
    }
    
    return metrics

# Example performance results
performance_results = {
    'random_forest': {
        'accuracy': 0.892,
        'precision': 0.856,
        'recall': 0.834,
        'f1_score': 0.845,
        'roc_auc': 0.923
    },
    'gradient_boosting': {
        'accuracy': 0.901,
        'precision': 0.867,
        'recall': 0.851,
        'f1_score': 0.859,
        'roc_auc': 0.931
    },
    'logistic_regression': {
        'accuracy': 0.876,
        'precision': 0.834,
        'recall': 0.812,
        'f1_score': 0.823,
        'roc_auc': 0.898
    },
    'ensemble': {
        'accuracy': 0.915,
        'precision': 0.881,
        'recall': 0.867,
        'f1_score': 0.874,
        'roc_auc': 0.947
    }
}
```

---

## 📁 Data Export

### Download Features
- **Filter by Country**: Export transactions for specific countries
- **Filter by Year**: Export transactions for specific years
- **Multiple Formats**: CSV and JSON export
- **Smart Filenames**: Descriptive filenames with filters
- **Transaction Counts**: See how many records will be exported

### Usage
1. **Navigate** to Dashboard
2. **Select** country filter (optional)
3. **Select** year filter (optional)
4. **Choose** format (CSV or JSON)
5. **Click** Download button
6. **File** downloads automatically

### API Endpoints
```javascript
// Download filtered dataset
GET /api/download-dataset?country=US&year=2024&format=csv

// Get available filters
GET /api/dataset-filters
```

### File Formats

**CSV Format**:
```csv
transaction_id,account_key,transaction_date,originator_name,beneficiary_name,transaction_amount,currency_code,amount_usd,risk_score,isSuspicious
TXN001,ACC001,2024-01-15,John Doe,Jane Smith,5000,USD,5000,15,false
```

**JSON Format**:
```json
{
  "success": true,
  "count": 150,
  "filters": {
    "country": "US",
    "year": "2024"
  },
  "data": [
    {
      "transaction_id": "TXN001",
      "account_key": "ACC001",
      "transaction_date": "2024-01-15T00:00:00.000Z",
      "originator_name": "John Doe",
      "beneficiary_name": "Jane Smith",
      "transaction_amount": 5000,
      "currency_code": "USD",
      "amount_usd": 5000,
      "risk_score": 15,
      "isSuspicious": false
    }
  ]
}
```

---

## 🧪 API Documentation

### Core Endpoints

#### Transactions
```javascript
// Get all transactions
GET /api/transactions/all

// Get transaction by ID
GET /api/transactions/[id]

// Create new transaction
POST /api/transactions
Content-Type: application/json
{
  "transaction_id": "TXN001",
  "account_key": "ACC001",
  "transaction_date": "2024-01-15",
  "originator_name": "John Doe",
  "beneficiary_name": "Jane Smith",
  "transaction_amount": 5000,
  "currency_code": "USD"
}
```

#### Statistics
```javascript
// Get dashboard statistics
GET /api/stats

// Response
{
  "success": true,
  "stats": {
    "total": 1500,
    "suspicious": 150,
    "normal": 1350,
    "suspiciousRate": 10.0,
    "topSuspiciousAccounts": [...],
    "topKeywords": [...]
  }
}
```

#### Data Export
```javascript
// Download dataset
GET /api/download-dataset?country=US&year=2024&format=csv

// Get available filters
GET /api/dataset-filters

// Response
{
  "success": true,
  "data": {
    "countries": [
      {"code": "US", "name": "US", "count": 500},
      {"code": "CA", "name": "CA", "count": 300}
    ],
    "years": [
      {"year": 2024, "count": 800},
      {"year": 2023, "count": 700}
    ],
    "totalTransactions": 1500
  }
}
```

#### Currency Conversion
```javascript
// Convert currency
POST /api/convert-currency
Content-Type: application/json
{
  "amount": 1000,
  "from": "EUR",
  "to": "USD"
}

// Response
{
  "success": true,
  "converted_amount": 1085.50,
  "exchange_rate": 1.0855,
  "timestamp": "2024-01-15T10:30:00Z"
}
```

### AI Chatbot Endpoints

#### Chat
```javascript
// Send chat message
POST /chat
Content-Type: application/json
{
  "message": "Show me suspicious transactions"
}

// Response
{
  "response": "I found 150 suspicious transactions...",
  "sources": [
    {
      "type": "transaction",
      "id": "TXN001",
      "score": 0.95
    }
  ]
}
```

#### Data Management
```javascript
// Upload CSV
POST /upload-csv
Content-Type: multipart/form-data
file: [CSV file]

// Refresh data from MongoDB
POST /refresh-data

// Health check
GET /health
```

---

## 🐳 Docker Deployment

### Docker Compose Setup

Create `docker-compose.yml`:

```yaml
version: '3.8'

services:
  # MongoDB
  mongodb:
    image: mongo:6.0
    container_name: aml-mongodb
    restart: unless-stopped
    ports:
      - "27017:27017"
    environment:
      MONGO_INITDB_ROOT_USERNAME: admin
      MONGO_INITDB_ROOT_PASSWORD: password
    volumes:
      - mongodb_data:/data/db
    networks:
      - aml-network

  # Next.js Application
  aml-app:
    build: .
    container_name: aml-app
    restart: unless-stopped
    ports:
      - "3000:3000"
    environment:
      MONGODB_URI: mongodb://admin:password@mongodb:27017
      MONGODB_DB: aml_monitoring
      EXCHANGE_RATE_API_KEY: ${EXCHANGE_RATE_API_KEY}
    depends_on:
      - mongodb
    networks:
      - aml-network

  # AI Chatbot
  aml-chatbot:
    build: ./chatbot
    container_name: aml-chatbot
    restart: unless-stopped
    ports:
      - "8001:8001"
    environment:
      MONGODB_URI: mongodb://admin:password@mongodb:27017
      MONGODB_DB: aml_monitoring
      OLLAMA_BASE_URL: http://ollama:11434
    depends_on:
      - mongodb
      - ollama
    networks:
      - aml-network

  # Ollama LLM
  ollama:
    image: ollama/ollama:latest
    container_name: aml-ollama
    restart: unless-stopped
    ports:
      - "11434:11434"
    volumes:
      - ollama_data:/root/.ollama
    networks:
      - aml-network

volumes:
  mongodb_data:
  ollama_data:

networks:
  aml-network:
    driver: bridge
```

### Dockerfile

Create `Dockerfile`:

```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Build application
RUN npm run build

# Expose port
EXPOSE 3000

# Start application
CMD ["npm", "start"]
```

### Deployment Commands

```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Rebuild and restart
docker-compose up -d --build

# Scale services
docker-compose up -d --scale aml-app=3
```

### Environment Variables

Create `.env` file:

```env
# MongoDB
MONGO_INITDB_ROOT_USERNAME=admin
MONGO_INITDB_ROOT_PASSWORD=password

# Exchange Rate API
EXCHANGE_RATE_API_KEY=your_api_key_here

# Application
NEXTAUTH_SECRET=your_secret_here
NEXTAUTH_URL=http://localhost:3000
```

---

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

### Development Setup

1. **Fork** the repository
2. **Clone** your fork
3. **Create** a feature branch
4. **Make** your changes
5. **Test** thoroughly
6. **Submit** a pull request

### Code Style

- **ESLint**: Follow Next.js ESLint configuration
- **Prettier**: Use Prettier for code formatting
- **TypeScript**: Use TypeScript for new components
- **Testing**: Write tests for new features

### Pull Request Process

1. **Update** README.md if needed
2. **Add** tests for new functionality
3. **Ensure** all tests pass
4. **Update** documentation
5. **Submit** PR with clear description

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **Next.js Team** for the amazing framework
- **MongoDB** for the robust database solution
- **Ollama** for the local LLM capabilities
- **Recharts** for beautiful data visualizations
- **Tailwind CSS** for the utility-first CSS framework
- **ExchangeRate-API** for real-time currency conversion

---

## 📞 Support

- **Documentation**: [Wiki](https://github.com/your-org/aml-360/wiki)
- **Issues**: [GitHub Issues](https://github.com/your-org/aml-360/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-org/aml-360/discussions)
- **Email**: support@aml360.com

---

<div align="center">

**Made with ❤️ by the AML 360 Team**

[![GitHub stars](https://img.shields.io/github/stars/your-org/aml-360?style=social)](https://github.com/your-org/aml-360/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/your-org/aml-360?style=social)](https://github.com/your-org/aml-360/network)
[![GitHub watchers](https://img.shields.io/github/watchers/your-org/aml-360?style=social)](https://github.com/your-org/aml-360/watchers)

</div>
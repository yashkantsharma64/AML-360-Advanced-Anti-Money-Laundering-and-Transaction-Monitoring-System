// Transaction Schema for MongoDB - Combined Transaction and Risk Report
export const TransactionSchema = {
  // Basic transaction info
  transaction_id: String,
  account_id: String,
  transaction_date: Date,
  
  // Originator details
  originator_name: String,
  originator_address1: String,
  originator_address2: String,
  originator_address3: String,
  originator_country: String,
  
  // Beneficiary details
  beneficiary_name: String,
  beneficiary_address1: String,
  beneficiary_address2: String,
  beneficiary_address3: String,
  beneficiary_country: String,
  
  // Payment details
  transaction_amount: Number,
  currency_code: String,
  amount_usd: Number,
  usd_rate: Number,
  payment_instruction: String,
  payment_type: String,
  
  // Risk assessment (combined with transaction)
  risk_score: Number,
  triggered_rules: Array,
  isSuspicious: Boolean,
  
  // Rule scores breakdown
  rule_scores: {
    high_risk_country: Number,
    suspicious_keywords: Number,
    high_amount: Number,
    structuring: Number,
    rounded_amounts: Number
  },
  
  // Structuring detection fields
  structuring_detected: Boolean,
  three_day_sum: Number,
  structuring_amount_range: String,
  
  // Risk report details
  risk_report: {
    total_score: Number,
    risk_level: String, // LOW, MEDIUM, HIGH, CRITICAL
    recommendations: Array,
    investigation_required: Boolean,
    priority: String // LOW, MEDIUM, HIGH, URGENT
  },
  
  // Metadata
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
  
  // Additional AML fields
  review_status: String, // PENDING, REVIEWED, APPROVED, REJECTED
  reviewed_by: String,
  reviewed_at: Date,
  notes: String
};

// Validation functions
export function validateTransaction(transaction) {
  const required = [
    'account_id', 'transaction_date',
    'originator_name', 'beneficiary_name', 
    'transaction_amount', 'currency_code'
  ];
  
  const missing = required.filter(field => !transaction[field]);
  if (missing.length > 0) {
    throw new Error(`Missing required fields: ${missing.join(', ')}`);
  }
  
  // Validate date format
  if (typeof transaction.transaction_date === 'string') {
    transaction.transaction_date = new Date(transaction.transaction_date);
  }
  
  // Validate amounts
  transaction.transaction_amount = parseFloat(transaction.transaction_amount);
  if (isNaN(transaction.transaction_amount)) {
    throw new Error('Invalid transaction amount');
  }
  
  return transaction;
}

// Helper function to format transaction for MongoDB with auto-generated ID
export function formatTransactionForDB(transaction) {
  // Auto-generate transaction_id if not provided
  const transaction_id = transaction.transaction_id || `TXN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  // Determine risk level based on score
  const getRiskLevel = (score) => {
    if (score >= 10) return 'CRITICAL';
    if (score >= 7) return 'HIGH';
    if (score >= 4) return 'MEDIUM';
    return 'LOW';
  };
  
  // Determine priority based on risk level
  const getPriority = (riskLevel) => {
    switch (riskLevel) {
      case 'CRITICAL': return 'URGENT';
      case 'HIGH': return 'HIGH';
      case 'MEDIUM': return 'MEDIUM';
      default: return 'LOW';
    }
  };
  
  const riskLevel = getRiskLevel(transaction.risk_score || 0);
  const priority = getPriority(riskLevel);
  
  const formatted = {
    transaction_id,
    ...transaction,
    transaction_date: new Date(transaction.transaction_date),
    transaction_amount: parseFloat(transaction.transaction_amount),
    amount_usd: parseFloat(transaction.amount_usd || 0),
    usd_rate: parseFloat(transaction.usd_rate || 0),
    risk_score: parseInt(transaction.risk_score || 0),
    isSuspicious: Boolean(transaction.isSuspicious),
    triggered_rules: Array.isArray(transaction.triggered_rules) ? transaction.triggered_rules : [],
    rule_scores: transaction.rule_scores || {
      high_risk_country: 0,
      suspicious_keywords: 0,
      high_amount: 0,
      structuring: 0,
      rounded_amounts: 0
    },
    structuring_detected: Boolean(transaction.structuring_detected),
    three_day_sum: parseFloat(transaction.three_day_sum || 0),
    structuring_amount_range: transaction.structuring_amount_range || '',
    
    // Combined risk report
    risk_report: {
      total_score: parseInt(transaction.risk_score || 0),
      risk_level: riskLevel,
      recommendations: generateRecommendations(transaction),
      investigation_required: Boolean(transaction.isSuspicious),
      priority: priority
    },
    
    // Review fields
    review_status: 'PENDING',
    reviewed_by: null,
    reviewed_at: null,
    notes: '',
    
    created_at: new Date(),
    updated_at: new Date()
  };
  
  return validateTransaction(formatted);
}

// Generate recommendations based on triggered rules
function generateRecommendations(transaction) {
  const recommendations = [];
  
  if (transaction.rule_scores?.high_risk_country > 0) {
    recommendations.push('Enhanced due diligence required for high-risk country');
  }
  
  if (transaction.rule_scores?.suspicious_keywords > 0) {
    recommendations.push('Review payment instruction for suspicious keywords');
  }
  
  if (transaction.rule_scores?.high_amount > 0) {
    recommendations.push('Large transaction - verify source of funds');
  }
  
  if (transaction.rule_scores?.structuring > 0) {
    recommendations.push('Potential structuring detected - investigate account history');
  }
  
  if (transaction.rule_scores?.rounded_amounts > 0) {
    recommendations.push('Rounded amount - verify transaction purpose');
  }
  
  if (transaction.isSuspicious) {
    recommendations.push('Transaction flagged as suspicious - manual review required');
  }
  
  return recommendations;
}

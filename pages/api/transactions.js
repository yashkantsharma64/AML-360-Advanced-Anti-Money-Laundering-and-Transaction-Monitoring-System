import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const MONGODB_DB = process.env.MONGODB_DB || 'aml_monitoring';

let cachedClient = null;
let cachedDb = null;

async function connectToDatabase() {
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb };
  }

  try {
    const client = new MongoClient(MONGODB_URI);
    await client.connect();
    
    const db = client.db(MONGODB_DB);
    
    cachedClient = client;
    cachedDb = db;

    console.log('Connected to MongoDB successfully');
    return { client, db };
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
}

// Helper function to format transaction for MongoDB with auto-generated ID
function formatTransactionForDB(transaction) {
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
  
  return formatted;
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

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { db } = await connectToDatabase();
    const collection = db.collection('transactions');
    
    const transaction = formatTransactionForDB(req.body);
    const result = await collection.insertOne(transaction);
    
    res.status(201).json({ 
      success: true, 
      transaction: { ...transaction, _id: result.insertedId }
    });
  } catch (error) {
    console.error('Error saving transaction:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to save transaction' 
    });
  }
}

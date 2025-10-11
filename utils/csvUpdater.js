import fs from 'fs';
import path from 'path';

const CSV_FILE_PATH = path.join(process.cwd(), 'chatbot', 'aml_monitoring.transactions.csv');

// Helper function to format transaction for CSV
function formatTransactionForCSV(transaction) {
  const row = {
    _id: transaction._id?.toString() || '',
    transaction_id: transaction.transaction_id || '',
    beneficiary_name: transaction.beneficiary_name || '',
    currency_code: transaction.currency_code || '',
    risk_score: transaction.risk_score || 0,
    account_id: transaction.account_id || '',
    payment_instruction: transaction.payment_instruction || '',
    originator_name: transaction.originator_name || '',
    transaction_date: transaction.transaction_date ? new Date(transaction.transaction_date).toISOString() : '',
    isSuspicious: transaction.isSuspicious ? 'TRUE' : 'FALSE',
    beneficiary_country: transaction.beneficiary_country || '',
    transaction_amount: transaction.transaction_amount || 0,
    originator_country: transaction.originator_country || '',
    'triggered_rules[0].rule': transaction.triggered_rules?.[0]?.rule || '',
    'triggered_rules[1].rule': transaction.triggered_rules?.[1]?.rule || '',
    'triggered_rules[0].score': transaction.triggered_rules?.[0]?.score || '',
    'triggered_rules[1].score': transaction.triggered_rules?.[1]?.score || '',
    amount_usd: transaction.amount_usd || 0,
    usd_rate: transaction.usd_rate || 0,
    'rule_scores.high_risk_country': transaction.rule_scores?.high_risk_country || 0,
    'rule_scores.suspicious_keywords': transaction.rule_scores?.suspicious_keywords || 0,
    'rule_scores.high_amount': transaction.rule_scores?.high_amount || 0,
    'rule_scores.structuring': transaction.rule_scores?.structuring || 0,
    'rule_scores.rounded_amounts': transaction.rule_scores?.rounded_amounts || 0,
    structuring_detected: transaction.structuring_detected ? 'TRUE' : 'FALSE',
    three_day_sum: transaction.three_day_sum || 0,
    structuring_amount_range: transaction.structuring_amount_range || '',
    'risk_report.total_score': transaction.risk_report?.total_score || 0,
    'risk_report.risk_level': transaction.risk_report?.risk_level || '',
    'risk_report.recommendations[0]': transaction.risk_report?.recommendations?.[0] || '',
    'risk_report.recommendations[1]': transaction.risk_report?.recommendations?.[1] || '',
    'risk_report.recommendations[2]': transaction.risk_report?.recommendations?.[2] || '',
    'risk_report.investigation_required': transaction.risk_report?.investigation_required ? 'TRUE' : 'FALSE',
    'risk_report.priority': transaction.risk_report?.priority || '',
    review_status: transaction.review_status || 'PENDING',
    reviewed_by: transaction.reviewed_by || '',
    reviewed_at: transaction.reviewed_at || '',
    notes: transaction.notes || '',
    created_at: transaction.created_at ? new Date(transaction.created_at).toISOString() : '',
    updated_at: transaction.updated_at ? new Date(transaction.updated_at).toISOString() : '',
    originator_address1: transaction.originator_address1 || '',
    originator_address2: transaction.originator_address2 || '',
    originator_address3: transaction.originator_address3 || '',
    beneficiary_address1: transaction.beneficiary_address1 || '',
    beneficiary_address2: transaction.beneficiary_address2 || '',
    beneficiary_address3: transaction.beneficiary_address3 || '',
    payment_type: transaction.payment_type || '',
    'triggered_rules[0].details': transaction.triggered_rules?.[0]?.details || '',
    'triggered_rules[1].details': transaction.triggered_rules?.[1]?.details || '',
    'triggered_rules[0].rule_id': transaction.triggered_rules?.[0]?.rule_id || '',
    'triggered_rules[1].rule_id': transaction.triggered_rules?.[1]?.rule_id || ''
  };

  return row;
}

// Helper function to convert object to CSV row
function objectToCSVRow(obj) {
  const values = Object.values(obj).map(value => {
    // Escape quotes and wrap in quotes if contains comma, quote, or newline
    const stringValue = String(value);
    if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
      return `"${stringValue.replace(/"/g, '""')}"`;
    }
    return stringValue;
  });
  return values.join(',');
}

// Function to append transaction to CSV
export async function appendTransactionToCSV(transaction) {
  try {
    // Check if CSV file exists
    if (!fs.existsSync(CSV_FILE_PATH)) {
      console.log('CSV file does not exist, creating new one...');
      // Create CSV file with headers
      const headers = [
        '_id', 'transaction_id', 'beneficiary_name', 'currency_code', 'risk_score', 'account_id',
        'payment_instruction', 'originator_name', 'transaction_date', 'isSuspicious', 'beneficiary_country',
        'transaction_amount', 'originator_country', 'triggered_rules[0].rule', 'triggered_rules[1].rule',
        'triggered_rules[0].score', 'triggered_rules[1].score', 'amount_usd', 'usd_rate',
        'rule_scores.high_risk_country', 'rule_scores.suspicious_keywords', 'rule_scores.high_amount',
        'rule_scores.structuring', 'rule_scores.rounded_amounts', 'structuring_detected', 'three_day_sum',
        'structuring_amount_range', 'risk_report.total_score', 'risk_report.risk_level',
        'risk_report.recommendations[0]', 'risk_report.recommendations[1]', 'risk_report.recommendations[2]',
        'risk_report.investigation_required', 'risk_report.priority', 'review_status', 'reviewed_by',
        'reviewed_at', 'notes', 'created_at', 'updated_at', 'originator_address1', 'originator_address2',
        'originator_address3', 'beneficiary_address1', 'beneficiary_address2', 'beneficiary_address3',
        'payment_type', 'triggered_rules[0].details', 'triggered_rules[1].details', 'triggered_rules[0].rule_id',
        'triggered_rules[1].rule_id'
      ];
      
      fs.writeFileSync(CSV_FILE_PATH, headers.join(',') + '\n');
    }

    // Format transaction for CSV
    const csvRow = formatTransactionForCSV(transaction);
    const csvLine = objectToCSVRow(csvRow);

    // Append to CSV file
    fs.appendFileSync(CSV_FILE_PATH, csvLine + '\n');
    
    console.log(`Transaction ${transaction.transaction_id} appended to CSV successfully`);
    return true;
  } catch (error) {
    console.error('Error appending transaction to CSV:', error);
    return false;
  }
}

// Function to update CSV with all transactions from MongoDB
export async function updateCSVFromMongoDB(transactions) {
  try {
    if (!transactions || transactions.length === 0) {
      console.log('No transactions to update CSV with');
      return false;
    }

    // Create CSV headers
    const headers = [
      '_id', 'transaction_id', 'beneficiary_name', 'currency_code', 'risk_score', 'account_id',
      'payment_instruction', 'originator_name', 'transaction_date', 'isSuspicious', 'beneficiary_country',
      'transaction_amount', 'originator_country', 'triggered_rules[0].rule', 'triggered_rules[1].rule',
      'triggered_rules[0].score', 'triggered_rules[1].score', 'amount_usd', 'usd_rate',
      'rule_scores.high_risk_country', 'rule_scores.suspicious_keywords', 'rule_scores.high_amount',
      'rule_scores.structuring', 'rule_scores.rounded_amounts', 'structuring_detected', 'three_day_sum',
      'structuring_amount_range', 'risk_report.total_score', 'risk_report.risk_level',
      'risk_report.recommendations[0]', 'risk_report.recommendations[1]', 'risk_report.recommendations[2]',
      'risk_report.investigation_required', 'risk_report.priority', 'review_status', 'reviewed_by',
      'reviewed_at', 'notes', 'created_at', 'updated_at', 'originator_address1', 'originator_address2',
      'originator_address3', 'beneficiary_address1', 'beneficiary_address2', 'beneficiary_address3',
      'payment_type', 'triggered_rules[0].details', 'triggered_rules[1].details', 'triggered_rules[0].rule_id',
      'triggered_rules[1].rule_id'
    ];

    // Convert all transactions to CSV rows
    const csvRows = transactions.map(transaction => {
      const csvRow = formatTransactionForCSV(transaction);
      return objectToCSVRow(csvRow);
    });

    // Write complete CSV file
    const csvContent = [headers.join(','), ...csvRows].join('\n');
    fs.writeFileSync(CSV_FILE_PATH, csvContent);

    console.log(`CSV updated with ${transactions.length} transactions successfully`);
    return true;
  } catch (error) {
    console.error('Error updating CSV from MongoDB:', error);
    return false;
  }
}

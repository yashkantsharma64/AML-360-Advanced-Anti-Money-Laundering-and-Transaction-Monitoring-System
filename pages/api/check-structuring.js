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

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { account_id, transaction_date, amount_usd } = req.body;

    if (!account_id || !transaction_date || !amount_usd) {
      return res.status(400).json({ 
        success: false, 
        error: 'account_id, transaction_date, and amount_usd are required' 
      });
    }

    const { db } = await connectToDatabase();
    const collection = db.collection('transactions');

    // Rule #4: Structuring (3-day sum of 8,000–9,999 range > $1M)
    // Check if this transaction is in the structuring range
    const isInRange = amount_usd >= 8000 && amount_usd <= 9999;
    
    if (!isInRange) {
      return res.status(200).json({
        success: true,
        detected: false,
        threeDaySum: 0,
        count: 0,
        amountRange: "8000-9999"
      });
    }

    // Calculate 3 days before the transaction date
    const transactionDate = new Date(transaction_date);
    const threeDaysAgo = new Date(transactionDate);
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

    // Find transactions from the same account in the structuring range (including current transaction)
    const pastTransactions = await collection.find({
      account_id: account_id,
      transaction_date: {
        $gte: threeDaysAgo,
        $lte: transactionDate
      },
      amount_usd: {
        $gte: 8000,
        $lte: 9999
      }
    }).toArray();

    const threeDaySum = pastTransactions.reduce((sum, t) => sum + (t.amount_usd || 0), 0);
    const detected = threeDaySum > 1000000; // $1M threshold

    console.log('Structuring analysis:', {
      account_id,
      transaction_date,
      amount_usd,
      isInRange,
      transactionDate: transactionDate.toISOString(),
      threeDaysAgo: threeDaysAgo.toISOString(),
      pastTransactions: pastTransactions.length,
      threeDaySum,
      detected,
      sampleTransactions: pastTransactions.slice(0, 3).map(t => ({
        id: t.transaction_id,
        date: t.transaction_date,
        amount: t.amount_usd
      }))
    });

    res.status(200).json({
      success: true,
      detected,
      threeDaySum,
      count: pastTransactions.length,
      amountRange: "8000-9999",
      pastTransactions: pastTransactions.map(t => ({
        transaction_id: t.transaction_id,
        amount_usd: t.amount_usd,
        transaction_date: t.transaction_date
      }))
    });

  } catch (error) {
    console.error('Error checking structuring pattern:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to check structuring pattern' 
    });
  }
}

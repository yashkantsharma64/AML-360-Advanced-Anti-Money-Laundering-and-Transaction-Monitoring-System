import { MongoClient, ObjectId } from 'mongodb';

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
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { db } = await connectToDatabase();
    const collection = db.collection('transactions');
    
    const { id } = req.query;
    
    console.log('Looking for transaction with ID:', id);
    console.log('ID type:', typeof id);
    
    if (!id) {
      return res.status(400).json({ 
        success: false, 
        error: 'Transaction ID is required' 
      });
    }
    
    // Try to find by ObjectId first, then by transaction_id
    let transaction;
    try {
      console.log('Trying ObjectId lookup...');
      transaction = await collection.findOne({ _id: new ObjectId(id) });
      console.log('ObjectId lookup result:', transaction ? 'Found' : 'Not found');
    } catch (error) {
      console.log('ObjectId lookup failed:', error.message);
      console.log('Trying transaction_id lookup...');
      transaction = await collection.findOne({ transaction_id: id });
      console.log('transaction_id lookup result:', transaction ? 'Found' : 'Not found');
    }
    
    if (!transaction) {
      return res.status(404).json({ 
        success: false, 
        error: 'Transaction not found' 
      });
    }
    
    // Get structuring analysis if this transaction is suspicious
    let structuringAnalysis = null;
    if (transaction.isSuspicious && transaction.account_id) {
      try {
        const startDate = new Date(transaction.transaction_date);
        startDate.setDate(startDate.getDate() - 30);
        
        const relatedTransactions = await collection.find({
          account_id: transaction.account_id,
          transaction_date: { $gte: startDate },
          amount_usd: { $gte: 8000, $lte: 9999 }
        }).sort({ transaction_date: 1 }).toArray();
        
        const dailySums = {};
        relatedTransactions.forEach(t => {
          const date = t.transaction_date.toISOString().split('T')[0];
          dailySums[date] = (dailySums[date] || 0) + t.amount_usd;
        });
        
        structuringAnalysis = {
          totalTransactions: relatedTransactions.length,
          totalAmount: relatedTransactions.reduce((sum, t) => sum + t.amount_usd, 0),
          dailySums,
          suspiciousDays: Object.entries(dailySums).filter(([_, sum]) => sum > 1000000)
        };
      } catch (analysisError) {
        console.error('Error in structuring analysis:', analysisError);
        structuringAnalysis = { totalTransactions: 0, totalAmount: 0, dailySums: {}, suspiciousDays: [] };
      }
    }
    
    res.status(200).json({ 
      success: true, 
      transaction: { ...transaction, _id: transaction._id.toString() }, // Serialize ObjectId
      structuringAnalysis
    });
  } catch (error) {
    console.error('Error fetching transaction details:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch transaction details' 
    });
  }
}

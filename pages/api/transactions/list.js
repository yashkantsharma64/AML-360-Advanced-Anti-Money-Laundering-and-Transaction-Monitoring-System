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
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { db } = await connectToDatabase();
    const collection = db.collection('transactions');
    
    const { limit = 100, skip = 0, suspicious } = req.query;
    
    let query = {};
    if (suspicious === 'true') {
      query.isSuspicious = true;
    }
    
    const transactions = await collection.find(query)
      .sort({ created_at: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip))
      .toArray();
    
    // Convert ObjectId to string for JSON serialization
    const serializedTransactions = transactions.map(transaction => ({
      ...transaction,
      _id: transaction._id.toString()
    }));
    
    const total = await collection.countDocuments(query);
    
    res.status(200).json({ 
      success: true, 
      transactions: serializedTransactions,
      total,
      hasMore: skip + transactions.length < total
    });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch transactions' 
    });
  }
}

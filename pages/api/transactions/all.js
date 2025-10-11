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
    
    // Fetch ALL transactions for dashboard charts
    const transactions = await collection.find({})
      .sort({ created_at: -1 })
      .toArray();
    
    // Convert ObjectId to string for JSON serialization
    const serializedTransactions = transactions.map(transaction => ({
      ...transaction,
      _id: transaction._id.toString()
    }));
    
    res.status(200).json({ 
      success: true, 
      transactions: serializedTransactions,
      total: transactions.length
    });
  } catch (error) {
    console.error('Error fetching all transactions:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch transactions' 
    });
  }
}

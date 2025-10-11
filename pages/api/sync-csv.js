import { MongoClient } from 'mongodb';
import { updateCSVFromMongoDB } from '../../utils/csvUpdater';

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
    const { db } = await connectToDatabase();
    const collection = db.collection('transactions');
    
    // Get all transactions from MongoDB
    const transactions = await collection.find({}).toArray();
    
    if (transactions.length === 0) {
      return res.status(200).json({ 
        success: true, 
        message: 'No transactions found in MongoDB',
        count: 0
      });
    }

    // Update CSV file with all transactions
    const success = await updateCSVFromMongoDB(transactions);
    
    if (success) {
      res.status(200).json({ 
        success: true, 
        message: `CSV synchronized with ${transactions.length} transactions`,
        count: transactions.length
      });
    } else {
      res.status(500).json({ 
        success: false, 
        error: 'Failed to update CSV file' 
      });
    }
  } catch (error) {
    console.error('Error syncing CSV:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to sync CSV with MongoDB' 
    });
  }
}

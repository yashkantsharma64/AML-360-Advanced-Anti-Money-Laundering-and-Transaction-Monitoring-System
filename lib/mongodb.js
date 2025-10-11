import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const MONGODB_DB = process.env.MONGODB_DB || 'aml_monitoring';

let cachedClient = null;
let cachedDb = null;

export async function connectToDatabase() {
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb };
  }

  try {
    const client = new MongoClient(MONGODB_URI);
    await client.connect();
    
    const db = client.db(MONGODB_DB);
    
    // Create collections if they don't exist
    try {
      await db.createCollection('transactions');
    } catch (collectionError) {
      // Collections might already exist, ignore error
      console.log('Collections already exist or creation failed:', collectionError.message);
    }
    
    // Create indexes for better performance
    try {
      await db.collection('transactions').createIndex({ account_id: 1 });
      await db.collection('transactions').createIndex({ transaction_date: 1 });
      await db.collection('transactions').createIndex({ originator_name: 1 });
      await db.collection('transactions').createIndex({ beneficiary_name: 1 });
      await db.collection('transactions').createIndex({ isSuspicious: 1 });
      await db.collection('transactions').createIndex({ 'risk_report.risk_level': 1 });
      await db.collection('transactions').createIndex({ 'risk_report.priority': 1 });
      await db.collection('transactions').createIndex({ review_status: 1 });
      
      // Compound index for structuring detection (Rule #4)
      await db.collection('transactions').createIndex({ 
        account_id: 1, 
        transaction_date: 1 
      });
      
      // Compound index for risk analysis
      await db.collection('transactions').createIndex({ 
        isSuspicious: 1, 
        'risk_report.risk_level': 1 
      });
    } catch (indexError) {
      // Indexes might already exist, ignore error
      console.log('Indexes already exist or creation failed:', indexError.message);
    }

    cachedClient = client;
    cachedDb = db;

    console.log('Connected to MongoDB successfully');
    return { client, db };
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
}

export async function getTransactionsCollection() {
  const { db } = await connectToDatabase();
  return db.collection('transactions');
}

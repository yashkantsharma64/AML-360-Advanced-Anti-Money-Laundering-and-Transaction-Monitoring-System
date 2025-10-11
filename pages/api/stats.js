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
    
    const total = await collection.countDocuments();
    const suspicious = await collection.countDocuments({ isSuspicious: true });
    const normal = total - suspicious;
    
    // Get recent transactions for analysis
    const recentTransactions = await collection.find({})
      .sort({ created_at: -1 })
      .limit(100)
      .toArray();
    
    // Calculate additional stats
    const avgAmount = recentTransactions.length > 0 
      ? recentTransactions.reduce((sum, t) => sum + (t.amount_usd || 0), 0) / recentTransactions.length
      : 0;
    
    const topCountries = await collection.aggregate([
      { $group: { _id: '$beneficiary_country', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]).toArray();
    
    const topKeywords = await collection.aggregate([
      { $unwind: '$triggered_rules' },
      { $match: { 'triggered_rules.rule': 'Suspicious keyword' } },
      { $group: { _id: '$triggered_rules.details', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]).toArray();
    
    res.status(200).json({ 
      success: true, 
      stats: {
        total,
        suspicious,
        normal,
        suspiciousRate: total > 0 ? (suspicious / total * 100).toFixed(2) : 0,
        avgAmount: Math.round(avgAmount),
        topCountries,
        topKeywords
      }
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch stats' 
    });
  }
}

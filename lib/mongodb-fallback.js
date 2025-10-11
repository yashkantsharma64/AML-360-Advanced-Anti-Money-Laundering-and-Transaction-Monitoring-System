// Temporary fallback for MongoDB connection
export async function connectToDatabase() {
  console.log('Using mock database - MongoDB not available');
  return { 
    client: null, 
    db: {
      collection: (name) => ({
        insertOne: (doc) => ({ insertedId: `mock-${Date.now()}` }),
        find: (query) => ({ 
          toArray: () => [],
          sort: () => ({ toArray: () => [] }),
          limit: () => ({ toArray: () => [] }),
          skip: () => ({ toArray: () => [] })
        }),
        findOne: (query) => null,
        countDocuments: (query) => 0,
        aggregate: (pipeline) => ({ toArray: () => [] }),
        createIndex: () => ({})
      })
    }
  };
}

export async function getTransactionsCollection() {
  const { db } = await connectToDatabase();
  return db.collection('transactions');
}

export async function getRiskReportsCollection() {
  const { db } = await connectToDatabase();
  return db.collection('risk_reports');
}

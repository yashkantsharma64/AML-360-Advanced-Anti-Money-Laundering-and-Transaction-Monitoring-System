import { MongoClient } from 'mongodb';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    // Connect to MongoDB
    const client = new MongoClient(process.env.MONGODB_URI || 'mongodb://localhost:27017');
    await client.connect();
    const db = client.db(process.env.MONGODB_DB || 'aml_monitoring');
    const collection = db.collection('transactions');

    // Get unique countries
    const countries = await collection.distinct('originator_country');
    const beneficiaryCountries = await collection.distinct('beneficiary_country');
    const allCountries = [...new Set([...countries, ...beneficiaryCountries])]
      .filter(country => country && country.trim() !== '')
      .sort();

    // Get unique years
    const transactions = await collection.find({}, { projection: { transaction_date: 1 } }).toArray();
    const years = [...new Set(
      transactions
        .map(tx => {
          if (tx.transaction_date) {
            return new Date(tx.transaction_date).getFullYear();
          }
          return null;
        })
        .filter(year => year !== null)
    )].sort((a, b) => b - a); // Sort descending (newest first)

    // Get transaction counts for each filter
    const totalTransactions = await collection.countDocuments();
    
    const countryCounts = {};
    for (const country of allCountries) {
      const count = await collection.countDocuments({
        $or: [
          { originator_country: country },
          { beneficiary_country: country }
        ]
      });
      countryCounts[country] = count;
    }

    const yearCounts = {};
    for (const year of years) {
      const startDate = new Date(`${year}-01-01`);
      const endDate = new Date(`${year}-12-31T23:59:59.999Z`);
      const count = await collection.countDocuments({
        transaction_date: {
          $gte: startDate,
          $lte: endDate
        }
      });
      yearCounts[year] = count;
    }

    await client.close();

    res.status(200).json({
      success: true,
      data: {
        countries: allCountries.map(country => ({
          code: country,
          name: country,
          count: countryCounts[country] || 0
        })),
        years: years.map(year => ({
          year: year,
          count: yearCounts[year] || 0
        })),
        totalTransactions
      }
    });

  } catch (error) {
    console.error('Error fetching dataset filters:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error',
      error: error.message 
    });
  }
}

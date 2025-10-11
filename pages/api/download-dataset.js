import { MongoClient } from 'mongodb';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  const { country, year, format = 'csv' } = req.query;

  try {
    // Connect to MongoDB
    const client = new MongoClient(process.env.MONGODB_URI || 'mongodb://localhost:27017');
    await client.connect();
    const db = client.db(process.env.MONGODB_DB || 'aml_monitoring');
    const collection = db.collection('transactions');

    // Build filter query
    let filter = {};
    
    if (country && country !== 'all') {
      filter.$or = [
        { originator_country: country },
        { beneficiary_country: country }
      ];
    }

    if (year && year !== 'all') {
      const startDate = new Date(`${year}-01-01`);
      const endDate = new Date(`${year}-12-31T23:59:59.999Z`);
      filter.transaction_date = {
        $gte: startDate,
        $lte: endDate
      };
    }

    // Fetch transactions
    const transactions = await collection.find(filter).toArray();

    if (transactions.length === 0) {
      await client.close();
      return res.status(404).json({ 
        success: false, 
        message: 'No transactions found for the specified filters' 
      });
    }

    // Generate filename
    let filename = 'aml_transactions';
    if (country && country !== 'all') {
      filename += `_${country}`;
    }
    if (year && year !== 'all') {
      filename += `_${year}`;
    }
    filename += `_${new Date().toISOString().split('T')[0]}`;

    if (format === 'csv') {
      // Convert to CSV
      const csvHeaders = [
        'transaction_id',
        'account_key',
        'transaction_date',
        'originator_name',
        'originator_address1',
        'originator_address2',
        'originator_country',
        'beneficiary_name',
        'beneficiary_address1',
        'beneficiary_country',
        'transaction_amount',
        'currency_code',
        'amount_usd',
        'payment_instruction',
        'payment_type',
        'risk_score',
        'isSuspicious',
        'triggered_rules'
      ];

      const csvRows = transactions.map(tx => {
        return csvHeaders.map(header => {
          let value = tx[header];
          
          // Handle special cases
          if (header === 'transaction_date' && value) {
            value = new Date(value).toISOString().split('T')[0];
          } else if (header === 'triggered_rules' && value) {
            value = JSON.stringify(value);
          } else if (value === null || value === undefined) {
            value = '';
          } else {
            value = String(value);
          }
          
          // Escape CSV values
          if (value.includes(',') || value.includes('"') || value.includes('\n')) {
            value = `"${value.replace(/"/g, '""')}"`;
          }
          
          return value;
        });
      });

      const csvContent = [
        csvHeaders.join(','),
        ...csvRows.map(row => row.join(','))
      ].join('\n');

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}.csv"`);
      res.status(200).send(csvContent);

    } else if (format === 'json') {
      // Return as JSON
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}.json"`);
      res.status(200).json({
        success: true,
        count: transactions.length,
        filters: { country, year },
        data: transactions
      });
    } else {
      await client.close();
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid format. Use csv or json' 
      });
    }

    await client.close();

  } catch (error) {
    console.error('Error downloading dataset:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error',
      error: error.message 
    });
  }
}

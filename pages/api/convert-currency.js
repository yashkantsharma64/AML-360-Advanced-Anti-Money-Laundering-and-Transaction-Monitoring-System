export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { amount, fromCurrency, toCurrency = 'USD', date } = req.body;

    if (!amount || !fromCurrency) {
      return res.status(400).json({ 
        success: false, 
        error: 'Amount and fromCurrency are required' 
      });
    }

    // Use ExchangeRate-API
    const apiKey = '4299650994279511afe6ed48';
    let exchangeRate = 1;

    if (fromCurrency === toCurrency) {
      exchangeRate = 1;
    } else {
      try {
        // For historical dates, use the history endpoint
        if (date && date !== 'NaN/NaN/NaN') {
          const dateObj = new Date(date);
          const year = dateObj.getFullYear();
          const month = String(dateObj.getMonth() + 1).padStart(2, '0');
          const day = String(dateObj.getDate()).padStart(2, '0');
          
          const historyUrl = `https://v6.exchangerate-api.com/v6/${apiKey}/history/${fromCurrency}/${year}/${month}/${day}`;
          
          const response = await fetch(historyUrl);
          const data = await response.json();
          
          if (data.result === 'success' && data.conversion_rates) {
            exchangeRate = data.conversion_rates[toCurrency] || 1;
          } else {
            // Fallback to latest rates if historical data not available
            const latestUrl = `https://v6.exchangerate-api.com/v6/${apiKey}/latest/${fromCurrency}`;
            const latestResponse = await fetch(latestUrl);
            const latestData = await latestResponse.json();
            
            if (latestData.result === 'success' && latestData.conversion_rates) {
              exchangeRate = latestData.conversion_rates[toCurrency] || 1;
            }
          }
        } else {
          // Use latest rates for current date
          const latestUrl = `https://v6.exchangerate-api.com/v6/${apiKey}/latest/${fromCurrency}`;
          const response = await fetch(latestUrl);
          const data = await response.json();
          
          if (data.result === 'success' && data.conversion_rates) {
            exchangeRate = data.conversion_rates[toCurrency] || 1;
          }
        }
      } catch (apiError) {
        console.error('Exchange rate API error:', apiError);
        // Use fallback rate of 1 if API fails
        exchangeRate = 1;
      }
    }

    const convertedAmount = parseFloat(amount) * exchangeRate;

    res.status(200).json({
      success: true,
      originalAmount: parseFloat(amount),
      fromCurrency,
      toCurrency,
      exchangeRate,
      convertedAmount,
      date: date || new Date().toISOString().split('T')[0]
    });

  } catch (error) {
    console.error('Currency conversion error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to convert currency' 
    });
  }
}

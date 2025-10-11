export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { pincode } = req.body;
    
    if (!pincode) {
      return res.status(400).json({ 
        success: false, 
        error: 'Pincode is required' 
      });
    }

    // Use a free geocoding service to get country from pincode
    // Using Nominatim (OpenStreetMap) which is free
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?postalcode=${encodeURIComponent(pincode)}&format=json&limit=1`,
      {
        headers: {
          'User-Agent': 'AML-Monitoring-System/1.0'
        }
      }
    );

    if (!response.ok) {
      throw new Error('Geocoding service unavailable');
    }

    const data = await response.json();
    
    if (data.length === 0) {
      return res.status(404).json({ 
        success: false, 
        error: 'Pincode not found' 
      });
    }

    const result = data[0];
    const country = result.display_name.split(',').pop().trim();
    
    res.status(200).json({ 
      success: true, 
      country: country,
      fullAddress: result.display_name
    });
  } catch (error) {
    console.error('Error fetching country from pincode:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch country information' 
    });
  }
}

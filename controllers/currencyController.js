const axios = require('axios');

const API_KEY = process.env.API_KEY;  
const BASE_URL = process.env.BASE_URL;  

async function getExchangeRate(req, res) {
    const { fromCurrency, toCurrency, amount } = req.params;

    try {
        // Request exchange rate conversion
        const response = await axios.get(`${BASE_URL}?from=${fromCurrency}&to=${toCurrency}&amount=${amount}&access_key=${API_KEY}`);

        console.log(response.data);  // Debugging line to check API response
        console.log(req.params);
        
        // Check if the response is successful
        if (response.data.success) {
            // Return the conversion result
            res.status(200).json({
                fromCurrency,
                toCurrency,
                amount,
                convertedAmount: response.data.result
            });
        } else {
            res.status(400).json({ message: 'Error fetching conversion or invalid currencies' });
        }
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
}

module.exports = {
    getExchangeRate
};

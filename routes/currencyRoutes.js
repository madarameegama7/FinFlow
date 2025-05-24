const express = require('express');
const { getExchangeRate } = require("../controllers/currencyController");

const authMiddleware = require("../middleware/authMiddleware");
const router = express.Router();

// Endpoint to get exchange rate for base and target currency
router.get('/:fromCurrency/:toCurrency/:amount', authMiddleware, getExchangeRate);

module.exports = router;

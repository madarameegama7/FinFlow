const express = require('express');
const router = express.Router();

const { 
    addBudget, 
    getBudgetStatus, 
    getBudgetRecommendations,
    getBudget } = require('../controllers/budgetController');

const authMiddleware = require("../middleware/authMiddleware");

router.post('/', authMiddleware, addBudget);
router.get('/status', authMiddleware, getBudgetStatus);
router.get('/recommendations', authMiddleware, getBudgetRecommendations);
router.get('/', authMiddleware, getBudget);

module.exports = router;

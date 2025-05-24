const express = require('express')
const {
    addTransaction,
    getTransactionByTag,
    getTransactions,
    getTransactionById,
    deleteTransaction,
    updateTransaction,
    getUpcomingRecurringTransactions
}=require("../controllers/transactionController")

const requireAuth = require("../middleware/authMiddleware");

const router= express.Router()

//GET all transactions
router.get('/',requireAuth,getTransactions);

//GET a single transaction
router.get('/:id', requireAuth,getTransactionById)

//GET transaction by tag
router.get('/tag/:tag',requireAuth,getTransactionByTag);

//POST a transaction
router.post('/', requireAuth, addTransaction)

//DELETE transaction
router.delete('/:id',requireAuth,deleteTransaction);

//EDIT transaction
router.patch('/:id',requireAuth,updateTransaction)

//GET upcoming transactions
router.get('/upcoming',requireAuth,getUpcomingRecurringTransactions)

module.exports=router
const express = require('express')
const{
    getSpendingTrends,
    getIncomeExpenseReport,
    getCategoryBreakdownReport,
    getTypeBreakdownReport,
    getBudgetVsActual,
    getFinancialSummary
}=require("../controllers/financialReportController");

const authMiddleware = require("../middleware/authMiddleware");
const router=express.Router()

//generate spending trends
router.get('/getSpendingTrends',authMiddleware,getSpendingTrends);
router.get("/getIncomeExpenseReport", authMiddleware, getIncomeExpenseReport);
router.get("/getCategoryBreakdownReport", authMiddleware, getCategoryBreakdownReport);
router.get("/getTypeBreakdownReport", authMiddleware, getTypeBreakdownReport);
router.get("/getBudgetVsActual", authMiddleware, getBudgetVsActual);
router.get("/getFinancialSummary", authMiddleware, getFinancialSummary);

module.exports=router
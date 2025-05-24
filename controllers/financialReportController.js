const Transaction = require("../models/Transaction");
const Budget = require("../models/Budget");

const getSpendingTrends = async (req, res) => {
    try {
        // Extract query parameters
        const { startDate, endDate, frequency } = req.query;

        if (!startDate || !endDate || !frequency) {
            return res.status(400).json({ message: "startDate, endDate, and frequency are required" });
        }

        // Convert to Date objects
        const start = new Date(startDate);
        const end = new Date(endDate);

        // Define the date format for grouping
        let dateFormat;
        switch (frequency) {
            case "daily":
                dateFormat = "%Y-%m-%d";
                break;
            case "weekly":
                dateFormat = "%Y-%U"; // Year + Week Number
                break;
            case "monthly":
                dateFormat = "%Y-%m";
                break;
            case "yearly":
                dateFormat = "%Y";
                break;
            default:
                return res.status(400).json({ message: "Invalid frequency. Use daily, weekly, monthly, or yearly." });
        }

        // Aggregate transactions by period
        const transactions = await Transaction.aggregate([
            {
                $match: {
                    transactionDate: { $gte: start, $lte: end }
                }
            },
            {
                $group: {
                    _id: { $dateToString: { format: dateFormat, date: "$transactionDate" } },
                    totalIncome: {
                        $sum: { $cond: [{ $eq: ["$type", "income"] }, "$amount", 0] }
                    },
                    totalExpense: {
                        $sum: { $cond: [{ $eq: ["$type", "expense"] }, "$amount", 0] }
                    }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        // Format response data
        let trends = transactions.map(trx => ({
            periodLabel: trx._id,
            income: trx.totalIncome,
            expense: trx.totalExpense,
            net: trx.totalIncome - trx.totalExpense
        }));

        // Calculate overall summary
        const totalIncome = trends.reduce((sum, t) => sum + t.income, 0);
        const totalExpense = trends.reduce((sum, t) => sum + t.expense, 0);
        const netSavings = totalIncome - totalExpense;

        // Final Response
        res.json({
            period: frequency,
            startDate: start,
            endDate: end,
            trends,
            summary: {
                totalIncome,
                totalExpense,
                netSavings
            }
        });

    } catch (error) {
        console.error("Error in getSpendingTrends:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

const getIncomeExpenseReport = async (req, res) => {
    try {
        // Extract query parameters
        const { startDate, endDate } = req.query;

        if (!startDate || !endDate) {
            return res.status(400).json({ message: "startDate and endDate are required" });
        }

        // Convert to Date objects
        const start = new Date(startDate);
        const end = new Date(endDate);

        // Aggregate transactions by category
        const transactions = await Transaction.aggregate([
            {
                $match: {
                    transactionDate: { $gte: start, $lte: end }
                }
            },
            {
                $group: {
                    _id: "$category",
                    totalIncome: {
                        $sum: { $cond: [{ $eq: ["$type", "income"] }, "$amount", 0] }
                    },
                    totalExpense: {
                        $sum: { $cond: [{ $eq: ["$type", "expense"] }, "$amount", 0] }
                    }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        // Format response data
        let categoryBreakdown = transactions.map(trx => ({
            category: trx._id,
            income: trx.totalIncome,
            expense: trx.totalExpense
        }));

        // Calculate overall summary
        const totalIncome = categoryBreakdown.reduce((sum, t) => sum + t.income, 0);
        const totalExpense = categoryBreakdown.reduce((sum, t) => sum + t.expense, 0);
        const netSavings = totalIncome - totalExpense;

        // Final Response
        res.json({
            startDate: start,
            endDate: end,
            summary: {
                totalIncome,
                totalExpense,
                netSavings
            },
            categoryBreakdown
        });

    } catch (error) {
        console.error("Error in getIncomeExpenseReport:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

const getCategoryBreakdownReport = async (req, res) => {
    try {
        // Extract query parameters
        const { startDate, endDate, category } = req.query;

        if (!startDate || !endDate || !category) {
            return res.status(400).json({ message: "startDate, endDate, and category are required" });
        }

        // Convert to Date objects
        const start = new Date(startDate);
        const end = new Date(endDate);

        // Aggregate transactions based on category
        const transactions = await Transaction.aggregate([
            {
                $match: {
                    transactionDate: { $gte: start, $lte: end },
                    category: category
                }
            },
            {
                $group: {
                    _id: "$category",
                    totalIncome: {
                        $sum: { $cond: [{ $eq: ["$type", "income"] }, "$amount", 0] }
                    },
                    totalExpense: {
                        $sum: { $cond: [{ $eq: ["$type", "expense"] }, "$amount", 0] }
                    },
                    transactions: { $push: "$$ROOT" } // Include all transactions in the response
                }
            }
        ]);

        // If no transactions found
        if (transactions.length === 0) {
            return res.status(404).json({ message: "No transactions found for the given category and date range" });
        }

        // Format response
        const data = transactions[0]; // Since we are filtering by one category, take the first result
        const totalIncome = data.totalIncome;
        const totalExpense = data.totalExpense;
        const netAmount = totalIncome - totalExpense;

        // Final Response
        res.json({
            startDate: start,
            endDate: end,
            category: data._id,
            summary: {
                totalIncome,
                totalExpense,
                netAmount
            },
            transactions: data.transactions.map(trx => ({
                amount: trx.amount,
                type: trx.type,
                transactionDate: trx.transactionDate,
                description: trx.description || "",
                tags: trx.tags
            }))
        });

    } catch (error) {
        console.error("Error in getCategoryBreakdownReport:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};
const getTypeBreakdownReport = async (req, res) => {
    try {
        // Extract query parameters
        const { startDate, endDate, type } = req.query;

        if (!startDate || !endDate || !type) {
            return res.status(400).json({ message: "startDate, endDate, and type (income/expense) are required" });
        }

        if (type !== "income" && type !== "expense") {
            return res.status(400).json({ message: "Invalid type. Must be 'income' or 'expense'." });
        }

        // Convert to Date objects
        const start = new Date(startDate);
        const end = new Date(endDate);

        // Aggregate transactions based on type
        const transactions = await Transaction.aggregate([
            {
                $match: {
                    transactionDate: { $gte: start, $lte: end },
                    type: type
                }
            },
            {
                $group: {
                    _id: "$type",
                    totalAmount: { $sum: "$amount" },
                    transactions: { $push: "$$ROOT" } // Include all matching transactions
                }
            }
        ]);

        // If no transactions found
        if (transactions.length === 0) {
            return res.status(404).json({ message: `No ${type} transactions found for the given date range.` });
        }

        // Format response
        const data = transactions[0]; // Since we're filtering by one type, take the first result
        const totalAmount = data.totalAmount;

        // Final JSON response
        res.json({
            startDate: start,
            endDate: end,
            type: data._id,
            summary: {
                totalAmount
            },
            transactions: data.transactions.map(trx => ({
                amount: trx.amount,
                category: trx.category,
                transactionDate: trx.transactionDate
            }))
        });

    } catch (error) {
        console.error("Error in getTypeBreakdownReport:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};
const getBudgetVsActual = async (req, res) => {
    try {
      const { month, year } = req.query;
      const userEmail = req.user.userEmail; // Use the user email to identify the user

      // Define month names array to convert month number to month name
      const monthNames = [
        "January", "February", "March", "April", "May", "June", 
        "July", "August", "September", "October", "November", "December"
      ];

      // Determine the report year and month
      const currentDate = new Date();
      const reportYear = year ? parseInt(year) : currentDate.getFullYear();
      let reportMonth = month ? parseInt(month) : currentDate.getMonth() + 1; // Adjust to 1-based month

      // Convert numeric month to string month name
      const reportMonthName = monthNames[reportMonth - 1]; // Convert 1-based month to 0-based index

      // Get all budgets for the user and the specified month-year
      const budgets = await Budget.find({
        userEmail,
        month: reportMonthName, // Store the month as a string (e.g., "April")
      });

      // Get all expenses for the specified month and year
      const startDate = new Date(reportYear, reportMonth - 1, 1); // First day of the month
      const endDate = new Date(reportYear, reportMonth, 0); // Last day of the month

      const expenses = await Transaction.find({
        userEmail,
        type: "expense",
        transactionDate: { $gte: startDate, $lte: endDate },
      });

      // Map expenses to categories
      const categoryExpenses = {};
      expenses.forEach((expense) => {
        if (!categoryExpenses[expense.category]) {
          categoryExpenses[expense.category] = 0;
        }
        categoryExpenses[expense.category] += expense.amount;
      });

      // Create the budget vs actual report
      const report = budgets.map((budget) => {
        const actualSpent = categoryExpenses[budget.category] || 0;
        const remainingBudget = budget.amount - actualSpent;
        const percentageUsed =
          budget.amount > 0 ? parseFloat(((actualSpent / budget.amount) * 100).toFixed(2)) : 0;

        return {
          category: budget.category,
          budgetAmount: budget.amount,
          actualSpent,
          remainingBudget,
          percentageUsed,
          status:
            percentageUsed >= 100
              ? "exceeded"
              : percentageUsed >= 80
              ? "warning"
              : "good",
        };
      });

      // Calculate totals
      const totals = {
        totalBudget: report.reduce((sum, item) => sum + item.budgetAmount, 0),
        totalSpent: report.reduce((sum, item) => sum + item.actualSpent, 0),
        totalRemaining: report.reduce((sum, item) => sum + item.remainingBudget, 0),
      };
      totals.percentageUsed =
        totals.totalBudget > 0 ? parseFloat(((totals.totalSpent / totals.totalBudget) * 100).toFixed(2)) : 0;

      // Find categories with expenses but no budget
      const unbudgetedCategories = Object.keys(categoryExpenses)
        .filter((category) => !budgets.some((budget) => budget.category === category))
        .map((category) => ({
          category,
          actualSpent: categoryExpenses[category],
          status: "unbudgeted",
        }));

      // Format the response
      const response = {
        year: reportYear,
        month: reportMonthName, // Return the month as a string (e.g., "April")
        startDate,
        endDate,
        budgetedCategories: report,
        unbudgetedCategories,
        totals,
      };

      res.status(200).json(response);
    } catch (error) {
      console.error("Error generating budget vs actual report:", error);
      res.status(500).json({ message: "Error generating budget vs actual report", error: error.message });
    }
};
const getFinancialSummary = async (req, res) => {
    try {
      // Get the user email from the authenticated user object
      const userEmail = req.user.userEmail; // Assuming req.user contains authenticated user details
  
      // Get start and end date from query parameters
      const { startDate, endDate } = req.query;
  
      // Validate that the dates are provided and are in a correct format
      const start = new Date(startDate);
      const end = new Date(endDate);
  
      // Ensure the start date is before the end date
      if (start > end) {
        return res.status(400).json({ message: "Start date cannot be after end date" });
      }
  
      // Get all transactions for the user within the specified date range
      const transactions = await Transaction.find({
        userEmail,
        transactionDate: { $gte: start, $lte: end },
      });
  
      // Calculate total income, total expense, and other summary details
      let totalIncome = 0;
      let totalExpense = 0;
      let transactionCount = transactions.length;
      let largestExpenseCategory = { category: null, amount: 0 };
      let largestIncomeCategory = { category: null, amount: 0 };
  
      const categoryExpenses = {};
      const categoryIncomes = {};
  
      transactions.forEach((transaction) => {
        const amount = transaction.amount;
        const category = transaction.category;
  
        if (transaction.type === "income") {
          totalIncome += amount;
          categoryIncomes[category] = (categoryIncomes[category] || 0) + amount;
          if (categoryIncomes[category] > largestIncomeCategory.amount) {
            largestIncomeCategory = { category, amount: categoryIncomes[category] };
          }
        } else if (transaction.type === "expense") {
          totalExpense += amount;
          categoryExpenses[category] = (categoryExpenses[category] || 0) + amount;
          if (categoryExpenses[category] > largestExpenseCategory.amount) {
            largestExpenseCategory = { category, amount: categoryExpenses[category] };
          }
        }
      });
  
      // Calculate net savings
      const netSavings = totalIncome - totalExpense;
  
      // Calculate savings rate as a percentage
      const savingsRate = totalIncome > 0 ? ((netSavings / totalIncome) * 100).toFixed(2) : 0;
  
      // Prepare the response
      const response = {
        totalIncome,
        totalExpense,
        netSavings,
        savingsRate,
        transactionCount,
        largestExpenseCategory,
        largestIncomeCategory,
      };
  
      res.status(200).json(response);
  
    } catch (error) {
      console.error("Error generating financial summary:", error);
      res.status(500).json({ message: "Error generating financial summary", error: error.message });
    }
  };
  
  
module.exports = { 
    getSpendingTrends, 
    getIncomeExpenseReport,
    getCategoryBreakdownReport,
    getTypeBreakdownReport,
    getBudgetVsActual,
    getFinancialSummary
 };

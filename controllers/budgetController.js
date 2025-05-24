const Budget = require("../models/Budget");
const monthMap = {
    "jan": "January", "feb": "February", "mar": "March",
    "apr": "April", "may": "May", "jun": "June",
    "jul": "July", "aug": "August", "sep": "September",
    "oct": "October", "nov": "November", "dec": "December"
};

// Function to format month input correctly
const formatMonth = (inputMonth) => {
    if (!inputMonth) return null;
    
    const trimmedMonth = inputMonth.trim();  // Trim whitespace
    const lowerCaseMonth = trimmedMonth.toLowerCase(); // Convert to lowercase

    // Check if input is already a valid full month name
    const fullMonths = Object.values(monthMap);
    if (fullMonths.includes(trimmedMonth)) {
        return trimmedMonth;  // Return as-is if it's a full valid month
    }

    // Check if it's a valid abbreviation and convert it
    return monthMap[lowerCaseMonth] || null; 
};

// Controller function to add a budget
const addBudget = async (req, res) => {
    try {
        const { userEmail, amount, category, month, currency } = req.body;

        // Validate request body
        if (!userEmail || !amount || !month || !category || !currency) {
            return res.status(400).json({ message: "All fields are required" });
        }

        // Format the month correctly
        const formattedMonth = formatMonth(month);
        if (!formattedMonth) {
            return res.status(400).json({ message: "Invalid month format. Use full month name or abbreviation (e.g., 'March' or 'Mar')." });
        }

        // Check if a budget for the same user, category, and month already exists
        const existingBudget = await Budget.findOne({ userEmail, category, month: formattedMonth });
        if (existingBudget) {
            return res.status(400).json({ message: "Budget for this category already exists for the selected month." });
        }

        // Create and save new budget
        const newBudget = new Budget({
            userEmail,
            amount,
            category,
            month: formattedMonth,
            currency
        });

        await newBudget.save();

        res.status(201).json({ message: "Budget set successfully", budget: newBudget });
    } catch (error) {
        console.error("Error adding budget:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

//get budget status- to change
const getBudgetStatus = async (req, res) => {
    try {
        const { category, month } = req.body;

        if (!category || !month) {
            return res.status(400).json({ message: "Category and month are required" });
        }

        // Convert month format
        const formattedMonth = formatMonth(month);
        if (!formattedMonth) {
            return res.status(400).json({ message: "Invalid month format. Use full name or abbreviation (e.g., 'March' or 'Mar')." });
        }

        // Find the budget for the user, category, and month
        const budget = await Budget.findOne({
            userEmail: req.user.email,
            category,
            month: formattedMonth
        });

        if (!budget) {
            return res.status(404).json({ message: "No budget found for this category and month" });
        }

        res.status(200).json({budget});

    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

//get recommendations for budget
const getBudgetRecommendations = async (req, res) => {
    try {
        const { month, category, spentAmountSoFar } = req.body; // Retrieve the month, category, and spentAmountSoFar from the query

        // Check if the required parameters are passed
        if (!spentAmountSoFar || !month || !category) {
            return res.status(400).json({ message: "month, category, and spentAmountSoFar are required" });
        }

        // Get the budget for the specific category and month
        const budget = await Budget.findOne({ userEmail: req.user.email, month, category });

        if (!budget) {
            return res.status(404).json({ message: "No budget found for this category and month" });
        }

        let recommendation = "No change needed";

        // Compare the spent amount with the budgeted amount
        const spentAmount = parseFloat(spentAmountSoFar); // Convert the spent amount to float for comparison
        const budgetAmount = budget.amount;

        if (spentAmount > budgetAmount) {
            recommendation = `You are over the budget allocated`;

        } else if (spentAmount < budgetAmount) {
            const remainingAmount=budgetAmount-spentAmount;
            recommendation = `Remaining amount left for this month is ${remainingAmount} for ${category}`;
        }

        res.status(200).json({
            category: category,
            budget: budgetAmount,
            spent: spentAmount,
            recommendation
        });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};
//get goals
const getBudget = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: "Unauthorized access" });
        }

        // If user is admin, return all transactions
        if (req.user.role === 'admin') {
            const budgets = await Budget.find().sort({ createdAt: -1 });
            return res.status(200).json(budgets);
        }

        // If user is not admin, return only their own transactions
        const budgets = await Budget.find({ userEmail: req.user.email }).sort({ createdAt: -1 });
        res.status(200).json(budgets);

        // Include progressPercentage in the response
        res.status(200).json(budgets.map(goal => ({
            ...budgets.toObject(),
            progressPercentage: budgets.progressPercentage.toFixed(2) // Keep 2 decimal places
        })));

    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};


module.exports={
    addBudget,
    getBudgetStatus,
    getBudgetRecommendations,
    getBudget
}

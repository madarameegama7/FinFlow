const Transaction=require("../models/Transaction");
const Goal=require("../models/Goal");
const mongoose=require('mongoose')
const moment = require('moment')

//get all transactions
const getTransactions = async (req, res) => {
    try {
        
        if (!req.user) {
            return res.status(401).json({ message: "Unauthorized access" });
        }

        // If user is admin, return all transactions
        if (req.user.role === 'admin') {
            const transactions = await Transaction.find().sort({ createdAt: -1 });
            return res.status(200).json(transactions);
        }

        // If user is not admin, return only their own transactions
        const transactions = await Transaction.find({ userEmail: req.user.email }).sort({ createdAt: -1 });
        res.status(200).json(transactions);

    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};


//get transactions by tag
const getTransactionByTag = async (req, res) => {
    try {
        let { tag } = req.params;
        
        // Ensure tag has '#' prefix (since your DB stores tags like "#lunch")
        if (!tag.startsWith("#")) {
            tag = `#${tag}`;
        }
        if(req.user.role==='admin'){
            const transactions = await Transaction.find({ tags: { $in: [tag] } }).sort({createdAt:-1});

            if (transactions.length === 0) {
                return res.status(404).json({ message: "No transactions found for this tag" });
            }
    
            res.status(200).json(transactions);
        }

        if(req.user.role==='user'){
            const transactions = await Transaction.find({ tags: { $in: [tag] }, userEmail:req.user.email }).sort({createdAt:-1});

            if (transactions.length === 0) {
                return res.status(404).json({ message: "No transactions found for this tag" });
            }
    
            res.status(200).json(transactions);
        }

        

       
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

//get a single transaction by id- to do
const getTransactionById = async(req,res) =>{
    const {id} = req.params

    if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(404).json({
            message:"No such transaction"
        })
    }
    const transaction=await Transaction.findById({ _id: id, userId: req.user.id });

    if(!transaction){
        return res.status(403).json({
            message:'Unauthorized or transaction not found'
        })
    }

    res.status(200).json(transaction)
}

//create transaction for specific user
const addTransaction = async (req, res) => {
    try {
        const { type, amount, category, tags, transactionDate, description, recurring, autoSave,currency } = req.body;
        const userEmail = req.user.email;

        // Validate required fields
        if (!type || !amount || !category || !transactionDate) {
            return res.status(400).json({
                message: "All required fields must be filled"
            });
        }

        // Validate transaction type
        if (!["income", "expense"].includes(type)) {
            return res.status(400).json({
                message: "Invalid transaction type. Must be income or expense"
            });
        }

        // Validate category
        const validCategories = ["Food", "Transportation", "Entertainment", "Bills", "Salary", "Investments", "Savings", "Other"];
        if (!validCategories.includes(category)) {
            return res.status(400).json({
                message: "Invalid category"
            });
        }

        // Create new transaction
        const newTransaction = new Transaction({
            userEmail,
            type,
            amount,
            category,
            tags,
            transactionDate,
            description,
            recurring,
            autoSave,
            currency
        });

        await newTransaction.save();

        let allocatedGoal = null;

        if (type === "income" && autoSave === true) {
            const goals = await Goal.find({ userEmail }).sort({ priorityLevel: 1 }); // Sort by priority

            for (const goal of goals) {
                if (goal.autoSavePercentage > 0 && goal.savedAmount < goal.targetAmount) {
                    const autoSaveAmount = (goal.autoSavePercentage / 100) * amount;

                    if (autoSaveAmount > 0) {
                        // Create a Savings Transaction (Expense)
                        const savingsTransaction = new Transaction({
                            userEmail,
                            type: "expense",
                            amount: autoSaveAmount,
                            category: "Savings",
                            description: `Auto-save for goal: ${goal.title}`,
                            transactionDate: new Date(),
                            goalId: goal._id,
                        });

                        await savingsTransaction.save();

                        // Update Goal's Saved Amount
                        goal.savedAmount += autoSaveAmount;
                        await goal.save();

                        allocatedGoal = goal;
                        break; // Stop after first valid goal
                    }
                }
            }
        }

        res.status(201).json({
            message: "Transaction saved successfully",
            transaction: newTransaction,
            autoSavedGoal: allocatedGoal
                ? {
                      goalId: allocatedGoal._id,
                      title: allocatedGoal.title,
                      savedAmount: allocatedGoal.savedAmount,
                  }
                : "No auto-savings applied",
        });

    } catch (error) {
        console.error("Error adding transaction:", error);
        res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
};


//delete-only for logged in user
const deleteTransaction=async(req,res)=>{
    const {id}=req.params

    if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(404).json({
            message:"No such transaction"
        })
    }
    const transaction=await Transaction.findOneAndDelete({_id: id, userEmail: req.user.email })

    if(!transaction){
        return res.status(403).json({
            message:'Unauthorized or transaction not found'
        })
    }
    res.status(200).json({
        message: "Transaction deleted successfully", transaction
    })
}

//update- only for relevant user
const updateTransaction=async(req,res)=>{
    const {id}=req.params

    if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(404).json({
            message:"No such transaction"
        })
    }

    const transaction = await Transaction.findOneAndUpdate(
        { _id: id, userEmail: req.user.email },
        { ...req.body },
        { new: true }
    );

    if(!transaction){
        return res.status(403).json({
            message:'Unauthorized or transaction not found'
        })
    }
    res.status(200).json(transaction)
}

const getUpcomingRecurringTransactions = async (req, res) => {
    try {
        let transactions;

        // Fetch transactions based on user role
        if (req.user.role === 'admin') {
            transactions = await Transaction.find({ "recurring.isRecurring": true });
        } else {
            transactions = await Transaction.find({ 
                userEmail: req.user.email, 
                "recurring.isRecurring": true 
            });
        }

        const today = moment().startOf('day');

        const upcomingTransactions = transactions.map(transaction => {
            const lastTransactionDate = moment(transaction.transactionDate);
            let nextTransactionDate = lastTransactionDate.clone();

            // Determine the next occurrence based on frequency
            switch (transaction.recurring.frequency) {
                case 'daily':
                    nextTransactionDate = lastTransactionDate.add(1, 'days');
                    break;
                case 'weekly':
                    nextTransactionDate = lastTransactionDate.add(1, 'weeks');
                    break;
                case 'monthly':
                    nextTransactionDate = lastTransactionDate.add(1, 'months');
                    break;
                case 'yearly':
                    nextTransactionDate = lastTransactionDate.add(1, 'years');
                    break;
                default:
                    nextTransactionDate = null;
            }

            return {
                category: transaction.category,
                amount: transaction.amount,
                nextTransactionDate: nextTransactionDate ? nextTransactionDate.toISOString() : null,
            };
        });

        res.status(200).json(upcomingTransactions);
    } catch (error) {
        console.error("Error fetching recurring transactions:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};



module.exports={
    addTransaction,
    getTransactionByTag,
    getTransactions,
    getTransactionById,
    deleteTransaction,
    updateTransaction,
    getUpcomingRecurringTransactions
}
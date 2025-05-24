const Goal = require('../models/Goal');
const User = require('../models/User');
const { getExchangeRate } = require('./currencyController');

exports.saveGoal = async (req, res) => {
  try {
    const { title, targetAmount, deadline, autoSavePercentage, currency } = req.body;
    if (!title || !targetAmount || !deadline || !autoSavePercentage || !currency) {
      return res.status(400).json({
        message: "All fields (title, targetAmount, deadline, autoSavePercentage, currency) are required.",
      });
    }

    const user = await User.findOne({ email: req.user.email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    let convertedAmount = targetAmount;
    if (currency !== user.preferredCurrency) {
      const rate = await getExchangeRate(currency, user.preferredCurrency);
      convertedAmount = targetAmount * rate;
    }

    const goal = new Goal({
      title,
      targetAmount: convertedAmount,
      deadline,
      autoSavePercentage,
      currency,
      userEmail: req.user.email,
    });

    await goal.save();
    return res.status(201).json({ message: "Goal saved successfully", goal });

  } catch (error) {
    return res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

exports.updateGoal = async (req, res) => {
  try {
    const { savedAmount } = req.body;
    const goal = await Goal.findOneAndUpdate(
      { _id: req.params.goalId, userEmail: req.user.email },
      { savedAmount },
      { new: true }
    );

    if (!goal) {
      return res.status(400).json({ message: "Cannot save more than target amount" });
    }

    return res.status(200).json({ message: "Goal updated successfully", goal });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.getGoals = async (req, res) => {
  try {
    const goals = req.user.isAdmin ? await Goal.find() : await Goal.find({ userEmail: req.user.email });
    return res.status(200).json(goals);
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.getAllGoals = async (req, res) => {
    try {
        
        if (!req.user) {
            return res.status(401).json({ message: "Unauthorized access" });
        }

        // If user is admin, return all transactions
        if (req.user.role === 'admin') {
            const goals = await Goal.find().sort({ createdAt: -1 });
            return res.status(200).json(goals);
        }

        // If user is not admin, return only their own transactions
        const goals = await Goal.find({ userEmail: req.user.email }).sort({ createdAt: -1 });
        res.status(200).json(goals);

    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};
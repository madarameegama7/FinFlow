const Transaction = require('../models/Transaction');
const Goal = require('../models/Goal');
const moment = require('moment');

const detectUnusualSpending = async (req, res) => {
  try {
      const userEmail = req.user.email;
      console.log("User Email:", userEmail);

      // Fetch transactions
      const transactions = await Transaction.find({ userEmail });
      console.log("Fetched Transactions:", transactions); // Debugging

      if (transactions.length === 0) {
          return res.status(200).json({ message: "No transactions found for this user.", notifications: [] });
      }

      // Filter only expense transactions
      const expenseTransactions = transactions.filter(txn => txn.type === 'expense');

      // Categorize expense transactions
      const categorySpending = {};
      expenseTransactions.forEach(transaction => {
          const amount = transaction.amount;
          const category = transaction.category;
          categorySpending[category] = categorySpending[category] || [];
          categorySpending[category].push(amount);
      });

      // Detect unusual spending
      const unusualTransactions = [];
      for (let category in categorySpending) {
          const amounts = categorySpending[category];
          const avgAmount = 30000; // Threshold for unusual spending
          console.log(`Category: ${category}, Avg Amount: ${avgAmount}, Amounts: ${amounts}`); // Debugging

          amounts.forEach(amount => {
              if (amount > 2 * avgAmount) {
                  console.log(`Unusual transaction detected: ${category}, ${amount}`); // Debugging
                  unusualTransactions.push({
                      category,
                      amount,
                      alert: `Unusual spending detected in ${category} of amount ${amount}`
                  });
              }
          });
      }

      res.status(200).json({
          message: "Unusual Spending Detection",
          notifications: unusualTransactions
      });

  } catch (error) {
      console.error("Error detecting unusual spending:", error);
      res.status(500).json({ message: "Error detecting unusual spending", error: error.message });
  }
};

const sendReminders = async (req,res) => {
    try {
        const today = moment();
        const reminderDate = today.add(7, 'days'); // Send reminder 7 days before due date

        // Fetch upcoming financial goals
        const upcomingGoals = await Goal.find({
            deadline: { $lte: reminderDate.toDate() }
        });


        for (const goal of upcomingGoals) {
            await emailService.sendEmail(goal.userEmail, `Reminder: Financial Goal - ${goal.name}`,
                `Your financial goal "${goal.title}" has a deadline on ${moment(goal.deadline).format('YYYY-MM-DD')}. Keep saving to reach your target of ${goal.targetAmount}.`);
        }

        console.log("Reminders sent successfully.");
    } catch (error) {
        console.error("Error sending reminders:", error);
    }
};


module.exports = {
  detectUnusualSpending,
  sendReminders
};

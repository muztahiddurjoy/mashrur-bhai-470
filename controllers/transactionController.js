const Transaction = require('../models/Transaction');
const Budget = require('../models/Budget');
// const { sendNotification } = require('../utils/notifications');

// Create a new transaction
exports.createTransaction = async (req, res) => {
  try {
    const { type, amount, description, category, date, tags } = req.body;
    
    const transaction = new Transaction({
      userId: req.user.id,
      type,
      amount,
      description,
      category,
      date: date || Date.now(),
      tags
    });

    await transaction.save();
    
    // Check if this expense exceeds any budget
    if (type === 'expense') {
      await checkBudgetAlerts(req.user.id, category, amount);
    }

    res.status(201).json({
      success: true,
      data: transaction
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get all transactions with filtering
exports.getTransactions = async (req, res) => {
  try {
    const { page = 1, limit = 10, type, category, startDate, endDate } = req.query;
    
    let query = { userId: req.user.id };
    
    if (type) query.type = type;
    if (category) query.category = category;
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }
    
    const transactions = await Transaction.find(query)
      .sort({ date: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await Transaction.countDocuments(query);
    
    res.json({
      success: true,
      data: transactions,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Update a transaction
exports.updateTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }
    
    res.json({
      success: true,
      data: transaction
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Delete a transaction
exports.deleteTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id
    });
    
    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Transaction deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Helper function to check budget alerts
async function checkBudgetAlerts(userId, category, amount) {
  try {
    const budgets = await Budget.find({ 
      userId, 
      category, 
      isActive: true 
    });
    
    for (const budget of budgets) {
      const now = new Date();
      let startDate, endDate;
      
      if (budget.period === 'monthly') {
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      } else {
        // Weekly - get start of week (Monday)
        const day = now.getDay();
        const diff = now.getDate() - day + (day === 0 ? -6 : 1);
        startDate = new Date(now.setDate(diff));
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + 6);
        endDate.setHours(23, 59, 59, 999);
      }
      
      const totalSpent = await Transaction.aggregate([
        {
          $match: {
            userId: userId,
            type: 'expense',
            category: category,
            date: { $gte: startDate, $lte: endDate }
          }
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$amount' }
          }
        }
      ]);
      
      const spent = totalSpent.length > 0 ? totalSpent[0].total : 0;
      const percentage = (spent / budget.limit) * 100;
      
      if (percentage >= budget.alertThreshold) {
        // Send notification
        // await sendNotification(
        //   userId,
        //   `Budget Alert: You've reached ${Math.round(percentage)}% of your ${budget.category} budget`,
        //   'budget_alert'
        // );
      }
    }
  } catch (error) {
    console.error('Error checking budget alerts:', error);
  }
}
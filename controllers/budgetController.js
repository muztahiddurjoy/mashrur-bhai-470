const Budget = require('../models/Budget');
const Transaction = require('../models/Transaction');

// Create a new budget
exports.createBudget = async (req, res) => {
  try {
    const { category, limit, period, alertThreshold } = req.body;
    
    const budget = new Budget({
      userId: req.user.id,
      category,
      limit,
      period: period || 'monthly',
      alertThreshold: alertThreshold || 80
    });

    await budget.save();
    
    res.status(201).json({
      success: true,
      data: budget
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Budget already exists for this category and period'
      });
    }
    
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get all budgets
exports.getBudgets = async (req, res) => {
  try {
    const budgets = await Budget.find({ userId: req.user.id });
    
    // Calculate current spending for each budget
    const budgetsWithSpending = await Promise.all(
      budgets.map(async (budget) => {
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
              userId: req.user.id,
              type: 'expense',
              category: budget.category,
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
        const percentage = budget.limit > 0 ? (spent / budget.limit) * 100 : 0;
        
        return {
          ...budget.toObject(),
          spent,
          percentage: Math.min(100, Math.round(percentage))
        };
      })
    );
    
    res.json({
      success: true,
      data: budgetsWithSpending
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Update a budget
exports.updateBudget = async (req, res) => {
  try {
    const budget = await Budget.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!budget) {
      return res.status(404).json({
        success: false,
        message: 'Budget not found'
      });
    }
    
    res.json({
      success: true,
      data: budget
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Delete a budget
exports.deleteBudget = async (req, res) => {
  try {
    const budget = await Budget.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id
    });
    
    if (!budget) {
      return res.status(404).json({
        success: false,
        message: 'Budget not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Budget deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
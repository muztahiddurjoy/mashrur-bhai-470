const Transaction = require('../models/Transaction');
const Goal = require('../models/Goal');
const { analyzeSpendingPatterns } = require('../utils/aiAnalysis');

// Get financial reports
exports.getReports = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const userId = req.user.id;
    
    // Date filters
    const dateFilter = {};
    if (startDate) dateFilter.$gte = new Date(startDate);
    if (endDate) dateFilter.$lte = new Date(endDate);
    
    // Get income vs expenses
    const incomeExpense = await Transaction.aggregate([
      {
        $match: {
          userId: userId,
          ...(startDate || endDate ? { date: dateFilter } : {})
        }
      },
      {
        $group: {
          _id: '$type',
          total: { $sum: '$amount' }
        }
      }
    ]);
    
    // Get category-wise spending
    const categorySpending = await Transaction.aggregate([
      {
        $match: {
          userId: userId,
          type: 'expense',
          ...(startDate || endDate ? { date: dateFilter } : {})
        }
      },
      {
        $group: {
          _id: '$category',
          total: { $sum: '$amount' }
        }
      },
      {
        $sort: { total: -1 }
      }
    ]);
    
    // Get monthly trends
    const monthlyTrends = await Transaction.aggregate([
      {
        $match: {
          userId: userId,
          ...(startDate || endDate ? { date: dateFilter } : {})
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' },
            type: '$type'
          },
          total: { $sum: '$amount' }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }
      }
    ]);
    
    // Get goals progress
    const goals = await Goal.find({ userId: userId });
    
    // AI Analysis
    const aiInsights = await analyzeSpendingPatterns(userId, startDate, endDate);
    
    res.json({
      success: true,
      data: {
        incomeExpense,
        categorySpending,
        monthlyTrends,
        goals,
        aiInsights
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
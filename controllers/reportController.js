const Transaction = require('../models/Transaction');
const Goal = require('../models/Goal');
const { analyzeSpendingPatterns } = require('../utils/aiAnalysis');

exports.getReports = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const userId = req.user.id;
    
    // Date filters
    const dateFilter = {};
    if (startDate) dateFilter.$gte = new Date(startDate);
    if (endDate) dateFilter.$lte = new Date(endDate);
    
    // Get financial data
    const [incomeExpense, categorySpending, monthlyTrends, goals] = await Promise.all([
      this.getIncomeExpenseData(userId, dateFilter),
      this.getCategorySpending(userId, dateFilter),
      this.getMonthlyTrends(userId, dateFilter),
      Goal.find({ userId: userId })
    ]);
    
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

// Add new endpoint for detailed AI analysis
exports.getDetailedAnalysis = async (req, res) => {
  try {
    const { startDate, endDate, analysisType } = req.query;
    const userId = req.user.id;
    
    const analysis = await geminiService.generateDetailedReport(
      userId, 
      startDate, 
      endDate, 
      analysisType
    );
    
    res.json({
      success: true,
      data: analysis
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
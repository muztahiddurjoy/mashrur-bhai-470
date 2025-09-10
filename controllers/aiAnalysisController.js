const geminiService = require('../services/geminiService');
const Transaction = require('../models/Transaction');
const Budget = require('../models/Budget');
const Goal = require('../models/Goal');

exports.getSpendingAnalysis = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const userId = req.user.id;
    
    const transactions = await Transaction.find({
      userId,
      ...(startDate || endDate ? { 
        date: {
          ...(startDate && { $gte: new Date(startDate) }),
          ...(endDate && { $lte: new Date(endDate) })
        }
      } : {})
    });
    
    const analysis = await geminiService.analyzeSpendingPatterns(
      userId, 
      transactions, 
      `${startDate} to ${endDate}`
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

exports.getFinancialAdvice = async (req, res) => {
  try {
    const { goals, riskTolerance, timeHorizon } = req.body;
    const userId = req.user.id;
    
    // Get user financial data
    const userData = await this.getUserFinancialSnapshot(userId);
    
    const advice = await geminiService.generateFinancialAdvice(
      userData,
      goals,
      { riskTolerance, timeHorizon }
    );
    
    res.json({
      success: true,
      data: advice
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
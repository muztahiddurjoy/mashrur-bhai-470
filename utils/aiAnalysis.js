const geminiService = require('../services/geminiService');
const Transaction = require('../models/Transaction');
const Budget = require('../models/Budget');

exports.analyzeSpendingPatterns = async (userId, startDate, endDate) => {
  try {
    // Get transactions for the period
    const transactions = await Transaction.find({
      userId,
      date: { $gte: new Date(startDate), $lte: new Date(endDate) }
    }).sort({ date: 1 });

    // Get budget information
    const budgets = await Budget.find({ userId });
    
    // Prepare data for AI analysis
    const financialData = {
      transactions: transactions.map(t => ({
        type: t.type,
        amount: t.amount,
        category: t.category,
        date: t.date,
        description: t.description
      })),
      budgets: budgets.map(b => ({
        category: b.category,
        limit: b.limit,
        period: b.period
      })),
      analysisPeriod: { startDate, endDate }
    };

    // Get AI analysis
    const aiAnalysis = await geminiService.analyzeSpendingPatterns(
      userId, 
      financialData, 
      `${startDate} to ${endDate}`
    );

    // Add traditional analysis
    const traditionalAnalysis = await this.calculateTraditionalMetrics(transactions, budgets);
    
    return {
      ...aiAnalysis,
      traditionalMetrics: traditionalAnalysis,
      timestamp: new Date()
    };
  } catch (error) {
    console.error('AI Analysis error:', error);
    throw error;
  }
};

exports.calculateTraditionalMetrics = async (transactions, budgets) => {
  // Existing traditional analysis logic
  // ... (keep your current implementation)
};
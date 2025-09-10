const Transaction = require('../models/Transaction');

// Analyze spending patterns and provide insights
exports.analyzeSpendingPatterns = async (userId, startDate, endDate) => {
  try {
    // Date filters
    const dateFilter = {};
    if (startDate) dateFilter.$gte = new Date(startDate);
    if (endDate) dateFilter.$lte = new Date(endDate);
    
    // Get transactions for analysis
    const transactions = await Transaction.find({
      userId,
      ...(startDate || endDate ? { date: dateFilter } : {})
    }).sort({ date: 1 });
    
    if (transactions.length === 0) {
      return {
        insights: ["Not enough data for analysis yet."],
        recommendations: ["Start adding your income and expenses to get personalized insights."]
      };
    }
    
    // Calculate basic statistics
    const expenses = transactions.filter(t => t.type === 'expense');
    const income = transactions.filter(t => t.type === 'income');
    
    const totalExpenses = expenses.reduce((sum, t) => sum + t.amount, 0);
    const totalIncome = income.reduce((sum, t) => sum + t.amount, 0);
    const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome) * 100 : 0;
    
    // Category analysis
    const categorySpending = {};
    expenses.forEach(expense => {
      if (!categorySpending[expense.category]) {
        categorySpending[expense.category] = 0;
      }
      categorySpending[expense.category] += expense.amount;
    });
    
    // Find top spending categories
    const topCategories = Object.entries(categorySpending)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);
    
    // Generate insights
    const insights = [];
    const recommendations = [];
    
    // Savings rate insight
    if (savingsRate < 0) {
      insights.push("You're spending more than you earn. This is not sustainable in the long term.");
      recommendations.push("Focus on reducing expenses or increasing income to achieve a positive savings rate.");
    } else if (savingsRate < 10) {
      insights.push(`Your savings rate is ${savingsRate.toFixed(1)}%, which is below the recommended 20%.`);
      recommendations.push("Try to identify areas where you can reduce spending to increase your savings rate.");
    } else if (savingsRate >= 20) {
      insights.push(`Great job! Your savings rate is ${savingsRate.toFixed(1)}%, which is excellent.`);
    } else {
      insights.push(`Your savings rate is ${savingsRate.toFixed(1)}%.`);
    }
    
    // Top categories insight
    if (topCategories.length > 0) {
      insights.push(`Your top spending categories are: ${topCategories.map(c => c[0]).join(', ')}.`);
      
      if (topCategories[0][1] > totalExpenses * 0.4) {
        recommendations.push(`Consider reviewing your spending on ${topCategories[0][0]} as it represents a large portion of your expenses.`);
      }
    }
    
    // Monthly trend analysis
    const monthlyData = {};
    transactions.forEach(t => {
      const monthYear = `${t.date.getFullYear()}-${t.date.getMonth() + 1}`;
      if (!monthlyData[monthYear]) {
        monthlyData[monthYear] = { income: 0, expenses: 0 };
      }
      
      if (t.type === 'income') {
        monthlyData[monthYear].income += t.amount;
      } else {
        monthlyData[monthYear].expenses += t.amount;
      }
    });
    
    const months = Object.keys(monthlyData);
    if (months.length > 1) {
      const current = monthlyData[months[months.length - 1]];
      const previous = monthlyData[months[months.length - 2]];
      
      const expenseChange = ((current.expenses - previous.expenses) / previous.expenses) * 100;
      
      if (expenseChange > 15) {
        insights.push(`Your expenses increased by ${expenseChange.toFixed(1)}% compared to the previous month.`);
        recommendations.push("Review your recent transactions to understand what caused the increase in spending.");
      } else if (expenseChange < -15) {
        insights.push(`Your expenses decreased by ${Math.abs(expenseChange).toFixed(1)}% compared to the previous month. Great job!`);
      }
    }
    
    return {
      insights,
      recommendations,
      statistics: {
        totalIncome,
        totalExpenses,
        savingsRate: savingsRate.toFixed(1),
        topCategories
      }
    };
  } catch (error) {
    console.error('AI Analysis error:', error);
    return {
      insights: ["Error analyzing your financial data."],
      recommendations: ["Please try again later."]
    };
  }
};
const Goal = require('../models/Goal');

// Create a new savings goal
exports.createGoal = async (req, res) => {
  try {
    const { name, targetAmount, currentAmount, deadline, description } = req.body;
    
    const goal = new Goal({
      userId: req.user.id,
      name,
      targetAmount,
      currentAmount: currentAmount || 0,
      deadline,
      description
    });

    await goal.save();
    
    res.status(201).json({
      success: true,
      data: goal
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get all goals
exports.getGoals = async (req, res) => {
  try {
    const goals = await Goal.find({ userId: req.user.id });
    
    res.json({
      success: true,
      data: goals
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Update a goal
exports.updateGoal = async (req, res) => {
  try {
    const goal = await Goal.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!goal) {
      return res.status(404).json({
        success: false,
        message: 'Goal not found'
      });
    }
    
    // Check if goal is achieved
    if (goal.currentAmount >= goal.targetAmount && !goal.isAchieved) {
      goal.isAchieved = true;
      await goal.save();
    }
    
    res.json({
      success: true,
      data: goal
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Delete a goal
exports.deleteGoal = async (req, res) => {
  try {
    const goal = await Goal.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id
    });
    
    if (!goal) {
      return res.status(404).json({
        success: false,
        message: 'Goal not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Goal deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Add to goal savings
exports.addToGoal = async (req, res) => {
  try {
    const { amount } = req.body;
    
    const goal = await Goal.findOne({
      _id: req.params.id,
      userId: req.user.id
    });
    
    if (!goal) {
      return res.status(404).json({
        success: false,
        message: 'Goal not found'
      });
    }
    
    goal.currentAmount += amount;
    
    // Check if goal is achieved
    if (goal.currentAmount >= goal.targetAmount) {
      goal.isAchieved = true;
    }
    
    await goal.save();
    
    res.json({
      success: true,
      data: goal
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
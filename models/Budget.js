const mongoose = require('mongoose');

const budgetSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  category: {
    type: String,
    required: true
  },
  limit: {
    type: Number,
    required: true,
    min: 0
  },
  period: {
    type: String,
    enum: ['weekly', 'monthly'],
    default: 'monthly'
  },
  alertThreshold: {
    type: Number,
    min: 0,
    max: 100,
    default: 80
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

budgetSchema.index({ userId: 1, category: 1, period: 1 }, { unique: true });

module.exports = mongoose.model('Budget', budgetSchema);
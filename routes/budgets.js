const express = require('express');
const {
  createBudget,
  getBudgets,
  updateBudget,
  deleteBudget
} = require('../controllers/budgetController');
const auth = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
router.use(auth);

router.route('/')
  .post(createBudget)
  .get(getBudgets);

router.route('/:id')
  .put(updateBudget)
  .delete(deleteBudget);

module.exports = router;
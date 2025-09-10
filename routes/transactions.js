const express = require('express');
const {
  createTransaction,
  getTransactions,
  updateTransaction,
  deleteTransaction
} = require('../controllers/transactionController');
const auth = require('../middleware/auth');
const { validateTransaction } = require('../middleware/validation');

const router = express.Router();

// All routes require authentication
router.use(auth);

router.route('/')
  .post(validateTransaction, createTransaction)
  .get(getTransactions);

router.route('/:id')
  .put(validateTransaction, updateTransaction)
  .delete(deleteTransaction);

module.exports = router;s
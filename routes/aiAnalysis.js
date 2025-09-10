const express = require('express');
const {
  getSpendingAnalysis,
  getFinancialAdvice
} = require('../controllers/aiAnalysisController');
const auth = require('../middleware/auth');

const router = express.Router();

router.use(auth);

router.get('/spending-analysis', getSpendingAnalysis);
router.post('/financial-advice', getFinancialAdvice);

module.exports = router;
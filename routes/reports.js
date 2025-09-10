const express = require('express');
const { getReports } = require('../controllers/reportController');
const auth = require('../middleware/auth');

const router = express.Router();

router.use(auth);

router.get('/', getReports);

module.exports = router;
const express = require('express');
const {
  createGoal,
  getGoals,
  updateGoal,
  deleteGoal,
  addToGoal
} = require('../controllers/goalController');
const auth = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
router.use(auth);

router.route('/')
  .post(createGoal)
  .get(getGoals);

router.route('/:id')
  .put(updateGoal)
  .delete(deleteGoal);

router.post('/:id/add', addToGoal);

module.exports = router;
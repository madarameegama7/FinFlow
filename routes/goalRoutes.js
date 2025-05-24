const express = require('express');
const { saveGoal,updateGoal,getGoals,getAllGoals } = require("../controllers/goalController");
const requireAuth = require("../middleware/authMiddleware");
const router = express.Router();

// Protect the route with authentication middleware
router.post('/', requireAuth, saveGoal);
router.patch('/:id',requireAuth,updateGoal);
router.get('/',requireAuth,getGoals)
router.get('/getAllGoals',requireAuth,getAllGoals)

module.exports = router;

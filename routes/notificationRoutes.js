const express = require('express');
const { detectUnusualSpending,sendReminders } = require("../controllers/notificationController");
const requireAuth = require("../middleware/authMiddleware");
const router = express.Router();

// Protect the route with authentication middleware
router.get('/detectUnusualSpending',requireAuth,detectUnusualSpending)
router.get('/sendReminders',requireAuth,sendReminders)
module.exports = router;

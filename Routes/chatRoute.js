const express = require('express');
const { getChatHistory, markAsRead } = require('../controllers/chatController');
const { protect, allowedTo } = require('../controllers/authController');

const router = express.Router();

router.use(protect);

router.get('/:userId', getChatHistory);
router.put('/read/:senderId', markAsRead);

module.exports = router;

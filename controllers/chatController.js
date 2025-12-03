const asyncHandler = require('express-async-handler');
const Chat = require('../models/chatModel');

// @desc    Get chat history between user and admin
// @route   GET /api/v1/chat/:userId
// @access  Private/Protected
exports.getChatHistory = asyncHandler(async (req, res, next) => {
  const { userId } = req.params;
  const currentUserId = req.user._id;

  // If user is requesting, they can only see their own chat
  if (req.user.role === 'user' && userId !== currentUserId.toString()) {
    return res.status(403).json({ status: 'fail', message: 'Not authorized' });
  }

  const messages = await Chat.find({
    $or: [
      { sender: currentUserId, receiver: userId },
      { sender: userId, receiver: currentUserId },
    ],
  }).sort({ createdAt: 1 });

  res.status(200).json({
    status: 'success',
    results: messages.length,
    data: messages,
  });
});

// @desc    Mark messages as read
// @route   PUT /api/v1/chat/read/:senderId
// @access  Private
exports.markAsRead = asyncHandler(async (req, res, next) => {
  const { senderId } = req.params;
  const receiverId = req.user._id;

  await Chat.updateMany(
    { sender: senderId, receiver: receiverId, isRead: false },
    { $set: { isRead: true } }
  );

  res.status(200).json({ status: 'success' });
});

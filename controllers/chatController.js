const asyncHandler = require("express-async-handler");
const { Conversation, Message } = require("../models/chatModel");

// @desc    Get All Conversations for User (or Admin seeing all)
// @route   GET /api/v1/chat/conversations
// @access  Private
exports.getConversations = asyncHandler(async (req, res, next) => {
  let query = { participants: req.user._id };
  if (req.user.role === 'admin' || req.user.role === 'super-admin') {
      // IF admin, show all conversations.
      // Ideally we might want filter by user, but "watch" implies seeing everything.
      query = {};
  }
  
  const conversations = await Conversation.find(query)
    .populate("participants", "name email profileImg")
    .populate("lastMessage");

  res.status(200).json({ status: "success", results: conversations.length, data: conversations });
});

// @desc    Get Messages for Conversation
// @route   GET /api/v1/chat/:conversationId
// @access  Private
exports.getMessages = asyncHandler(async (req, res, next) => {
  const messages = await Message.find({ conversationId: req.params.conversationId })
    .populate("sender", "name");

  res.status(200).json({ status: "success", results: messages.length, data: messages });
});

// @desc    Start Conversation
// @route   POST /api/v1/chat
// @access  Private
exports.startConversation = asyncHandler(async (req, res, next) => {
  const { receiverId } = req.body;
  // Check if exists
  let conversation = await Conversation.findOne({
    participants: { $all: [req.user._id, receiverId] },
  });

  if (!conversation) {
    conversation = await Conversation.create({
      participants: [req.user._id, receiverId],
    });
  }

  res.status(200).json({ status: "success", data: conversation });
});

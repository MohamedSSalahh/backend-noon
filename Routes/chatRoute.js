const express = require("express");
const { getConversations, getMessages, startConversation, sendMessage } = require("../controllers/chatController");
const authService = require("../controllers/authController"); 

const router = express.Router();

router.use(authService.protect);

router.route("/conversations").get(getConversations);
router.route("/").post(startConversation);
router.route("/:conversationId").get(getMessages);
router.route("/message").post(sendMessage);

module.exports = router;

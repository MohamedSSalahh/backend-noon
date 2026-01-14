const express = require("express");
const { getConversations, getMessages, startConversation } = require("../controllers/chatController");
const authService = require("../controllers/authController"); 

const router = express.Router();

router.use(authService.protect);

router.route("/conversations").get(getConversations);
router.route("/").post(startConversation);
router.route("/:conversationId").get(getMessages);

module.exports = router;

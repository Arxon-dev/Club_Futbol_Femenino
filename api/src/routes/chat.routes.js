const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chat.controller');
const { verifyToken } = require('../middleware/auth.middleware');

router.get('/', verifyToken, chatController.getMessages);
router.post('/', verifyToken, chatController.sendMessage);

module.exports = router;

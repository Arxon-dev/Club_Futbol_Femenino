const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chat.controller');
const { verifyToken } = require('../middleware/auth.middleware');

router.get('/', verifyToken, chatController.getMessages);
router.get('/private/:userId', verifyToken, chatController.getPrivateMessages);
router.post('/', verifyToken, chatController.sendMessage);
router.delete('/:id', verifyToken, chatController.deleteMessage);

module.exports = router;

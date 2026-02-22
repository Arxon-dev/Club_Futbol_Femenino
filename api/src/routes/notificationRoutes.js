const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { verifyToken, isAdmin, verifyRole } = require('../middleware/auth.middleware');

// Protect these routes so only ADMIN or COACH can send notifications manually
router.post('/send', verifyToken, verifyRole(['ADMIN', 'COACH']), notificationController.sendNotificationToUser);
router.post('/broadcast', verifyToken, verifyRole(['ADMIN', 'COACH']), notificationController.broadcastNotification);

module.exports = router;

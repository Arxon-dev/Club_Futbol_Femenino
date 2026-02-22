const { admin, isFirebaseInitialized } = require('../config/firebase');
const { User } = require('../models');
const { Op } = require('sequelize');

exports.sendNotificationToUser = async (req, res) => {
  try {
    const { userId, title, body, data } = req.body;

    if (!isFirebaseInitialized) {
      return res.status(503).json({ error: 'Firebase is not initialized on the server.' });
    }

    if (!userId || !title || !body) {
      return res.status(400).json({ error: 'Missing userId, title, or body.' });
    }

    // Find the user to get their FCM token
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    if (!user.fcmToken) {
      return res.status(400).json({ error: 'User does not have an FCM token registered.' });
    }

    const message = {
      notification: {
        title: title,
        body: body,
      },
      data: data || {},
      token: user.fcmToken,
    };

    // Send the message via Firebase Admin
    const response = await admin.messaging().send(message);
    
    res.json({ success: true, messageId: response });
  } catch (error) {
    console.error('Error sending notification:', error);
    res.status(500).json({ error: 'Failed to send notification.' });
  }
};

exports.broadcastNotification = async (req, res) => {
  try {
    const { title, body, data } = req.body;

    if (!isFirebaseInitialized) {
      return res.status(503).json({ error: 'Firebase is not initialized on the server.' });
    }

    if (!title || !body) {
      return res.status(400).json({ error: 'Missing title or body.' });
    }

    // Get all users with FCM tokens
    const users = await User.findAll({
      where: {
        fcmToken: {
          [Op.and]: [
            { [Op.ne]: null },
            { [Op.ne]: '' }
          ]
        }
      }
    });

    const tokens = users.map(u => u.fcmToken).filter(t => t);

    if (tokens.length === 0) {
      return res.status(400).json({ error: 'No registered FCM tokens found.' });
    }

    const message = {
      notification: {
        title: title,
        body: body,
      },
      data: data || {},
      tokens: tokens, // Note: messaging().sendEachForMulticast() or sendMulticast() for multiple tokens
    };

    // Send the message to multiple devices
    const response = await admin.messaging().sendEachForMulticast(message);
    
    res.json({ 
        success: true, 
        successCount: response.successCount,
        failureCount: response.failureCount
    });
  } catch (error) {
    console.error('Error broadcasting notification:', error);
    res.status(500).json({ error: 'Failed to broadcast notification.' });
  }
};

const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');

const { verifyToken } = require('../middleware/auth.middleware');

// POST /api/auth/login
router.post('/login', authController.login);

// POST /api/auth/setup (Inicialización de primer Admin)
router.post('/setup', authController.setupAdmin);

// POST /api/auth/fcm-token
router.post('/fcm-token', verifyToken, authController.updateFcmToken);

// PUT /api/auth/change-password
router.put('/change-password', verifyToken, authController.changePassword);

module.exports = router;

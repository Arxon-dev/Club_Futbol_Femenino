const express = require('express');
const router = express.Router();
const rosterController = require('../controllers/roster.controller');
const { verifyToken } = require('../middleware/auth.middleware');

// Ruta de lectura (requiere estar logueado)
router.get('/', verifyToken, rosterController.getRoster);

module.exports = router;

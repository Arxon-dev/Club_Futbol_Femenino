const express = require('express');
const router = express.Router();
const matchController = require('../controllers/match.controller');
const { verifyToken, isAdmin } = require('../middleware/auth.middleware');

// Rutas públicas (requiere estar logueado para ver)
router.get('/', verifyToken, matchController.getAllMatches);

// Rutas de Admin (crear, modificar, eliminar)
router.post('/', [verifyToken, isAdmin], matchController.createMatch);
router.put('/:id', [verifyToken, isAdmin], matchController.updateMatch);
router.delete('/:id', [verifyToken, isAdmin], matchController.deleteMatch);

module.exports = router;

const express = require('express');
const router = express.Router();
const newsController = require('../controllers/news.controller');
const { verifyToken, isAdmin } = require('../middleware/auth.middleware');

// Rutas de lectura (requiere estar logueado)
router.get('/', verifyToken, newsController.getAllNews);
router.get('/:id', verifyToken, newsController.getNewsById);

// Rutas de Admin (crear, modificar, eliminar)
router.post('/', [verifyToken, isAdmin], newsController.createNews);
router.put('/:id', [verifyToken, isAdmin], newsController.updateNews);
router.delete('/:id', [verifyToken, isAdmin], newsController.deleteNews);

module.exports = router;

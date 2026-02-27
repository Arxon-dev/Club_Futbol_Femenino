const express = require('express');
const router = express.Router();
const rosterController = require('../controllers/roster.controller');
const { verifyToken } = require('../middleware/auth.middleware');

// Middleware: solo ADMIN puede modificar la plantilla
const isAdmin = (req, res, next) => {
  if (req.role === 'ADMIN') {
    next();
  } else {
    return res.status(403).json({ message: 'Se requiere rol de Administrador' });
  }
};

// GET /api/roster — Obtener plantilla (cualquier usuario autenticado)
router.get('/', verifyToken, rosterController.getRoster);

// POST /api/roster — Añadir miembro (Admin)
router.post('/', verifyToken, isAdmin, rosterController.addMember);

// PUT /api/roster/:id — Actualizar miembro (Admin)
router.put('/:id', verifyToken, isAdmin, rosterController.updateMember);

// DELETE /api/roster/:id — Eliminar miembro (Admin)
router.delete('/:id', verifyToken, isAdmin, rosterController.removeMember);

module.exports = router;

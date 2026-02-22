const express = require('express');
const router = express.Router();
const eventController = require('../controllers/event.controller');
const { verifyToken, verifyRole } = require('../middleware/auth.middleware');

// Obtener todos los eventos (público o protegido, según convenga. De momento lo dejamos público o protegido con verifyToken)
router.get('/', eventController.getEvents);

// Crear un evento (solo ADMIN o COACH)
router.post('/', verifyToken, verifyRole(['ADMIN', 'COACH']), eventController.createEvent);

// --- RUTAS DE ASISTENCIA ---

// Registrar o actualizar asistencia (cualquier usuario logueado)
router.post('/:id/attendance', verifyToken, eventController.setAttendance);

// Obtener la asistencia de un evento (solo ADMIN o COACH)
router.get('/:id/attendance', verifyToken, verifyRole(['ADMIN', 'COACH']), eventController.getEventAttendance);

// Actualizar asistencia real masivamente (solo ADMIN o COACH)
router.put('/:id/attendance/bulk', verifyToken, verifyRole(['ADMIN', 'COACH']), eventController.bulkUpdateAttendance);

module.exports = router;

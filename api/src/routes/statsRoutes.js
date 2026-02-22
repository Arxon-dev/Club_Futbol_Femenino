const express = require('express');
const router = express.Router();
const statsController = require('../controllers/statsController');
const { verifyToken, verifyRole } = require('../middleware/auth.middleware');

// Protected statistics routes. Accessible by ADMIN and COACH.
router.use(verifyToken);
router.use(verifyRole(['ADMIN', 'COACH']));

router.get('/attendance', statsController.getAttendanceStats);
router.get('/finances', statsController.getFinanceStats);

module.exports = router;

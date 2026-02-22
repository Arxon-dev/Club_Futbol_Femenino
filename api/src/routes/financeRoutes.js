const express = require('express');
const router = express.Router();
const financeController = require('../controllers/financeController');
const { verifyToken, verifyRole } = require('../middleware/auth.middleware');

// Protect all finance routes. Allow only ADMIN or COACH to read/write for now
router.use(verifyToken);
router.use(verifyRole(['ADMIN', 'COACH']));

router.get('/', financeController.getTransactions);
router.post('/', financeController.createTransaction);
router.put('/:id', financeController.updateTransaction);
router.delete('/:id', financeController.deleteTransaction);

module.exports = router;

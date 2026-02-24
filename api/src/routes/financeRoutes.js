const express = require('express');
const router = express.Router();
const financeController = require('../controllers/financeController');
const { verifyToken, verifyRole } = require('../middleware/auth.middleware');

router.use(verifyToken);

// Player/Personal finances
router.get('/user/:userId', financeController.getUserTransactions);

// Admin/Coach routes
router.use(verifyRole(['ADMIN', 'COACH']));

router.get('/', financeController.getTransactions);
router.post('/', financeController.createTransaction);
router.put('/:id', financeController.updateTransaction);
router.delete('/:id', financeController.deleteTransaction);

module.exports = router;

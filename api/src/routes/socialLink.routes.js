const express = require('express');
const router = express.Router();
const socialLinkController = require('../controllers/socialLink.controller');
const { verifyToken, isAdmin } = require('../middleware/auth.middleware');

// Any logged-in user can read social links
router.get('/', verifyToken, socialLinkController.getLinks);

// Only admin can update social links
router.put('/', [verifyToken, isAdmin], socialLinkController.updateLinks);

module.exports = router;

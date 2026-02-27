const express = require('express');
const router = express.Router();
const presidentLetterController = require('../controllers/presidentLetter.controller');
const { verifyToken, isAdmin } = require('../middleware/auth.middleware');

// Public route to get the letter (or require auth depending on preference, but generally anyone with the app can see it)
// We will secure it to any logged in user, or keep it public. Let's require standard token.
router.get('/', verifyToken, presidentLetterController.getLetter);

// Admin route to update the letter
router.put('/', [verifyToken, isAdmin], presidentLetterController.updateLetter);

module.exports = router;

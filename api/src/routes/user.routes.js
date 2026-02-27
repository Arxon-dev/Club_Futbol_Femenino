const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { verifyToken, isAdminOrCoach } = require('../middleware/auth.middleware');

// GET /api/users - Required for the Admin Panel Directory
// Protected route, optionally restricted to Admin/Coach if sensitive, 
// for now anyone logged in can view the directory (teammates might want to see team directory)
router.get('/', verifyToken, userController.getUsers);

// POST /api/users - Create new user (Admin only)
router.post('/', verifyToken, (req, res, next) => {
    if (req.userRole === 'ADMIN') {
        next();
    } else {
        return res.status(403).json({ error: "Se requiere rol de Administrador para crear usuarios" });
    }
}, userController.createUser);

// GET /api/users/:userId/profile - Get a specific user's detail
router.get('/:userId/profile', verifyToken, userController.getProfile);

// PUT /api/users/:userId/profile - Update profile
// (A user can update their own profile, or an ADMIN can update anyone's profile)
router.put('/:userId/profile', verifyToken, (req, res, next) => {
    // Extra guard: only ADMIN/COACH or the owner can update the profile
    if (req.userRole === 'ADMIN' || req.userRole === 'COACH' || req.userId === req.params.userId) {
        next();
    } else {
        return res.status(403).json({ error: "Requiere rol de Administrador para modificar otros perfiles" });
    }
}, userController.upsertProfile);

module.exports = router;

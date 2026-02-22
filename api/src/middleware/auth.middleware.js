const jwt = require('jsonwebtoken');
const { User } = require('../models');

const verifyToken = async (req, res, next) => {
  console.log('[DEBUG-AUTH] verifyToken middleware hit');
  try {
    const bearerHeader = req.headers['authorization'];
    if (!bearerHeader) {
      console.log('[DEBUG-AUTH] No token provided');
      return res.status(403).json({ message: 'No se proporcionó token de autenticación' });
    }

    const token = bearerHeader.split(' ')[1];
    if (!token) {
      console.log('[DEBUG-AUTH] Malformed token header');
      return res.status(403).json({ message: 'Formato de token inválido' });
    }

    console.log('[DEBUG-AUTH] Verifying token...');
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    console.log('[DEBUG-AUTH] Token verified. Decoded:', decoded);
    
    // Check if user exists to be sure token wasn't revoked (optional but good practice)
    const user = await User.findByPk(decoded.id);
    if (!user) {
        console.log('[DEBUG-AUTH] User not found in DB for id:', decoded.id);
        return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    req.userId = decoded.id; // To use in upcoming handlers
    req.userRole = decoded.role;
    console.log('[DEBUG-AUTH] Attached userId:', req.userId, 'role:', req.userRole);
    next();
  } catch (error) {
    console.error('[DEBUG-AUTH] Token error:', error.message);
    return res.status(401).json({ message: 'No autorizado o token expirado' });
  }
};

const isAdmin = (req, res, next) => {
  if (req.userRole !== 'ADMIN') {
    return res.status(403).json({ message: 'Se requieren permisos de administrador' });
  }
  next();
};

const verifyRole = (roles) => {
  return (req, res, next) => {
    if (!req.userRole || !roles.includes(req.userRole)) {
      return res.status(403).json({ message: 'No tienes permisos para realizar esta acción' });
    }
    next();
  };
};

module.exports = {
  verifyToken,
  verifyRole,
  isAdmin
};

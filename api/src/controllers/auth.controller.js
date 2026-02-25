const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { User, Profile } = require('../models');

// Crear cuenta de administrador inicial (Sólo si no existe ninguno)
exports.setupAdmin = async (req, res) => {
  try {
    const adminCount = await User.count({ where: { role: 'ADMIN' } });
    if (adminCount > 0) {
      return res.status(403).json({ message: 'Ya existe un administrador en el sistema. Configuración bloqueada.' });
    }

    const { email, password, firstName, lastName } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email y contraseña son obligatorios' });
    }

    const hashedPassword = bcrypt.hashSync(password, 10);
    
    const newAdmin = await User.create({
      email,
      password: hashedPassword,
      role: 'ADMIN'
    });

    await Profile.create({
      userId: newAdmin.id,
      firstName: firstName || 'Admin',
      lastName: lastName || 'System'
    });

    res.status(201).json({ message: 'Administrador inicial creado exitosamente', email });
  } catch (error) {
    console.error('Error en auth.controller.setupAdmin:', error);
    res.status(500).json({ message: 'Error interno del servidor', error: error.message });
  }
};

// Validar credenciales de usuario y retornar token JWT
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email y contraseña son obligatorios' });
    }

    // Buscar usuario por email
    const user = await User.findOne({ where: { email } });
    
    if (!user) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    // Al no tener endpoint de registro aún configurado con bcrypt,
    // consideraremos que en producción el password de la BBDD está hasheado.
    // Usamos bcrypt.compareSync.
    const isPasswordValid = bcrypt.compareSync(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    // Generar JWT Token
    const token = jwt.sign(
      { id: user.id, role: user.role, email: user.email },
      process.env.JWT_SECRET || 'supersecret_futsal_key',
      { expiresIn: '24h' }
    );

    res.status(200).json({
      message: 'Autenticado correctamente',
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    console.error('Error en auth.controller.login:', error);
    res.status(500).json({ message: 'Error interno del servidor', error: error.message });
  }
};

// Actualizar FCM Token del dispositivo del usuario
exports.updateFcmToken = async (req, res) => {
  try {
    const userId = req.userId;
    const { fcmToken } = req.body;

    if (!fcmToken) {
      return res.status(400).json({ message: 'Se requiere el fcmToken' });
    }

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    user.fcmToken = fcmToken;
    await user.save();

    res.status(200).json({ message: 'FCM Token actualizado correctamente' });
  } catch (error) {
    console.error('Error actualizando FCM Token:', error);
    res.status(500).json({ message: 'Error interno del servidor', error: error.message });
  }
};

const { User, Profile, ChatMessage } = require('../models');
const { Op } = require('sequelize');

// Obtener últimos 50 mensajes GLOBALES
exports.getMessages = async (req, res) => {
  try {
    const messages = await ChatMessage.findAll({
      where: { receiverId: null },
      order: [['created_at', 'ASC']],
      limit: 50,
      include: [
        {
          model: User,
          attributes: ['id', 'role'],
          include: [
            {
              model: Profile,
              attributes: ['firstName', 'lastName']
            }
          ]
        }
      ]
    });
    res.json(messages);
  } catch (error) {
    console.error('Error fetching chat messages:', error);
    res.status(500).json({ message: 'Error al obtener mensajes', error: error.message });
  }
};

// Obtener últimos mensajes PRIVADOS entre req.userId y params.userId
exports.getPrivateMessages = async (req, res) => {
  try {
    const currentUserId = req.userId;
    const { userId } = req.params;

    const messages = await ChatMessage.findAll({
      where: {
        [Op.or]: [
          { userId: currentUserId, receiverId: userId },
          { userId: userId, receiverId: currentUserId }
        ]
      },
      order: [['created_at', 'ASC']],
      limit: 50,
      include: [
        {
          model: User,
          attributes: ['id', 'role'],
          include: [
            {
              model: Profile,
              attributes: ['firstName', 'lastName']
            }
          ]
        }
      ]
    });
    res.json(messages);
  } catch (error) {
    console.error('Error fetching private messages:', error);
    res.status(500).json({ message: 'Error al obtener mensajes privados', error: error.message });
  }
};

// Enviar mensaje (Global o Privado)
exports.sendMessage = async (req, res) => {
  try {
    const { content, receiverId } = req.body;
    if (!content || !content.trim()) {
      return res.status(400).json({ message: 'El mensaje no puede estar vacío' });
    }

    const currentUserId = req.userId;

    if (receiverId) {
      // Validaciones "Elite" para mensajes privados
      const sender = await User.findByPk(currentUserId);
      const receiver = await User.findByPk(receiverId);

      if (!sender || !receiver) {
        return res.status(404).json({ message: 'Usuario no encontrado' });
      }

      if (sender.role === 'FAN' && receiver.role === 'FAN') {
        return res.status(403).json({ message: 'No se permite chat privado entre aficionados' });
      }

      if ((sender.role === 'PLAYER' && receiver.role === 'FAN') || 
          (sender.role === 'FAN' && receiver.role === 'PLAYER')) {
        return res.status(403).json({ message: 'No se permite chat privado entre jugador y aficionado' });
      }
    }

    const message = await ChatMessage.create({
      userId: currentUserId,
      content: content.trim(),
      receiverId: receiverId || null
    });

    // Re-fetch with includes
    const fullMessage = await ChatMessage.findByPk(message.id, {
      include: [
        {
          model: User,
          attributes: ['id', 'role'],
          include: [
            {
              model: Profile,
              attributes: ['firstName', 'lastName']
            }
          ]
        }
      ]
    });

    res.status(201).json(fullMessage);
  } catch (error) {
    console.error('Error sending chat message:', error);
    res.status(500).json({ message: 'Error al enviar mensaje', error: error.message });
  }
};

// Borrar mensaje (Admin Only)
exports.deleteMessage = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if user is admin
    const currentUser = await User.findByPk(req.userId);
    if (currentUser.role !== 'ADMIN') {
      return res.status(403).json({ message: 'No tienes permisos para borrar mensajes' });
    }

    const message = await ChatMessage.findByPk(id);
    if (!message) {
      return res.status(404).json({ message: 'Mensaje no encontrado' });
    }

    await message.destroy();
    res.json({ message: 'Mensaje borrado exitosamente' });
  } catch (error) {
    console.error('Error deleting message:', error);
    res.status(500).json({ message: 'Error al borrar mensaje', error: error.message });
  }
};

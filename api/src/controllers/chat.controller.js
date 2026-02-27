const { User, Profile, ChatMessage } = require('../models');

// Obtener últimos 50 mensajes
exports.getMessages = async (req, res) => {
  try {
    const messages = await ChatMessage.findAll({
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

// Enviar mensaje
exports.sendMessage = async (req, res) => {
  try {
    const { content } = req.body;
    if (!content || !content.trim()) {
      return res.status(400).json({ message: 'El mensaje no puede estar vacío' });
    }

    const message = await ChatMessage.create({
      userId: req.userId,
      content: content.trim()
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

const PresidentLetter = require('../models/PresidentLetter');

// Obtener la carta del presidente (siempre habrá solo un registro activo, o el más reciente)
exports.getLetter = async (req, res) => {
  try {
    let letter = await PresidentLetter.findOne({
      order: [['updatedAt', 'DESC']]
    });

    // Si no existe ninguna carta, creamos una por defecto
    if (!letter) {
      letter = await PresidentLetter.create({
        title: 'Carta del Presidente',
        content: 'Bienvenido al Club de Fútbol Femenino. Estamos trabajando para ofrecerte la mejor experiencia.'
      });
    }

    res.json(letter);
  } catch (error) {
    console.error('Error fetching president letter:', error);
    res.status(500).json({ message: 'Error interno del servidor', error: error.message });
  }
};

// Actualizar la carta del presidente (solo ADMIN)
exports.updateLetter = async (req, res) => {
  try {
    const { title, content } = req.body;

    if (!title || !content) {
      return res.status(400).json({ message: 'Título y contenido son obligatorios' });
    }

    let letter = await PresidentLetter.findOne({
      order: [['updatedAt', 'DESC']]
    });

    if (letter) {
      letter.title = title;
      letter.content = content;
      await letter.save();
    } else {
      letter = await PresidentLetter.create({ title, content });
    }

    res.json({ message: 'Carta del Presidente actualizada exitosamente', letter });
  } catch (error) {
    console.error('Error updating president letter:', error);
    res.status(500).json({ message: 'Error interno del servidor', error: error.message });
  }
};

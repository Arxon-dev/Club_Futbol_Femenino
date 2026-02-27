const { Match } = require('../models');

// Obtener todos los partidos
exports.getAllMatches = async (req, res) => {
  try {
    const matches = await Match.findAll({
      order: [['date', 'ASC']]
    });
    res.json(matches);
  } catch (error) {
    console.error('Error fetching matches:', error);
    res.status(500).json({ message: 'Error al obtener los partidos', error: error.message });
  }
};

// Crear un partido (Admin)
exports.createMatch = async (req, res) => {
  try {
    const match = await Match.create(req.body);
    res.status(201).json(match);
  } catch (error) {
    console.error('Error creating match:', error);
    res.status(500).json({ message: 'Error al crear el partido', error: error.message });
  }
};

// Actualizar un partido (Admin)
exports.updateMatch = async (req, res) => {
  try {
    const { id } = req.params;
    const match = await Match.findByPk(id);
    
    if (!match) {
      return res.status(404).json({ message: 'Partido no encontrado' });
    }
    
    await match.update(req.body);
    res.json(match);
  } catch (error) {
    console.error('Error updating match:', error);
    res.status(500).json({ message: 'Error al actualizar el partido', error: error.message });
  }
};

// Eliminar un partido (Admin)
exports.deleteMatch = async (req, res) => {
  try {
    const { id } = req.params;
    const match = await Match.findByPk(id);
    
    if (!match) {
      return res.status(404).json({ message: 'Partido no encontrado' });
    }
    
    await match.destroy();
    res.json({ message: 'Partido eliminado correctamente' });
  } catch (error) {
    console.error('Error deleting match:', error);
    res.status(500).json({ message: 'Error al eliminar el partido', error: error.message });
  }
};

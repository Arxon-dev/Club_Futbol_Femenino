const { User, Profile } = require('../models');
const { Op } = require('sequelize');

// Obtener la plantilla del equipo (jugadoras + cuerpo técnico)
exports.getRoster = async (req, res) => {
  try {
    const members = await User.findAll({
      where: {
        role: { [Op.in]: ['PLAYER', 'COACH'] }
      },
      attributes: ['id', 'email', 'role'],
      include: [
        {
          model: Profile,
          attributes: ['firstName', 'lastName', 'dorsal', 'position']
        }
      ],
      order: [
        ['role', 'ASC'], // COACH first, then PLAYER
        [Profile, 'dorsal', 'ASC']
      ]
    });
    res.json(members);
  } catch (error) {
    console.error('Error fetching roster:', error);
    res.status(500).json({ message: 'Error al obtener la plantilla', error: error.message });
  }
};

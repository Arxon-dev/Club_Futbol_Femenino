const { User, Profile } = require('../models');

// Obtener todas las usuarias con sus perfiles
exports.getUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: ['id', 'email', 'role'], // Avoid returning password/tokens
      include: [
        {
          model: Profile,
          attributes: ['firstName', 'lastName', 'phone', 'clothingSize', 'dorsal', 'position']
        }
      ]
    });
    res.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: "No se pudieron obtener los usuarios" });
  }
};

// Obtener el perfil de un usuario específico
exports.getProfile = async (req, res) => {
  const { userId } = req.params;
  
  try {
    const user = await User.findByPk(userId, {
      attributes: ['id', 'email', 'role'],
      include: [Profile]
    });

    if (!user) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    res.json(user);
  } catch (error) {
    console.error("Error fetching profile:", error);
    res.status(500).json({ error: "No se pudo obtener el perfil" });
  }
};

// Crear o actualizar (upsert) el perfil
exports.upsertProfile = async (req, res) => {
  const { userId } = req.params;
  const profileData = req.body;

  try {
    // Basic verification that user exists
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    // Buscamos si ya tiene perfil
    let profile = await Profile.findOne({ where: { userId } });

    if (profile) {
      // Update
      await profile.update(profileData);
    } else {
      // Create - Asegurando que guardamos el userId correcto
      profile = await Profile.create({ ...profileData, userId });
    }

    res.json({ message: "Perfil guardado con éxito", profile });
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({ error: "No se pudo actualizar el perfil" });
  }
};

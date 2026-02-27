const { User, Profile } = require('../models');
const { Op } = require('sequelize');
const bcrypt = require('bcryptjs');

// GET /api/roster — Obtener la plantilla del equipo
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
          attributes: ['firstName', 'lastName', 'dorsal', 'position', 'photoUrl', 'phone', 'clothingSize', 'medicalInfo', 'birthdate']
        }
      ],
      order: [
        ['role', 'ASC'],
        [Profile, 'dorsal', 'ASC']
      ]
    });
    res.json(members);
  } catch (error) {
    console.error('Error fetching roster:', error);
    res.status(500).json({ message: 'Error al obtener la plantilla', error: error.message });
  }
};

// POST /api/roster — Añadir miembro a la plantilla
exports.addMember = async (req, res) => {
  try {
    const { email, password, role, firstName, lastName, dorsal, position, phone, clothingSize, medicalInfo, birthdate, photoUrl } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email y contraseña son obligatorios' });
    }

    const validRoles = ['PLAYER', 'COACH'];
    const memberRole = validRoles.includes(role) ? role : 'PLAYER';

    // Check if email already exists
    const existing = await User.findOne({ where: { email } });
    if (existing) {
      return res.status(400).json({ message: 'Ya existe un usuario con ese email' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      email,
      password: hashedPassword,
      role: memberRole
    });

    await Profile.create({
      userId: user.id,
      firstName: firstName || null,
      lastName: lastName || null,
      dorsal: dorsal || null,
      position: position || null,
      phone: phone || null,
      clothingSize: clothingSize || null,
      medicalInfo: medicalInfo || null,
      birthdate: birthdate || null,
      photoUrl: photoUrl || null
    });

    // Fetch the created user with profile
    const created = await User.findByPk(user.id, {
      attributes: ['id', 'email', 'role'],
      include: [{ model: Profile, attributes: ['firstName', 'lastName', 'dorsal', 'position', 'photoUrl', 'phone', 'clothingSize', 'medicalInfo', 'birthdate'] }]
    });

    res.status(201).json(created);
  } catch (error) {
    console.error('Error adding roster member:', error);
    res.status(500).json({ message: 'Error al añadir miembro', error: error.message });
  }
};

// PUT /api/roster/:id — Actualizar miembro de la plantilla
exports.updateMember = async (req, res) => {
  try {
    const { id } = req.params;
    const { firstName, lastName, dorsal, position, phone, clothingSize, medicalInfo, birthdate, photoUrl, role } = req.body;

    const user = await User.findByPk(id, { include: [Profile] });
    if (!user) {
      return res.status(404).json({ message: 'Miembro no encontrado' });
    }

    // Update role if provided
    if (role && ['PLAYER', 'COACH'].includes(role)) {
      await user.update({ role });
    }

    // Update or create profile
    if (user.profile) {
      await user.profile.update({
        firstName: firstName !== undefined ? firstName : user.profile.firstName,
        lastName: lastName !== undefined ? lastName : user.profile.lastName,
        dorsal: dorsal !== undefined ? dorsal : user.profile.dorsal,
        position: position !== undefined ? position : user.profile.position,
        phone: phone !== undefined ? phone : user.profile.phone,
        clothingSize: clothingSize !== undefined ? clothingSize : user.profile.clothingSize,
        medicalInfo: medicalInfo !== undefined ? medicalInfo : user.profile.medicalInfo,
        birthdate: birthdate !== undefined ? birthdate : user.profile.birthdate,
        photoUrl: photoUrl !== undefined ? photoUrl : user.profile.photoUrl
      });
    } else {
      await Profile.create({
        userId: id,
        firstName, lastName, dorsal, position, phone, clothingSize, medicalInfo, birthdate, photoUrl
      });
    }

    const updated = await User.findByPk(id, {
      attributes: ['id', 'email', 'role'],
      include: [{ model: Profile, attributes: ['firstName', 'lastName', 'dorsal', 'position', 'photoUrl', 'phone', 'clothingSize', 'medicalInfo', 'birthdate'] }]
    });

    res.json(updated);
  } catch (error) {
    console.error('Error updating roster member:', error);
    res.status(500).json({ message: 'Error al actualizar miembro', error: error.message });
  }
};

// DELETE /api/roster/:id — Eliminar miembro de la plantilla
exports.removeMember = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: 'Miembro no encontrado' });
    }

    // Delete profile first, then user
    await Profile.destroy({ where: { userId: id } });
    await user.destroy();

    res.json({ message: 'Miembro eliminado de la plantilla' });
  } catch (error) {
    console.error('Error removing roster member:', error);
    res.status(500).json({ message: 'Error al eliminar miembro', error: error.message });
  }
};

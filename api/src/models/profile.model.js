const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Profile = sequelize.define('profile', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  firstName: {
    type: DataTypes.STRING,
    allowNull: true
  },
  lastName: {
    type: DataTypes.STRING,
    allowNull: true
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: true
  },
  birthdate: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  clothingSize: {
    type: DataTypes.STRING,
    allowNull: true
  },
  medicalInfo: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  dorsal: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  position: {
    type: DataTypes.STRING,
    allowNull: true
  }
}, {
  underscored: true,
  tableName: 'profiles'
});

module.exports = Profile;

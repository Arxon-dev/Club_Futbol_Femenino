const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const PresidentLetter = sequelize.define('PresidentLetter', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'Carta del Presidente'
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false,
    defaultValue: 'Bienvenido al Club de Fútbol Femenino.'
  }
}, {
  tableName: 'PresidentLetter',
  timestamps: true
});

module.exports = PresidentLetter;

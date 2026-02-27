const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Match = sequelize.define('Match', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  date: {
    type: DataTypes.DATE,
    allowNull: false
  },
  opponentName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  opponentLogoUrl: {
    type: DataTypes.STRING,
    allowNull: true
  },
  location: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'Local' // Local or Visitante
  },
  result: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: 'Pendiente'
  },
  competition: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'Liga'
  },
  time: {
    type: DataTypes.STRING,
    allowNull: true
  }
}, {
  tableName: 'Matches',
  timestamps: true
});

module.exports = Match;

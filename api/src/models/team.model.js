const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Team = sequelize.define('team', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  category: {
    type: DataTypes.STRING,
    allowNull: false
  }
}, {
  underscored: true,
  tableName: 'teams'
});

module.exports = Team;

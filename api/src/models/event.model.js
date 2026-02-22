const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Event = sequelize.define('event', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  type: {
    type: DataTypes.ENUM('MATCH', 'TRAINING', 'OTHER'),
    defaultValue: 'TRAINING'
  },
  date: {
    type: DataTypes.DATE,
    allowNull: false
  },
  location: {
    type: DataTypes.STRING,
    allowNull: true
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  underscored: true,
  tableName: 'events'
});

module.exports = Event;

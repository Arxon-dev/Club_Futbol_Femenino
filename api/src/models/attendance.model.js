const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Attendance = sequelize.define('attendance', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  status: {
    type: DataTypes.ENUM('ATTENDING', 'NOT_ATTENDING', 'PENDING'),
    defaultValue: 'PENDING'
  },
  reason: {
    type: DataTypes.STRING,
    allowNull: true
  },
  attended: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  underscored: true,
  tableName: 'attendances'
});

module.exports = Attendance;

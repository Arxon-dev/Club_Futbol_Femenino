const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const SocialLink = sequelize.define('SocialLink', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  instagramUrl: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: ''
  },
  facebookUrl: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: ''
  },
  youtubeUrl: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: ''
  },
  twitterUrl: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: ''
  }
}, {
  tableName: 'SocialLinks',
  timestamps: true
});

module.exports = SocialLink;

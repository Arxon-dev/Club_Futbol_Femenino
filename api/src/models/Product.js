const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Product = sequelize.define('Product', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  imageUrl: {
    type: DataTypes.STRING,
    allowNull: true
  },
  category: {
    type: DataTypes.ENUM('Camisetas', 'Accesorios', 'Equipamiento', 'Otros'),
    defaultValue: 'Otros'
  },
  sizes: {
    type: DataTypes.JSON,
    defaultValue: []
  },
  available: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  contactWhatsApp: {
    type: DataTypes.STRING,
    allowNull: true
  }
}, {
  tableName: 'products',
  underscored: true
});

module.exports = Product;

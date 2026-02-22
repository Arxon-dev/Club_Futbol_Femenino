const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Transaction = sequelize.define('Transaction', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    type: {
      type: DataTypes.ENUM('INCOME', 'EXPENSE'),
      allowNull: false,
    },
    category: {
      type: DataTypes.STRING, // e.g., 'CUOTA', 'MATERIAL', 'ARBITRAJE', 'PATROCINIO', 'OTROS'
      allowNull: false,
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: 0.01,
      },
    },
    description: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: true, // Optional association to a player/user who paid or received the money
      references: {
        model: 'users',
        key: 'id',
      },
    },
  }, {
    tableName: 'transactions'
  });

  return Transaction;
};

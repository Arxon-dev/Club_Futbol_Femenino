const sequelize = require('../config/database');
const User = require('./user.model');
const Team = require('./team.model');
const Profile = require('./profile.model');
const Transaction = require('./Transaction')(sequelize);
const PresidentLetter = require('./PresidentLetter');
const Match = require('./Match');
const SocialLink = require('./SocialLink');
const News = require('./News');
const ChatMessage = require('./ChatMessage');
const Product = require('./Product');

// Relationships

User.hasMany(Transaction, { foreignKey: 'userId', as: 'transactions' });
Transaction.belongsTo(User, { foreignKey: 'userId', as: 'user' });

User.hasOne(Profile, { onDelete: 'CASCADE' });
Profile.belongsTo(User);

User.hasMany(ChatMessage, { foreignKey: 'userId' });
ChatMessage.belongsTo(User, { foreignKey: 'userId' });

module.exports = {
  sequelize,
  User,
  Team,
  Transaction,
  Profile,
  PresidentLetter,
  Match,
  SocialLink,
  News,
  ChatMessage,
  Product
};

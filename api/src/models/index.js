const sequelize = require('../config/database');
const User = require('./user.model');
const Team = require('./team.model');
const Profile = require('./profile.model');
const Transaction = require('./Transaction')(sequelize);
const PresidentLetter = require('./PresidentLetter');
const Match = require('./Match');
const SocialLink = require('./SocialLink');

// Relationships

User.hasMany(Transaction, { foreignKey: 'userId', as: 'transactions' });
Transaction.belongsTo(User, { foreignKey: 'userId', as: 'user' });

User.hasOne(Profile, { onDelete: 'CASCADE' });
Profile.belongsTo(User);

module.exports = {
  sequelize,
  User,
  Team,
  Transaction,
  Profile,
  PresidentLetter,
  Match,
  SocialLink
};

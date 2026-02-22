const sequelize = require('../config/database');
const User = require('./user.model');
const Team = require('./team.model');
const Event = require('./event.model');
const Attendance = require('./attendance.model');
const Profile = require('./profile.model');
const Transaction = require('./Transaction')(sequelize);

// Relationships
User.belongsToMany(Event, { through: Attendance });
Event.belongsToMany(User, { through: Attendance });
Attendance.belongsTo(User);
Attendance.belongsTo(Event);
User.hasMany(Attendance);
Event.hasMany(Attendance);

User.hasMany(Transaction, { foreignKey: 'userId', as: 'transactions' });
Transaction.belongsTo(User, { foreignKey: 'userId', as: 'user' });

User.hasOne(Profile, { onDelete: 'CASCADE' });
Profile.belongsTo(User);

module.exports = {
  sequelize,
  User,
  Team,
  Event,
  Attendance,
  Transaction,
  Profile
};

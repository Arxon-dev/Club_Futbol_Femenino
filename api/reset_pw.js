require('dotenv').config();
const { User } = require('./src/models');
const bcrypt = require('bcryptjs');

async function main() {
  try {
    let user = await User.findOne({ where: { email: 'info@cfsmelilla.com' } });
    const hash = await bcrypt.hash('123456', 10);
    
    if (user) {
      user.password = hash;
      await user.save();
      console.log('User password updated to 123456');
    } else {
      await User.create({
        name: 'Admin API',
        email: 'info@cfsmelilla.com',
        password: hash,
        role: 'ADMIN'
      });
      console.log('User info@cfsmelilla.com created with password 123456');
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    process.exit(0);
  }
}

main();

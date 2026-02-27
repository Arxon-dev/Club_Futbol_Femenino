require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { sequelize } = require('./src/models');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('OpoMelilla Futbol API is Running!');
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'API is running' });
});



// Routes Registration
app.use('/api/auth', require('./src/routes/auth.routes'));
app.use('/api/finances', require('./src/routes/financeRoutes'));
app.use('/api/stats', require('./src/routes/statsRoutes'));
app.use('/api/notifications', require('./src/routes/notificationRoutes'));
app.use('/api/users', require('./src/routes/user.routes'));
app.use('/api/president-letter', require('./src/routes/presidentLetter.routes'));
app.use('/api/matches', require('./src/routes/match.routes'));
app.use('/api/social-links', require('./src/routes/socialLink.routes'));
app.use('/api/news', require('./src/routes/news.routes'));
app.use('/api/roster', require('./src/routes/roster.routes'));


const PORT = process.env.PORT || 3000;

sequelize.sync({ alter: true }).then(() => {
  console.log('Database synced successfully.');
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on port ${PORT}`);
  });
}).catch(err => {
  console.error('Failed to sync database:', err);
});

// Triggering nodemon restart

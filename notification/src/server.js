require('dotenv').config();

const app = require('./app');
const pool = require('./config/db');

const PORT = process.env.PORT || 3002;

const startServer = async () => {
  try {
    await pool.query('SELECT 1');
    console.log('Notification service connected to PostgreSQL');

    app.listen(PORT, () => {
      console.log(`Notification service is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Cannot start notification service:', error);
  }
};

startServer();

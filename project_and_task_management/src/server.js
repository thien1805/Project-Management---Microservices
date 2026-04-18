require('dotenv').config();
const app = require('./app');
const pool = require('./config/db');

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    await pool.query('SELECT 1');
    console.log('Connected to PostgreSQL');

    app.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Cannot start server:', error);
  }
};

startServer();
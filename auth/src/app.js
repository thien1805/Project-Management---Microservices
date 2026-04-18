require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

const authRoutes = require('./routes/auth.routes');

app.use('/api/auth', authRoutes);

app.listen(process.env.PORT, () => {
  console.log(`Auth service running on port ${process.env.PORT}`);
  console.log(process.env.DB_HOST);
});
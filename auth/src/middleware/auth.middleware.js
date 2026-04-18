const jwt = require('jsonwebtoken');
const pool = require('../config/db');

module.exports = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) return res.sendStatus(401);

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const result = await pool.query(
      'SELECT id, full_name, email, role FROM auth.users WHERE id = $1',
      [decoded.id]
    );

    req.user = result.rows[0];

    next();
  } catch {
    res.sendStatus(403);
  }
};
const pool = require('../config/db');
const bcrypt = require('bcrypt');

class AuthService {
  async register(data) {
    const { full_name, email, password } = data;

    // check email tồn tại
    const check = await pool.query(
      'SELECT * FROM auth.users WHERE email = $1',
      [email]
    );

    if (check.rows.length > 0) {
      throw new Error('Email already exists');
    }

    const hash = await bcrypt.hash(password, 10);

    const result = await pool.query(
      `INSERT INTO auth.users (full_name, email, password_hash)
       VALUES ($1, $2, $3)
       RETURNING id, full_name, email, role, status, created_at`,
      [full_name, email, hash]
    );

    return result.rows[0];
  }

  async login(data) {
    const { email, password } = data;

    const result = await pool.query(
      'SELECT * FROM auth.users WHERE email = $1',
      [email]
    );

    const user = result.rows[0];

    if (!user) throw new Error('Invalid credentials');

    const isMatch = await bcrypt.compare(password, user.password_hash);

    if (!isMatch) throw new Error('Invalid credentials');

    return user;
  }

  async getUserById(id) {
    const result = await pool.query(
      'SELECT id, full_name, email, role FROM auth.users WHERE id = $1',
      [id]
    );

    return result.rows[0];
  }

  async getUsers(query) {
    const { page = 1, limit = 10 } = query;
    const offset = (page - 1) * limit;

    const users = await pool.query(
      `SELECT id, full_name, email, role, status
       FROM auth.users
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );

    const total = await pool.query('SELECT COUNT(*) FROM auth.users');

    return {
      users: users.rows,
      total: parseInt(total.rows[0].count),
    };
  }
}

module.exports = new AuthService();
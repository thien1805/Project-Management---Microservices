const authService = require('../services/auth.service');
const jwt = require('jsonwebtoken');

class AuthController {
  async register(req, res) {
    try {
      const user = await authService.register(req.body);

      res.status(201).json({
        success: true,
        data: user,
      });
    } catch (err) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  async login(req, res) {
    try {
      const user = await authService.login(req.body);

      const access_token = jwt.sign(
        { id: user.id },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES }
      );

      res.json({
        success: true,
        data: {
          access_token,
          token_type: 'Bearer',
          expires_in: 3600,
          user: {
            id: user.id,
            full_name: user.full_name,
            email: user.email,
            role: user.role,
          },
        },
      });
    } catch (err) {
      res.status(401).json({ success: false, message: err.message });
    }
  }

  async profile(req, res) {
    res.json({
      success: true,
      data: req.user,
    });
  }

  async getUser(req, res) {
    const user = await authService.getUserById(req.params.id);

    res.json({
      success: true,
      data: user,
    });
  }

  async getUsers(req, res) {
    const data = await authService.getUsers(req.query);

    res.json({
      success: true,
      data: data,
    });
  }
}

module.exports = new AuthController();
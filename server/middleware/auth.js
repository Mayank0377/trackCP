const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'trakcp_dev_secret_key_change_in_production';

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: '7d' });
};

// Auth middleware — protect routes
const protect = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization?.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({ error: true, message: 'Not authorized — no token' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const User = require('../models/User');
    req.user = await User.findById(decoded.id).select('-password');

    if (!req.user) {
      return res.status(401).json({ error: true, message: 'User not found' });
    }

    next();
  } catch (error) {
    return res.status(401).json({ error: true, message: 'Not authorized — token invalid' });
  }
};

module.exports = { generateToken, protect, JWT_SECRET };

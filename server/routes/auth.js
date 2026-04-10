const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { OAuth2Client } = require('google-auth-library');
const User = require('../models/User');
const { generateToken, protect } = require('../middleware/auth');

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// POST /api/auth/register — Email/Password signup
router.post('/register', async (req, res, next) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ error: true, message: 'All fields are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: true, message: 'Password must be at least 6 characters' });
    }

    // Check existing
    const exists = await User.findOne({ $or: [{ email }, { username }] });
    if (exists) {
      return res.status(400).json({
        error: true,
        message: exists.email === email ? 'Email already in use' : 'Username taken',
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      username,
      email,
      password: hashedPassword,
    });

    const token = generateToken(user._id);

    res.status(201).json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        platforms: user.platforms,
        preferences: user.preferences,
      },
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/auth/login — Email/Password login
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: true, message: 'Email and password are required' });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user || !user.password) {
      return res.status(401).json({ error: true, message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: true, message: 'Invalid credentials' });
    }

    const token = generateToken(user._id);

    res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        platforms: user.platforms,
        preferences: user.preferences,
      },
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/auth/google — Google OAuth login
router.post('/google', async (req, res, next) => {
  try {
    const { credential } = req.body;

    if (!credential) {
      return res.status(400).json({ error: true, message: 'Google credential is required' });
    }

    let payload;
    try {
      const ticket = await googleClient.verifyIdToken({
        idToken: credential,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
      payload = ticket.getPayload();
    } catch {
      return res.status(401).json({ error: true, message: 'Invalid Google token' });
    }

    const { email, name, picture, sub: googleId } = payload;

    // Find or create user
    let user = await User.findOne({ email });

    if (!user) {
      user = await User.create({
        username: name.replace(/\s+/g, '_').toLowerCase() + '_' + googleId.slice(-4),
        email,
        googleId,
        avatar: picture,
      });
    }

    const token = generateToken(user._id);

    res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        avatar: user.avatar || picture,
        platforms: user.platforms,
        preferences: user.preferences,
      },
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/auth/me — Get current user profile
router.get('/me', protect, async (req, res) => {
  res.json({
    user: {
      id: req.user._id,
      username: req.user.username,
      email: req.user.email,
      avatar: req.user.avatar,
      platforms: req.user.platforms,
      preferences: req.user.preferences,
    },
  });
});

// PUT /api/auth/profile — Update user profile
router.put('/profile', protect, async (req, res, next) => {
  try {
    const { platforms, preferences } = req.body;

    const updateFields = {};
    if (platforms) updateFields.platforms = platforms;
    if (preferences) updateFields.preferences = preferences;

    const user = await User.findByIdAndUpdate(req.user._id, updateFields, {
      new: true,
      runValidators: true,
    });

    res.json({
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        platforms: user.platforms,
        preferences: user.preferences,
      },
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;

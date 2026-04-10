const express = require('express');
const router = express.Router();
const axios = require('axios');
const cache = require('../config/cache');

// GET /api/codechef/user/:handle
router.get('/user/:handle', async (req, res, next) => {
  try {
    const { handle } = req.params;
    const cacheKey = `cc_user_${handle}`;

    const cached = cache.get(cacheKey);
    if (cached) return res.json(cached);

    // Use unofficial CodeChef API endpoint
    const response = await axios.get(
      `https://codechef-api.vercel.app/handle/${handle}`
    );

    if (response.data && !response.data.error) {
      cache.set(cacheKey, response.data);
      return res.json(response.data);
    }

    res.status(404).json({ error: true, message: 'User not found on CodeChef' });
  } catch (error) {
    if (error.response?.status === 404) {
      return res.status(404).json({ error: true, message: 'User not found on CodeChef' });
    }
    next(error);
  }
});

module.exports = router;

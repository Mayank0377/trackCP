const express = require('express');
const router = express.Router();
const axios = require('axios');
const cache = require('../config/cache');

const CF_API = 'https://codeforces.com/api';

// GET /api/codeforces/user/:handle
router.get('/user/:handle', async (req, res, next) => {
  try {
    const { handle } = req.params;
    const cacheKey = `cf_user_${handle}`;

    const cached = cache.get(cacheKey);
    if (cached) return res.json(cached);

    const response = await axios.get(`${CF_API}/user.info`, {
      params: { handles: handle },
    });

    if (response.data.status === 'OK') {
      const data = response.data.result[0];
      cache.set(cacheKey, data);
      return res.json(data);
    }

    res.status(404).json({ error: true, message: 'User not found' });
  } catch (error) {
    if (error.response?.status === 400) {
      return res.status(404).json({ error: true, message: 'User not found on Codeforces' });
    }
    next(error);
  }
});

// GET /api/codeforces/rating/:handle
router.get('/rating/:handle', async (req, res, next) => {
  try {
    const { handle } = req.params;
    const cacheKey = `cf_rating_${handle}`;

    const cached = cache.get(cacheKey);
    if (cached) return res.json(cached);

    const response = await axios.get(`${CF_API}/user.rating`, {
      params: { handle },
    });

    if (response.data.status === 'OK') {
      const data = response.data.result;
      cache.set(cacheKey, data);
      return res.json(data);
    }

    res.status(404).json({ error: true, message: 'Rating data not found' });
  } catch (error) {
    if (error.response?.status === 400) {
      return res.status(404).json({ error: true, message: 'No rating history found' });
    }
    next(error);
  }
});

// GET /api/codeforces/stats/:handle — all-time solved count + today's solves
router.get('/stats/:handle', async (req, res, next) => {
  try {
    const { handle } = req.params;
    const cacheKey = `cf_stats_${handle}`;

    const cached = cache.get(cacheKey);
    if (cached) return res.json(cached);

    const response = await axios.get(`${CF_API}/user.status`, {
      params: { handle },
    });

    if (response.data.status === 'OK') {
      const allSubs = response.data.result;
      const solvedSet = new Set();
      // Use UTC midnight so timezone doesn't cause mismatches
      const now = new Date();
      const todayStart = Math.floor(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()) / 1000);
      const ONE_DAY = 86400;
      let solvedToday = 0;
      let r800 = 0, r1000 = 0, r1200 = 0, r1400 = 0;

      // Set of UTC day timestamps that have at least one AC
      const activeDays = new Set();

      allSubs.forEach((s) => {
        if (s.verdict === 'OK') {
          // Track active days for streak (all accepted, not just unique)
          const dayTs = Math.floor(s.creationTimeSeconds / ONE_DAY) * ONE_DAY;
          activeDays.add(dayTs);

          const key = `${s.problem.contestId}/${s.problem.index}`;
          if (!solvedSet.has(key)) {
            solvedSet.add(key);
            const r = s.problem.rating || 0;
            if (r > 0 && r <= 1000) r800++;
            else if (r > 1000 && r <= 1200) r1000++;
            else if (r > 1200 && r <= 1400) r1200++;
            else if (r > 1400) r1400++;
            if (s.creationTimeSeconds >= todayStart) solvedToday++;
          }
        }
      });

      // Compute current streak by walking backwards from today/yesterday
      let currentStreak = 0;
      let checkDay = activeDays.has(todayStart) ? todayStart : todayStart - ONE_DAY;
      while (activeDays.has(checkDay)) {
        currentStreak++;
        checkDay -= ONE_DAY;
      }

      const result = {
        totalSolved: solvedSet.size,
        solvedToday,
        currentStreak,
        totalActiveDays: activeDays.size,
        r800,
        r1000,
        r1200,
        r1400,
      };

      cache.set(cacheKey, result);
      return res.json(result);
    }

    res.status(404).json({ error: true, message: 'User not found' });
  } catch (error) {
    if (error.response?.status === 400) {
      return res.status(404).json({ error: true, message: 'User not found on Codeforces' });
    }
    next(error);
  }
});

// GET /api/codeforces/calendar/:handle — full heatmap calendar from all submissions
router.get('/calendar/:handle', async (req, res, next) => {
  try {
    const { handle } = req.params;
    const cacheKey = `cf_calendar_${handle}`;

    const cached = cache.get(cacheKey);
    if (cached) return res.json(cached);

    const response = await axios.get(`${CF_API}/user.status`, {
      params: { handle },
    });

    if (response.data.status === 'OK') {
      const allSubs = response.data.result;
      const calendarMap = {};
      const ONE_DAY = 86400;

      allSubs.forEach((s) => {
        if (s.verdict === 'OK') {
          const dayTs = Math.floor(s.creationTimeSeconds / ONE_DAY) * ONE_DAY;
          calendarMap[dayTs] = (calendarMap[dayTs] || 0) + 1;
        }
      });

      const totalActive = Object.keys(calendarMap).length;

      // Compute current streak
      const now = new Date();
      const todayStart = Math.floor(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()) / 1000);
      let currentStreak = 0;
      let checkDay = calendarMap[todayStart] ? todayStart : todayStart - ONE_DAY;
      while (calendarMap[checkDay] && calendarMap[checkDay] > 0) {
        currentStreak++;
        checkDay -= ONE_DAY;
      }

      const result = {
        calendar: calendarMap,
        totalActiveDays: totalActive,
        currentStreak,
      };

      cache.set(cacheKey, result);
      return res.json(result);
    }

    res.status(404).json({ error: true, message: 'User not found' });
  } catch (error) {
    if (error.response?.status === 400) {
      return res.status(404).json({ error: true, message: 'User not found on Codeforces' });
    }
    next(error);
  }
});

// GET /api/codeforces/submissions/:handle — recent submissions for heatmap + table
router.get('/submissions/:handle', async (req, res, next) => {
  try {
    const { handle } = req.params;
    const cacheKey = `cf_subs_${handle}`;

    const cached = cache.get(cacheKey);
    if (cached) return res.json(cached);

    const response = await axios.get(`${CF_API}/user.status`, {
      params: { handle, from: 1, count: 100 },
    });

    if (response.data.status === 'OK') {
      const subs = response.data.result.map((s) => ({
        id: s.id,
        title: s.problem.name,
        titleSlug: `${s.problem.contestId}/${s.problem.index}`,
        verdict: s.verdict,
        lang: s.programmingLanguage,
        timestamp: s.creationTimeSeconds,
        difficulty: s.problem.rating || null,
        tags: s.problem.tags || [],
      }));
      cache.set(cacheKey, subs);
      return res.json(subs);
    }

    res.status(404).json({ error: true, message: 'Submissions not found' });
  } catch (error) {
    if (error.response?.status === 400) {
      return res.status(404).json({ error: true, message: 'User not found' });
    }
    next(error);
  }
});

// GET /api/codeforces/contests
router.get('/contests', async (req, res, next) => {
  try {
    const cacheKey = 'cf_contests';

    const cached = cache.get(cacheKey);
    if (cached) return res.json(cached);

    const response = await axios.get(`${CF_API}/contest.list`);

    if (response.data.status === 'OK') {
      // Return only upcoming contests (phase === 'BEFORE')
      const upcoming = response.data.result
        .filter((c) => c.phase === 'BEFORE')
        .sort((a, b) => a.startTimeSeconds - b.startTimeSeconds)
        .slice(0, 10);

      cache.set(cacheKey, upcoming);
      return res.json(upcoming);
    }

    res.status(500).json({ error: true, message: 'Failed to fetch contests' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;

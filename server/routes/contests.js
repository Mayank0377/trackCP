const express = require('express');
const router = express.Router();
const axios = require('axios');
const cache = require('../config/cache');

// GET /api/contests/upcoming?platform=all|codeforces|leetcode|codechef
router.get('/upcoming', async (req, res, next) => {
  try {
    const platform = (req.query.platform || 'all').toLowerCase();
    const cacheKey = `contests_upcoming_${platform}`;

    const cached = cache.get(cacheKey);
    if (cached) return res.json(cached);

    const contests = [];

    // ── Fetch Codeforces contests ──
    if (platform === 'all' || platform === 'codeforces') {
      try {
        const cfRes = await axios.get('https://codeforces.com/api/contest.list');
        if (cfRes.data.status === 'OK') {
          const cfContests = cfRes.data.result
            .filter((c) => c.phase === 'BEFORE')
            .slice(0, 5)
            .map((c) => ({
              id: `cf_${c.id}`,
              platform: 'Codeforces',
              name: c.name,
              startTime: c.startTimeSeconds * 1000,
              duration: c.durationSeconds,
              url: `https://codeforces.com/contests/${c.id}`,
              logo: 'CF',
              logoBg: 'bg-blue-600',
            }));
          contests.push(...cfContests);
        }
      } catch (e) {
        console.warn('Failed to fetch Codeforces contests:', e.message);
      }
    }

    // ── Fetch LeetCode contests ──
    if (platform === 'all' || platform === 'leetcode') {
      try {
        const lcRes = await axios.post(
          'https://leetcode.com/graphql',
          {
            query: `query { upcomingContests { title titleSlug startTime duration } }`,
          },
          { headers: { 'Content-Type': 'application/json', Referer: 'https://leetcode.com' } }
        );

        const lcContests = (lcRes.data.data.upcomingContests || []).map((c) => ({
          id: `lc_${c.titleSlug}`,
          platform: 'LeetCode',
          name: c.title,
          startTime: c.startTime * 1000,
          duration: c.duration,
          url: `https://leetcode.com/contest/${c.titleSlug}`,
          logo: 'LC',
          logoBg: 'bg-yellow-600',
        }));
        contests.push(...lcContests);
      } catch (e) {
        console.warn('Failed to fetch LeetCode contests:', e.message);
      }
    }

    // Sort by start time
    contests.sort((a, b) => a.startTime - b.startTime);

    cache.set(cacheKey, contests);
    res.json(contests);
  } catch (error) {
    next(error);
  }
});

module.exports = router;

const express = require('express');
const router = express.Router();
const axios = require('axios');
const cache = require('../config/cache');

const LC_API = 'https://leetcode.com/graphql';

// Helper: make GraphQL requests to LeetCode
async function queryLeetCode(query, variables = {}) {
  const response = await axios.post(
    LC_API,
    { query, variables },
    {
      headers: {
        'Content-Type': 'application/json',
        Referer: 'https://leetcode.com',
      },
    }
  );
  return response.data.data;
}

// GET /api/leetcode/user/:handle
router.get('/user/:handle', async (req, res, next) => {
  try {
    const { handle } = req.params;
    const cacheKey = `lc_user_${handle}`;

    const cached = cache.get(cacheKey);
    if (cached) return res.json(cached);

    const query = `
      query getUserProfile($username: String!) {
        matchedUser(username: $username) {
          username
          profile {
            realName
            ranking
            userAvatar
            reputation
          }
          submitStatsGlobal {
            acSubmissionNum {
              difficulty
              count
            }
          }
          contestBadge {
            name
          }
        }
        userContestRanking(username: $username) {
          attendedContestsCount
          rating
          globalRanking
          topPercentage
        }
      }
    `;

    const data = await queryLeetCode(query, { username: handle });

    if (!data.matchedUser) {
      return res.status(404).json({ error: true, message: 'User not found on LeetCode' });
    }

    const result = {
      user: data.matchedUser,
      contestRanking: data.userContestRanking,
    };

    cache.set(cacheKey, result);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

// GET /api/leetcode/submissions/:handle
router.get('/submissions/:handle', async (req, res, next) => {
  try {
    const { handle } = req.params;
    const cacheKey = `lc_subs_${handle}`;

    const cached = cache.get(cacheKey);
    if (cached) return res.json(cached);

    const query = `
      query recentSubmissions($username: String!, $limit: Int!) {
        recentAcSubmissionList(username: $username, limit: $limit) {
          id
          title
          titleSlug
          timestamp
          lang
        }
      }
    `;

    const data = await queryLeetCode(query, { username: handle, limit: 20 });
    const result = data.recentAcSubmissionList || [];

    cache.set(cacheKey, result);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

// GET /api/leetcode/calendar/:handle — submission heatmap data
router.get('/calendar/:handle', async (req, res, next) => {
  try {
    const { handle } = req.params;
    const cacheKey = `lc_calendar_${handle}`;

    const cached = cache.get(cacheKey);
    if (cached) return res.json(cached);

    const query = `
      query userProfileCalendar($username: String!) {
        matchedUser(username: $username) {
          userCalendar {
            activeYears
            streak
            totalActiveDays
            submissionCalendar
          }
        }
      }
    `;

    const data = await queryLeetCode(query, { username: handle });

    if (!data.matchedUser) {
      return res.status(404).json({ error: true, message: 'User not found' });
    }

    const calendar = data.matchedUser.userCalendar;
    // submissionCalendar is a JSON string: {"timestamp": count, ...}
    const calendarMap = JSON.parse(calendar.submissionCalendar || '{}');

    // LeetCode uses UTC midnight timestamps as calendar keys
    const now = new Date();
    const todayUTC = Math.floor(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()) / 1000);
    const solvedToday = calendarMap[String(todayUTC)] || 0;

    // Compute currentStreak by walking backwards from today
    // (calendar.streak is the BEST streak, not the current one)
    let currentStreak = 0;
    const ONE_DAY = 86400;
    // Start from today; if no submission today, start from yesterday
    let checkDay = solvedToday > 0 ? todayUTC : todayUTC - ONE_DAY;
    while (calendarMap[String(checkDay)] && calendarMap[String(checkDay)] > 0) {
      currentStreak++;
      checkDay -= ONE_DAY;
    }

    const result = {
      streak: calendar.streak,
      currentStreak,
      solvedToday,
      totalActiveDays: calendar.totalActiveDays,
      activeYears: calendar.activeYears,
      calendar: calendarMap,
    };

    cache.set(cacheKey, result);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

// GET /api/leetcode/rating-history/:handle — contest rating history
router.get('/rating-history/:handle', async (req, res, next) => {
  try {
    const { handle } = req.params;
    const cacheKey = `lc_rating_history_${handle}`;

    const cached = cache.get(cacheKey);
    if (cached) return res.json(cached);

    const query = `
      query userContestRatingInfo($username: String!) {
        userContestRankingHistory(username: $username) {
          attended
          trendDirection
          problemsSolved
          totalProblems
          rating
          ranking
          contest {
            title
            startTime
          }
        }
      }
    `;

    const data = await queryLeetCode(query, { username: handle });
    const history = (data.userContestRankingHistory || []).filter((h) => h.attended);

    cache.set(cacheKey, history);
    res.json(history);
  } catch (error) {
    next(error);
  }
});

// GET /api/leetcode/contests
router.get('/contests', async (req, res, next) => {
  try {
    const cacheKey = 'lc_contests';

    const cached = cache.get(cacheKey);
    if (cached) return res.json(cached);

    const query = `
      query upcomingContests {
        upcomingContests {
          title
          titleSlug
          startTime
          duration
        }
      }
    `;

    const data = await queryLeetCode(query);
    const result = data.upcomingContests || [];

    cache.set(cacheKey, result);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

module.exports = router;

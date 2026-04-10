import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ── Codeforces ──
export const codeforcesAPI = {
  getUser: (handle) => api.get(`/codeforces/user/${handle}`),
  getStats: (handle) => api.get(`/codeforces/stats/${handle}`),
  getRating: (handle) => api.get(`/codeforces/rating/${handle}`),
  getCalendar: (handle) => api.get(`/codeforces/calendar/${handle}`),
  getSubmissions: (handle) => api.get(`/codeforces/submissions/${handle}`),
  getContests: () => api.get('/codeforces/contests'),
};

// ── LeetCode ──
export const leetcodeAPI = {
  getUser: (handle) => api.get(`/leetcode/user/${handle}`),
  getSubmissions: (handle) => api.get(`/leetcode/submissions/${handle}`),
  getCalendar: (handle) => api.get(`/leetcode/calendar/${handle}`),
  getRatingHistory: (handle) => api.get(`/leetcode/rating-history/${handle}`),
  getContests: () => api.get('/leetcode/contests'),
};

// ── CodeChef ──
export const codechefAPI = {
  getUser: (handle) => api.get(`/codechef/user/${handle}`),
};

// ── Aggregated ──
export const contestsAPI = {
  getUpcoming: (platform) =>
    api.get('/contests/upcoming', { params: { platform } }),
};

export default api;

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// Load env vars
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// ── Middleware ──
app.use(cors());
app.use(express.json());

// ── Connect to MongoDB ──
connectDB();

// ── Routes ──
app.use('/api/auth', require('./routes/auth'));
app.use('/api/codeforces', require('./routes/codeforces'));
app.use('/api/leetcode', require('./routes/leetcode'));
app.use('/api/codechef', require('./routes/codechef'));
app.use('/api/contests', require('./routes/contests'));

// ── Health Check ──
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ── Global Error Handler ──
app.use((err, req, res, next) => {
  console.error('Server Error:', err.message);
  res.status(err.status || 500).json({
    error: true,
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error',
  });
});

// ── Start Server ──
app.listen(PORT, () => {
  console.log(`🚀 trakCP server running on http://localhost:${PORT}`);
});

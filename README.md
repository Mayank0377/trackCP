# trakCP

> **Unified Competitive Programming Dashboard**

Track your progress, analyze statistics, and manage contest schedules across **Codeforces**, **LeetCode**, and **CodeChef** — all in a single dark-themed command center.

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)

### Installation

```bash
# Clone the repo
git clone <repo-url>
cd trakCP

# Install client dependencies
cd client
npm install

# Install server dependencies
cd ../server
npm install
```

### Development

```bash
# Start the backend (from /server)
npm run server

# Start the frontend (from /client)
npm run dev
```

Frontend runs on `http://localhost:5173` and proxies API requests to `http://localhost:5000`.


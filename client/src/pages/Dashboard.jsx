import { useState, useEffect, useCallback } from 'react';
import SnapshotCards from '../components/widgets/SnapshotCards';
import RatingGraph from '../components/widgets/RatingGraph';
import UpcomingContests from '../components/widgets/UpcomingContests';
import DifficultyChart from '../components/widgets/DifficultyChart';
import { useUser } from '../context/UserContext';
import { codeforcesAPI, leetcodeAPI, contestsAPI } from '../services/api';

export default function Dashboard() {
  const { platforms } = useUser();
  const cfHandle = platforms.codeforces?.handle;
  const lcHandle = platforms.leetcode?.handle;

  // ── State ──
  const [snapshot, setSnapshot] = useState({ data: null, loading: true, error: null });
  const [rating, setRating] = useState({ cfData: null, lcData: null, loading: true, error: null });
  const [contests, setContests] = useState({ data: null, loading: true, error: null });
  const [difficulty, setDifficulty] = useState({ data: null, loading: true, error: null });

  // ────── Fetch Snapshot Cards ──────
  // Aggregates data from BOTH platforms properly
  const fetchSnapshot = useCallback(async () => {
    if (!cfHandle && !lcHandle) {
      setSnapshot({ data: null, loading: false, error: null });
      return;
    }
    setSnapshot((s) => ({ ...s, loading: true, error: null }));
    try {
      // Fire all requests in parallel
      const cfUserPromise = cfHandle ? codeforcesAPI.getUser(cfHandle).catch(() => null) : null;
      const cfStatsPromise = cfHandle ? codeforcesAPI.getStats(cfHandle).catch(() => null) : null;
      const lcPromise = lcHandle ? leetcodeAPI.getUser(lcHandle).catch(() => null) : null;
      const calPromise = lcHandle ? leetcodeAPI.getCalendar(lcHandle).catch(() => null) : null;

      const [cfUserRes, cfStatsRes, lcRes, calRes] = await Promise.all([
        cfUserPromise, cfStatsPromise, lcPromise, calPromise,
      ]);

      // ── Codeforces data ──
      let cf = { solved: 0, solvedToday: 0, rating: 0, maxRating: 0, rank: '', streak: 0, totalActiveDays: 0 };
      if (cfUserRes) {
        const u = cfUserRes.data;
        cf.rating = u.rating || 0;
        cf.maxRating = u.maxRating || 0;
        cf.rank = u.rank || 'Unrated';
      }
      if (cfStatsRes) {
        cf.solved = cfStatsRes.data.totalSolved || 0;
        cf.solvedToday = cfStatsRes.data.solvedToday || 0;
        cf.streak = cfStatsRes.data.currentStreak || 0;
        cf.totalActiveDays = cfStatsRes.data.totalActiveDays || 0;
      }

      // ── LeetCode data ──
      let lc = { solved: 0, solvedToday: 0, rating: 0, rank: '', streak: 0, totalActiveDays: 0 };
      if (lcRes) {
        const u = lcRes.data;
        const acList = u.user?.submitStatsGlobal?.acSubmissionNum || [];
        lc.solved = acList.find((s) => s.difficulty === 'All')?.count || 0;
        if (u.contestRanking) {
          lc.rating = Math.round(u.contestRanking.rating || 0);
          lc.rank = `Top ${u.contestRanking.topPercentage?.toFixed(1) || '?'}%`;
        }
      }
      if (calRes) {
        lc.streak = calRes.data.currentStreak || 0;
        lc.bestStreak = calRes.data.streak || 0;
        lc.solvedToday = calRes.data.solvedToday || 0;
        lc.totalActiveDays = calRes.data.totalActiveDays || 0;
      }

      setSnapshot({
        data: { cf: cfHandle ? cf : null, lc: lcHandle ? lc : null },
        loading: false,
        error: null,
      });
    } catch (err) {
      console.error('Snapshot fetch error:', err);
      setSnapshot({ data: null, loading: false, error: 'Failed to load stats. Check your handles.' });
    }
  }, [cfHandle, lcHandle]);

  // ────── Fetch Rating Graph (BOTH platforms) ──────
  const fetchRating = useCallback(async () => {
    if (!cfHandle && !lcHandle) {
      setRating({ cfData: null, lcData: null, loading: false, error: null });
      return;
    }
    setRating((s) => ({ ...s, loading: true, error: null }));
    try {
      const cfPromise = cfHandle
        ? codeforcesAPI.getRating(cfHandle).then((res) =>
            res.data.map((e) => ({
              date: new Date(e.ratingUpdateTimeSeconds * 1000).toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
              rating: e.newRating,
              contest: e.contestName,
              platform: 'CF',
              timestamp: e.ratingUpdateTimeSeconds,
            }))
          ).catch(() => [])
        : Promise.resolve([]);

      const lcPromise = lcHandle
        ? leetcodeAPI.getRatingHistory(lcHandle).then((res) =>
            res.data.map((e) => ({
              date: new Date(e.contest.startTime * 1000).toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
              rating: Math.round(e.rating),
              contest: e.contest.title,
              platform: 'LC',
              timestamp: e.contest.startTime,
            }))
          ).catch(() => [])
        : Promise.resolve([]);

      const [cfData, lcData] = await Promise.all([cfPromise, lcPromise]);

      setRating({ cfData, lcData, loading: false, error: null });
    } catch (err) {
      console.error('Rating fetch error:', err);
      setRating({ cfData: null, lcData: null, loading: false, error: 'Failed to load rating history.' });
    }
  }, [cfHandle, lcHandle]);

  // ────── Fetch Upcoming Contests ──────
  const fetchContests = useCallback(async () => {
    setContests((s) => ({ ...s, loading: true, error: null }));
    try {
      const res = await contestsAPI.getUpcoming('all');
      const now = Date.now();

      const formatted = res.data.map((c) => {
        const diff = c.startTime - now;
        let time = '';
        let timeColor = 'text-cp-muted';

        if (diff < 0) {
          time = 'Ongoing';
          timeColor = 'text-cp-success';
        } else if (diff < 3600000) {
          time = `In ${Math.round(diff / 60000)}m`;
          timeColor = 'text-cp-danger';
        } else if (diff < 86400000) {
          const hrs = Math.floor(diff / 3600000);
          const mins = Math.round((diff % 3600000) / 60000);
          time = `In ${hrs}h ${mins}m`;
          timeColor = 'text-cp-warning';
        } else {
          const days = Math.round(diff / 86400000);
          time = `In ${days} day${days > 1 ? 's' : ''}`;
        }

        return { ...c, time, timeColor };
      });

      setContests({ data: formatted, loading: false, error: null });
    } catch (err) {
      console.error('Contests fetch error:', err);
      setContests({ data: null, loading: false, error: 'Failed to load contests.' });
    }
  }, []);

  // ────── Fetch Difficulty Chart (aggregate CF + LC) ──────
  const fetchDifficulty = useCallback(async () => {
    if (!cfHandle && !lcHandle) {
      setDifficulty({ data: null, loading: false, error: null });
      return;
    }
    setDifficulty((s) => ({ ...s, loading: true, error: null }));
    try {
      let lcData = null;
      let cfData = null;

      // LC native Easy / Medium / Hard
      if (lcHandle) {
        try {
          const res = await leetcodeAPI.getUser(lcHandle);
          const acList = res.data.user?.submitStatsGlobal?.acSubmissionNum || [];
          lcData = [
            { name: 'Easy', value: acList.find((s) => s.difficulty === 'Easy')?.count || 0, color: '#00F2C3' },
            { name: 'Medium', value: acList.find((s) => s.difficulty === 'Medium')?.count || 0, color: '#FF9F43' },
            { name: 'Hard', value: acList.find((s) => s.difficulty === 'Hard')?.count || 0, color: '#FD5D93' },
          ];
        } catch { /* ignore */ }
      }

      // CF rating-range buckets
      if (cfHandle) {
        try {
          const res = await codeforcesAPI.getStats(cfHandle);
          cfData = [
            { name: '800–1000', value: res.data.r800 || 0, color: '#00F2C3' },
            { name: '1000–1200', value: res.data.r1000 || 0, color: '#1DB8E8' },
            { name: '1200–1400', value: res.data.r1200 || 0, color: '#FF9F43' },
            { name: '1400+', value: res.data.r1400 || 0, color: '#FD5D93' },
          ];
        } catch { /* ignore */ }
      }

      setDifficulty({ data: { cf: cfData, lc: lcData }, loading: false, error: null });
    } catch (err) {
      console.error('Difficulty fetch error:', err);
      setDifficulty({ data: null, loading: false, error: 'Failed to load difficulty breakdown.' });
    }
  }, [cfHandle, lcHandle]);

  // ── Run all fetches ──
  useEffect(() => {
    fetchSnapshot();
    fetchRating();
    fetchContests();
    fetchDifficulty();
  }, [fetchSnapshot, fetchRating, fetchContests, fetchDifficulty]);

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Page Title */}
      <div>
        <h1 className="text-xl md:text-2xl font-heading font-bold text-cp-text">
          Dashboard
        </h1>
        <p className="text-sm text-cp-muted mt-1">
          {cfHandle || lcHandle
            ? `Showing stats for ${[cfHandle && `CF: ${cfHandle}`, lcHandle && `LC: ${lcHandle}`].filter(Boolean).join(' · ')}`
            : 'Enter your handles on the landing page or settings to see live data'}
        </p>
      </div>

      {/* Widget A: Snapshot Cards */}
      <SnapshotCards
        data={snapshot.data}
        loading={snapshot.loading}
        error={snapshot.error}
        onRetry={fetchSnapshot}
      />

      {/* Widget B + C: Graph + Contests side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        <div className="lg:col-span-2">
          <RatingGraph
            cfData={rating.cfData}
            lcData={rating.lcData}
            loading={rating.loading}
            error={rating.error}
            onRetry={fetchRating}
          />
        </div>
        <div className="lg:col-span-1">
          <UpcomingContests
            data={contests.data}
            loading={contests.loading}
            error={contests.error}
            onRetry={fetchContests}
          />
        </div>
      </div>

      {/* Widget D: Difficulty Distribution */}
      <DifficultyChart
        data={difficulty.data}
        loading={difficulty.loading}
        error={difficulty.error}
        onRetry={fetchDifficulty}
      />
    </div>
  );
}

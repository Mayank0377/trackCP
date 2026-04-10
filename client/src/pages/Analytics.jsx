import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { ArrowLeft, Trophy, Hash, CheckCircle2, Clock, ExternalLink } from 'lucide-react';
import { useUser } from '../context/UserContext';
import { codeforcesAPI, leetcodeAPI } from '../services/api';
import ErrorState from '../components/ErrorState';
import EmptyState from '../components/EmptyState';

// ── Platform config ──
const platformConfig = {
  codeforces: { name: 'Codeforces', color: '#1890FF', profileUrl: (h) => `https://codeforces.com/profile/${h}` },
  leetcode: { name: 'LeetCode', color: '#FFA116', profileUrl: (h) => `https://leetcode.com/u/${h}` },
  codechef: { name: 'CodeChef', color: '#5B4638', profileUrl: (h) => `https://www.codechef.com/users/${h}` },
};

// ── Codeforces rank colors (matching CF's official colors) ──
const cfRankColor = {
  newbie: '#808080',
  pupil: '#008000',
  specialist: '#03A89E',
  expert: '#0000FF',
  'candidate master': '#AA00AA',
  master: '#FF8C00',
  'international master': '#FF8C00',
  grandmaster: '#FF0000',
  'international grandmaster': '#FF0000',
  'legendary grandmaster': '#FF0000',
};

function getCfRankStyle(rank) {
  if (!rank) return {};
  const color = cfRankColor[rank.toLowerCase()];
  return color ? { color } : {};
}

// ── Activity Heatmap Component ──
function ActivityHeatmap({ calendarData }) {
  const { weeks, monthLabels } = useMemo(() => {
    const today = new Date();
    const startDate = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()));
    startDate.setUTCDate(startDate.getUTCDate() - 364); // 52 weeks
    startDate.setUTCDate(startDate.getUTCDate() - startDate.getUTCDay()); // align to Sunday

    const weeksArr = [];
    let current = new Date(startDate);
    const endDate = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()));

    while (current <= endDate) {
      const week = [];
      for (let d = 0; d < 7; d++) {
        if (current <= endDate) {
          // Use UTC midnight timestamp as key (matches LC calendar + CF calendar)
          const ts = Math.floor(Date.UTC(current.getUTCFullYear(), current.getUTCMonth(), current.getUTCDate()) / 1000).toString();
          week.push({
            date: new Date(current),
            count: calendarData[ts] || 0,
          });
        }
        current.setUTCDate(current.getUTCDate() + 1);
      }
      weeksArr.push(week);
    }

    // Month labels
    const labels = [];
    let lastMonth = -1;
    weeksArr.forEach((week, i) => {
      const firstDay = week[0];
      if (firstDay && firstDay.date.getMonth() !== lastMonth) {
        lastMonth = firstDay.date.getMonth();
        labels.push({ index: i, label: firstDay.date.toLocaleString('en-US', { month: 'short' }) });
      }
    });

    return { weeks: weeksArr, monthLabels: labels };
  }, [calendarData]);

  const getColor = (count) => {
    if (count === 0) return 'bg-cp-bg';
    if (count <= 2) return 'bg-cp-primary/30';
    if (count <= 5) return 'bg-cp-primary/60';
    return 'bg-cp-primary';
  };

  return (
    <div className="overflow-x-auto">
      {/* Month labels */}
      <div className="flex mb-1 ml-8">
        {monthLabels.map((m, i) => (
          <div
            key={i}
            className="text-[10px] text-cp-muted"
            style={{ position: 'relative', left: `${m.index * 14}px`, width: 0, whiteSpace: 'nowrap' }}
          >
            {m.label}
          </div>
        ))}
      </div>

      <div className="flex gap-[2px]">
        {/* Day labels */}
        <div className="flex flex-col gap-[2px] mr-1 justify-start">
          {['', 'Mon', '', 'Wed', '', 'Fri', ''].map((d, i) => (
            <div key={i} className="h-[12px] text-[10px] text-cp-muted leading-[12px]">{d}</div>
          ))}
        </div>

        {/* Cells */}
        {weeks.map((week, wi) => (
          <div key={wi} className="flex flex-col gap-[2px]">
            {week.map((day, di) => (
              <div
                key={di}
                className={`w-[12px] h-[12px] rounded-[2px] ${getColor(day.count)} transition-colors`}
                title={`${day.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}: ${day.count} submission${day.count !== 1 ? 's' : ''}`}
              />
            ))}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-2 mt-3 justify-end">
        <span className="text-[10px] text-cp-muted">Less</span>
        {['bg-cp-bg', 'bg-cp-primary/30', 'bg-cp-primary/60', 'bg-cp-primary'].map((c, i) => (
          <div key={i} className={`w-[12px] h-[12px] rounded-[2px] ${c}`} />
        ))}
        <span className="text-[10px] text-cp-muted">More</span>
      </div>
    </div>
  );
}

// ── Rating Chart Tooltip ──
const RatingTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const d = payload[0].payload;
    return (
      <div className="bg-cp-card border border-cp-border rounded-lg px-4 py-3 shadow-lg">
        <p className="text-cp-text font-mono font-bold text-lg">{Math.round(d.rating)}</p>
        <p className="text-cp-muted text-xs">{d.contest}</p>
        <p className="text-cp-muted text-xs">{d.date}</p>
        {d.rank && <p className="text-cp-muted text-xs">Rank: #{d.rank}</p>}
      </div>
    );
  }
  return null;
};

// ── Verdict badge ──
function VerdictBadge({ verdict }) {
  const map = {
    OK: { label: 'AC', cls: 'text-cp-success bg-cp-success/10' },
    WRONG_ANSWER: { label: 'WA', cls: 'text-cp-danger bg-cp-danger/10' },
    TIME_LIMIT_EXCEEDED: { label: 'TLE', cls: 'text-cp-warning bg-cp-warning/10' },
    RUNTIME_ERROR: { label: 'RE', cls: 'text-cp-danger bg-cp-danger/10' },
    MEMORY_LIMIT_EXCEEDED: { label: 'MLE', cls: 'text-cp-warning bg-cp-warning/10' },
    COMPILATION_ERROR: { label: 'CE', cls: 'text-cp-muted bg-cp-bg' },
  };
  const v = map[verdict] || { label: verdict?.slice(0, 3) || '?', cls: 'text-cp-muted bg-cp-bg' };
  return <span className={`px-2 py-0.5 rounded text-xs font-mono font-medium ${v.cls}`}>{v.label}</span>;
}

// ══════════════════════════════════════════════
//  MAIN ANALYTICS PAGE
// ══════════════════════════════════════════════
export default function Analytics() {
  const { platform } = useParams();
  const navigate = useNavigate();
  const { platforms } = useUser();

  const handle = platforms[platform]?.handle;
  const config = platformConfig[platform] || { name: platform, color: '#E14ECA', profileUrl: () => '#' };

  // State
  const [profile, setProfile] = useState({ data: null, loading: true, error: null });
  const [ratingHistory, setRatingHistory] = useState({ data: null, loading: true, error: null });
  const [heatmap, setHeatmap] = useState({ data: null, loading: true, error: null });
  const [submissions, setSubmissions] = useState({ data: null, loading: true, error: null });

  // ── Fetch profile ──
  const fetchProfile = useCallback(async () => {
    if (!handle) { setProfile({ data: null, loading: false, error: null }); return; }
    setProfile((s) => ({ ...s, loading: true, error: null }));
    try {
      let data;
      if (platform === 'codeforces') {
        const res = await codeforcesAPI.getUser(handle);
        const u = res.data;
        data = {
          username: u.handle,
          avatar: u.titlePhoto,
          rank: u.rank || 'Unrated',
          rating: u.rating || 0,
          maxRating: u.maxRating || 0,
          friendOfCount: u.friendOfCount || 0,
          contribution: u.contribution || 0,
        };
      } else if (platform === 'leetcode') {
        const res = await leetcodeAPI.getUser(handle);
        const u = res.data.user;
        const cr = res.data.contestRanking;
        const acList = u.submitStatsGlobal?.acSubmissionNum || [];
        const total = acList.find((s) => s.difficulty === 'All')?.count || 0;
        data = {
          username: u.username,
          avatar: u.profile?.userAvatar,
          rank: cr ? `Top ${cr.topPercentage?.toFixed(1)}%` : 'Unrated',
          rating: cr ? Math.round(cr.rating) : 0,
          globalRanking: cr?.globalRanking || 0,
          totalSolved: total,
          contestsAttended: cr?.attendedContestsCount || 0,
        };
      }
      setProfile({ data, loading: false, error: null });
    } catch (err) {
      setProfile({ data: null, loading: false, error: 'Failed to load profile' });
    }
  }, [handle, platform]);

  // ── Fetch rating history ──
  const fetchRating = useCallback(async () => {
    if (!handle) { setRatingHistory({ data: null, loading: false, error: null }); return; }
    setRatingHistory((s) => ({ ...s, loading: true, error: null }));
    try {
      let chartData;
      if (platform === 'codeforces') {
        const res = await codeforcesAPI.getRating(handle);
        chartData = res.data.map((e) => ({
          date: new Date(e.ratingUpdateTimeSeconds * 1000).toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
          rating: e.newRating,
          contest: e.contestName,
          rank: e.rank,
        }));
      } else if (platform === 'leetcode') {
        const res = await leetcodeAPI.getRatingHistory(handle);
        chartData = res.data.map((e) => ({
          date: new Date(e.contest.startTime * 1000).toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
          rating: Math.round(e.rating),
          contest: e.contest.title,
          rank: e.ranking,
        }));
      }
      setRatingHistory({ data: chartData || [], loading: false, error: null });
    } catch (err) {
      setRatingHistory({ data: null, loading: false, error: 'Failed to load rating history' });
    }
  }, [handle, platform]);

  // ── Fetch heatmap ──
  const fetchHeatmap = useCallback(async () => {
    if (!handle) { setHeatmap({ data: null, loading: false, error: null }); return; }
    setHeatmap((s) => ({ ...s, loading: true, error: null }));
    try {
      let calData = {};
      let streak = 0;
      let totalActive = 0;

      if (platform === 'leetcode') {
        const res = await leetcodeAPI.getCalendar(handle);
        calData = res.data.calendar || {};
        streak = res.data.currentStreak || 0;
        totalActive = res.data.totalActiveDays || 0;
      } else if (platform === 'codeforces') {
        const res = await codeforcesAPI.getCalendar(handle);
        calData = res.data.calendar || {};
        streak = res.data.currentStreak || 0;
        totalActive = res.data.totalActiveDays || 0;
      }

      setHeatmap({ data: { calendar: calData, streak, totalActive }, loading: false, error: null });
    } catch (err) {
      setHeatmap({ data: null, loading: false, error: 'Failed to load activity data' });
    }
  }, [handle, platform]);

  // ── Fetch submissions ──
  const fetchSubmissions = useCallback(async () => {
    if (!handle) { setSubmissions({ data: null, loading: false, error: null }); return; }
    setSubmissions((s) => ({ ...s, loading: true, error: null }));
    try {
      let subs;
      if (platform === 'codeforces') {
        const res = await codeforcesAPI.getSubmissions(handle);
        subs = res.data.slice(0, 15);
      } else if (platform === 'leetcode') {
        const res = await leetcodeAPI.getSubmissions(handle);
        subs = res.data.map((s) => ({
          id: s.id,
          title: s.title,
          titleSlug: s.titleSlug,
          verdict: 'OK',
          lang: s.lang,
          timestamp: parseInt(s.timestamp, 10),
        }));
      }
      setSubmissions({ data: subs || [], loading: false, error: null });
    } catch (err) {
      setSubmissions({ data: null, loading: false, error: 'Failed to load submissions' });
    }
  }, [handle, platform]);

  useEffect(() => {
    fetchProfile();
    fetchRating();
    fetchHeatmap();
    fetchSubmissions();
  }, [fetchProfile, fetchRating, fetchHeatmap, fetchSubmissions]);

  // ── No handle set ──
  if (!handle) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/dashboard')} className="p-2 rounded-lg text-cp-muted hover:text-cp-text hover:bg-cp-card transition-colors">
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-2xl font-heading font-bold text-cp-text">{config.name} Analytics</h1>
        </div>
        <EmptyState message={`Add your ${config.name} handle in Settings to see analytics`} />
      </div>
    );
  }

  const timeAgo = (ts) => {
    const diff = Date.now() / 1000 - ts;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/dashboard')} className="p-2 rounded-lg text-cp-muted hover:text-cp-text hover:bg-cp-card transition-colors">
          <ArrowLeft size={20} />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-heading font-bold text-cp-text">{config.name} Analytics</h1>
          <p className="text-sm text-cp-muted mt-1">Detailed stats for <span className="text-cp-primary font-mono">{handle}</span></p>
        </div>
        <a href={config.profileUrl(handle)} target="_blank" rel="noopener noreferrer"
          className="flex items-center gap-2 px-4 py-2 rounded-lg border border-cp-border text-sm text-cp-muted hover:text-cp-primary hover:border-cp-primary transition-colors">
          View Profile <ExternalLink size={14} />
        </a>
      </div>

      {/* ── Profile Card ── */}
      <div className="bg-cp-card rounded-xl p-6">
        {profile.loading ? (
          <div className="flex items-center gap-6">
            <div className="skeleton w-16 h-16 rounded-full shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="skeleton h-6 w-40" />
              <div className="skeleton h-4 w-60" />
            </div>
          </div>
        ) : profile.error ? (
          <ErrorState message={profile.error} onRetry={fetchProfile} />
        ) : profile.data ? (
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            {profile.data.avatar && (
              <img src={profile.data.avatar} alt={profile.data.username} className="w-16 h-16 rounded-full border-2 border-cp-border" />
            )}
            <div className="flex-1">
              <h2 className="text-xl font-heading font-bold text-cp-text">{profile.data.username}</h2>
              <p className="text-sm mt-1 font-medium" style={platform === 'codeforces' ? getCfRankStyle(profile.data.rank) : {}}>{profile.data.rank}</p>
            </div>
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-cp-bg">
                <Trophy size={16} className="text-cp-warning" />
                <div>
                  <p className="text-xs text-cp-muted">Rating</p>
                  <p className="text-sm font-bold font-mono text-cp-text">{profile.data.rating}</p>
                </div>
              </div>
              {profile.data.maxRating !== undefined && (
                <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-cp-bg">
                  <Trophy size={16} className="text-cp-primary" />
                  <div>
                    <p className="text-xs text-cp-muted">Max Rating</p>
                    <p className="text-sm font-bold font-mono text-cp-text">{profile.data.maxRating}</p>
                  </div>
                </div>
              )}
              {profile.data.totalSolved !== undefined && (
                <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-cp-bg">
                  <CheckCircle2 size={16} className="text-cp-success" />
                  <div>
                    <p className="text-xs text-cp-muted">Solved</p>
                    <p className="text-sm font-bold font-mono text-cp-text">{profile.data.totalSolved}</p>
                  </div>
                </div>
              )}
              {profile.data.contestsAttended !== undefined && (
                <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-cp-bg">
                  <Hash size={16} className="text-cp-secondary" />
                  <div>
                    <p className="text-xs text-cp-muted">Contests</p>
                    <p className="text-sm font-bold font-mono text-cp-text">{profile.data.contestsAttended}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : null}
      </div>

      {/* ── Activity Heatmap ── */}
      <div className="bg-cp-card rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-heading font-semibold text-cp-text">Activity Heatmap</h3>
          {heatmap.data && (
            <div className="flex items-center gap-4">
              {heatmap.data.streak > 0 && (
                <span className="text-xs text-cp-warning font-medium">🔥 {heatmap.data.streak} day streak</span>
              )}
              <span className="text-xs text-cp-muted">{heatmap.data.totalActive} active days</span>
            </div>
          )}
        </div>
        {heatmap.loading ? (
          <div className="skeleton h-[100px] w-full rounded-lg" />
        ) : heatmap.error ? (
          <ErrorState message={heatmap.error} onRetry={fetchHeatmap} />
        ) : heatmap.data ? (
          <ActivityHeatmap calendarData={heatmap.data.calendar} />
        ) : (
          <EmptyState message="No activity data available" />
        )}
      </div>

      {/* ── Rating History ── */}
      <div className="bg-cp-card rounded-xl p-6">
        <h3 className="text-lg font-heading font-semibold text-cp-text mb-4">Rating History</h3>
        {ratingHistory.loading ? (
          <div className="skeleton h-[300px] w-full rounded-lg" />
        ) : ratingHistory.error ? (
          <ErrorState message={ratingHistory.error} onRetry={fetchRating} />
        ) : ratingHistory.data && ratingHistory.data.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={ratingHistory.data}>
              <defs>
                <linearGradient id="analyticsRatingGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={config.color} stopOpacity={0.4} />
                  <stop offset="100%" stopColor={config.color} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#3A3A5C" />
              <XAxis dataKey="date" stroke="#9A9A9A" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis stroke="#9A9A9A" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} domain={['dataMin - 100', 'dataMax + 100']} />
              <Tooltip content={<RatingTooltip />} />
              <Area type="monotone" dataKey="rating" stroke={config.color} strokeWidth={2.5} fill="url(#analyticsRatingGradient)" />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <EmptyState message="No contest history found. Participate in contests to see your rating graph!" />
        )}
      </div>

      {/* ── Recent Submissions ── */}
      <div className="bg-cp-card rounded-xl p-6">
        <h3 className="text-lg font-heading font-semibold text-cp-text mb-4">Recent Submissions</h3>
        {submissions.loading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="skeleton h-12 w-full rounded-lg" />
            ))}
          </div>
        ) : submissions.error ? (
          <ErrorState message={submissions.error} onRetry={fetchSubmissions} />
        ) : submissions.data && submissions.data.length > 0 ? (
          <div className="space-y-2">
            {/* Table header */}
            <div className="hidden sm:grid grid-cols-12 gap-3 px-4 py-2 text-xs text-cp-muted font-medium">
              <div className="col-span-5">Problem</div>
              <div className="col-span-2">Verdict</div>
              <div className="col-span-3">Language</div>
              <div className="col-span-2 text-right">When</div>
            </div>
            {submissions.data.map((sub) => (
              <div key={sub.id} className="grid grid-cols-1 sm:grid-cols-12 gap-1 sm:gap-3 items-center py-3 px-4 rounded-lg bg-cp-bg hover:bg-cp-bg/80 transition-colors">
                <div className="sm:col-span-5">
                  {platform === 'codeforces' ? (
                    <a href={`https://codeforces.com/contest/${sub.titleSlug?.split('/')[0]}/problem/${sub.titleSlug?.split('/')[1]}`}
                      target="_blank" rel="noopener noreferrer"
                      className="text-sm text-cp-text hover:text-cp-primary transition-colors truncate block">
                      {sub.title}
                    </a>
                  ) : (
                    <a href={`https://leetcode.com/problems/${sub.titleSlug}`}
                      target="_blank" rel="noopener noreferrer"
                      className="text-sm text-cp-text hover:text-cp-primary transition-colors truncate block">
                      {sub.title}
                    </a>
                  )}
                  {sub.difficulty && <span className="text-xs text-cp-muted font-mono">({sub.difficulty})</span>}
                </div>
                <div className="sm:col-span-2">
                  <VerdictBadge verdict={sub.verdict} />
                </div>
                <div className="sm:col-span-3 text-xs font-mono text-cp-muted truncate">{sub.lang}</div>
                <div className="sm:col-span-2 text-xs text-cp-muted text-right flex items-center justify-end gap-1">
                  <Clock size={12} /> {timeAgo(sub.timestamp)}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState message="No submissions found" />
        )}
      </div>
    </div>
  );
}

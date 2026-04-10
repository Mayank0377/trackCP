import { useState, useMemo } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import ErrorState from '../ErrorState';
import EmptyState from '../EmptyState';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-cp-card border border-cp-border rounded-lg px-4 py-3 shadow-lg">
        {payload.map((p, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: p.stroke }} />
            <span className="text-cp-text font-mono font-bold">{p.value}</span>
            <span className="text-cp-muted text-xs">({p.name})</span>
          </div>
        ))}
        {payload[0]?.payload?.contest && (
          <p className="text-cp-muted text-xs mt-1">{payload[0].payload.contest}</p>
        )}
        <p className="text-cp-muted text-xs">{label}</p>
      </div>
    );
  }
  return null;
};

export default function RatingGraph({ cfData, lcData, loading, error, onRetry }) {
  const [activeTab, setActiveTab] = useState('All');

  const hasCF = cfData && cfData.length > 0;
  const hasLC = lcData && lcData.length > 0;

  // Build available tabs based on data
  const tabs = useMemo(() => {
    const t = [];
    if (hasCF && hasLC) t.push('All');
    if (hasCF) t.push('Codeforces');
    if (hasLC) t.push('LeetCode');
    return t;
  }, [hasCF, hasLC]);

  // Select which data to show based on active tab
  const { chartData, showCF, showLC } = useMemo(() => {
    const showCF = activeTab === 'All' || activeTab === 'Codeforces';
    const showLC = activeTab === 'All' || activeTab === 'LeetCode';

    if (activeTab === 'All' && hasCF && hasLC) {
      // Merge both timelines by timestamp, show separate lines
      const all = [
        ...(cfData || []).map((d) => ({ ...d, cfRating: d.rating, lcRating: null })),
        ...(lcData || []).map((d) => ({ ...d, lcRating: d.rating, cfRating: null })),
      ].sort((a, b) => a.timestamp - b.timestamp);

      // Forward-fill so both lines are continuous
      let lastCF = null, lastLC = null;
      const merged = all.map((d) => {
        if (d.cfRating !== null) lastCF = d.cfRating;
        if (d.lcRating !== null) lastLC = d.lcRating;
        return { ...d, cfRating: d.cfRating ?? lastCF, lcRating: d.lcRating ?? lastLC };
      });

      return { chartData: merged, showCF: true, showLC: true };
    }

    if (activeTab === 'Codeforces' && hasCF) {
      return { chartData: cfData.map((d) => ({ ...d, cfRating: d.rating })), showCF: true, showLC: false };
    }

    if (activeTab === 'LeetCode' && hasLC) {
      return { chartData: lcData.map((d) => ({ ...d, lcRating: d.rating })), showCF: false, showLC: true };
    }

    return { chartData: [], showCF: false, showLC: false };
  }, [activeTab, cfData, lcData, hasCF, hasLC]);

  if (loading) {
    return (
      <div className="bg-cp-card rounded-xl p-4 md:p-6">
        <div className="skeleton h-5 w-48 mb-6" />
        <div className="skeleton h-[250px] md:h-[300px] w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-cp-card rounded-xl p-4 md:p-6">
        <h3 className="text-lg font-heading font-semibold text-cp-text mb-2">Rating Growth History</h3>
        <ErrorState message={error} onRetry={onRetry} />
      </div>
    );
  }

  if (!hasCF && !hasLC) {
    return (
      <div className="bg-cp-card rounded-xl p-4 md:p-6">
        <h3 className="text-lg font-heading font-semibold text-cp-text mb-4">Rating Growth History</h3>
        <EmptyState message="Add your Codeforces or LeetCode handle and participate in contests to see rating history" />
      </div>
    );
  }

  // Default to first available tab
  if (!tabs.includes(activeTab) && tabs.length > 0) {
    setActiveTab(tabs[0]);
  }

  return (
    <div className="bg-cp-card rounded-xl p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
        <h3 className="text-lg font-heading font-semibold text-cp-text">Rating Growth History</h3>
        {tabs.length > 1 && (
          <div className="flex bg-cp-bg rounded-lg p-1">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  activeTab === tab ? 'bg-cp-primary text-white' : 'text-cp-muted hover:text-cp-text'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={chartData}>
          <defs>
            <linearGradient id="cfGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#1890FF" stopOpacity={0.3} />
              <stop offset="100%" stopColor="#1890FF" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="lcGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#FFA116" stopOpacity={0.3} />
              <stop offset="100%" stopColor="#FFA116" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#3A3A5C" />
          <XAxis dataKey="date" stroke="#9A9A9A" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
          <YAxis stroke="#9A9A9A" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} domain={['dataMin - 100', 'dataMax + 100']} />
          <Tooltip content={<CustomTooltip />} />
          {showCF && (
            <Area
              type="monotone"
              dataKey="cfRating"
              name="Codeforces"
              stroke="#1890FF"
              strokeWidth={2.5}
              fill="url(#cfGradient)"
              dot={false}
              connectNulls
            />
          )}
          {showLC && (
            <Area
              type="monotone"
              dataKey="lcRating"
              name="LeetCode"
              stroke="#FFA116"
              strokeWidth={2.5}
              fill="url(#lcGradient)"
              dot={false}
              connectNulls
            />
          )}
        </AreaChart>
      </ResponsiveContainer>

      {/* Legend */}
      {showCF && showLC && (
        <div className="flex justify-center gap-6 mt-3">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#1890FF]" />
            <span className="text-xs text-cp-muted">Codeforces</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#FFA116]" />
            <span className="text-xs text-cp-muted">LeetCode</span>
          </div>
        </div>
      )}
    </div>
  );
}

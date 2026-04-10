import { CheckCircle2, Trophy, Flame } from 'lucide-react';
import ErrorState from '../ErrorState';

// Platform badge colors
const cfColor = 'text-blue-400';
const lcColor = 'text-yellow-400';

function PlatformRow({ label, value, color, sub }) {
  return (
    <div className="flex items-center justify-between">
      <span className={`text-xs font-medium ${color}`}>{label}</span>
      <div className="text-right">
        <span className="text-sm font-mono font-bold text-cp-text">{value}</span>
        {sub && <span className="text-[10px] text-cp-muted ml-1">{sub}</span>}
      </div>
    </div>
  );
}

export default function SnapshotCards({ data, loading, error, onRetry }) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-cp-card rounded-xl p-5 md:p-6">
            <div className="skeleton h-4 w-24 mb-4" />
            <div className="skeleton h-10 w-32 mb-2" />
            <div className="skeleton h-3 w-full mb-2" />
            <div className="skeleton h-3 w-full" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-cp-card rounded-xl">
        <ErrorState message={error} onRetry={onRetry} />
      </div>
    );
  }

  if (!data) return null;

  const { cf, lc } = data;

  // ── Total Solved ──
  const totalSolved = (cf?.solved || 0) + (lc?.solved || 0);
  const totalToday = (cf?.solvedToday || 0) + (lc?.solvedToday || 0);

  // ── Best Rating ──
  const ratings = [];
  if (cf) ratings.push(cf.maxRating || cf.rating || 0);
  if (lc && lc.rating) ratings.push(lc.rating);
  const bestRating = ratings.length > 0 ? Math.max(...ratings) : 0;

  // ── Current Streak (not best) ──
  const cfStreak = cf?.streak || 0;
  const lcStreak = lc?.streak || 0;
  const bestCurrentStreak = Math.max(cfStreak, lcStreak);

  const cardDefs = [
    {
      title: 'Total Solved',
      value: totalSolved,
      icon: CheckCircle2,
      iconBg: 'from-cp-success/20 to-cp-success/5',
      iconColor: 'text-cp-success',
      glowClass: 'hover:shadow-glow-success',
      rows: [
        cf && cf.solved > 0 && { label: 'Codeforces', value: cf.solved, color: cfColor, sub: cf.solvedToday > 0 ? `+${cf.solvedToday} today` : null },
        lc && lc.solved > 0 && { label: 'LeetCode', value: lc.solved, color: lcColor, sub: lc.solvedToday > 0 ? `+${lc.solvedToday} today` : null },
      ].filter(Boolean),
      footer: totalToday > 0 ? `+${totalToday} today` : null,
      footerColor: 'text-cp-success',
    },
    {
      title: 'Best Rating',
      value: bestRating,
      icon: Trophy,
      iconBg: 'from-cp-primary/20 to-cp-primary/5',
      iconColor: 'text-cp-primary',
      glowClass: 'hover:shadow-glow-primary',
      rows: [
        cf && cf.rating > 0 && { label: 'Codeforces', value: cf.rating, color: cfColor, sub: cf.rank ? `(${cf.rank})` : null },
        lc && lc.rating > 0 && { label: 'LeetCode', value: lc.rating, color: lcColor, sub: lc.rank ? `(${lc.rank})` : null },
      ].filter(Boolean),
      footer: cf?.maxRating ? `Max: ${cf.maxRating} (CF)` : null,
      footerColor: 'text-cp-muted',
    },
    {
      title: 'Current Streak',
      value: bestCurrentStreak,
      icon: Flame,
      iconBg: 'from-cp-warning/20 to-cp-danger/5',
      iconColor: 'text-cp-warning',
      glowClass: 'hover:shadow-glow-danger',
      rows: [
        cf && cfStreak > 0 && { label: 'Codeforces', value: `${cfStreak} days`, color: cfColor, sub: cf.totalActiveDays ? `${cf.totalActiveDays} total active` : null },
        lc && lcStreak > 0 && { label: 'LeetCode', value: `${lcStreak} days`, color: lcColor, sub: lc.totalActiveDays ? `${lc.totalActiveDays} total active` : null },
      ].filter(Boolean),
      footer: lc?.bestStreak ? `Best: ${lc.bestStreak} days (LC)` : (bestCurrentStreak > 0 ? 'Days' : 'No active streak'),
      footerColor: 'text-cp-muted',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
      {cardDefs.map((card) => (
        <div
          key={card.title}
          className={`bg-cp-card rounded-xl p-5 md:p-6 card-glow transition-all ${card.glowClass}`}
        >
          {/* Header row */}
          <div className="flex items-start justify-between mb-3">
            <div>
              <p className="text-cp-muted text-sm font-medium mb-1">{card.title}</p>
              <p className="text-3xl md:text-4xl font-heading font-bold text-cp-text">{card.value}</p>
            </div>
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${card.iconBg} flex items-center justify-center shrink-0`}>
              <card.icon size={24} className={card.iconColor} />
            </div>
          </div>

          {/* Per-platform breakdown */}
          {card.rows.length > 0 && (
            <div className="space-y-1.5 pt-3 border-t border-cp-border/50">
              {card.rows.map((row) => (
                <PlatformRow key={row.label} {...row} />
              ))}
            </div>
          )}

          {/* Footer */}
          {card.footer && (
            <p className={`text-xs mt-2 ${card.footerColor}`}>{card.footer}</p>
          )}
        </div>
      ))}
    </div>
  );
}

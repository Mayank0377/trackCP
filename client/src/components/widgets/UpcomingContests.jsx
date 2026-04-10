import { ExternalLink } from 'lucide-react';
import ErrorState from '../ErrorState';
import EmptyState from '../EmptyState';

export default function UpcomingContests({ data, loading, error, onRetry }) {
  if (loading) {
    return (
      <div className="bg-cp-card rounded-xl p-4 md:p-6">
        <div className="skeleton h-5 w-40 mb-4" />
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex items-center gap-4 py-3">
            <div className="skeleton w-10 h-10 rounded-full" />
            <div className="flex-1">
              <div className="skeleton h-4 w-48 mb-2" />
              <div className="skeleton h-3 w-20" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-cp-card rounded-xl p-4 md:p-6">
        <h3 className="text-lg font-heading font-semibold text-cp-text mb-2">
          Upcoming Contests
        </h3>
        <ErrorState message={error} onRetry={onRetry} />
      </div>
    );
  }

  const contests = data || [];

  if (contests.length === 0) {
    return (
      <div className="bg-cp-card rounded-xl p-4 md:p-6">
        <h3 className="text-lg font-heading font-semibold text-cp-text mb-4">
          Upcoming Contests
        </h3>
        <EmptyState message="No upcoming contests found" />
      </div>
    );
  }

  return (
    <div className="bg-cp-card rounded-xl p-4 md:p-6">
      <h3 className="text-lg font-heading font-semibold text-cp-text mb-4">
        Upcoming Contests
      </h3>

      <div className="space-y-1">
        {contests.map((contest) => (
          <div
            key={contest.id}
            className="flex items-center gap-3 md:gap-4 py-3 px-2 rounded-lg hover:bg-cp-bg transition-colors"
          >
            {/* Platform Logo */}
            <div
              className={`w-10 h-10 rounded-full ${contest.logoBg || 'bg-cp-primary'} flex items-center justify-center text-white text-xs font-bold font-mono shrink-0`}
            >
              {contest.logo || contest.platform?.[0] || '?'}
            </div>

            {/* Contest Info */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-cp-text truncate">
                {contest.name}
              </p>
              <p className={`text-xs ${contest.timeColor || 'text-cp-muted'}`}>{contest.time}</p>
            </div>

            {/* Register Button */}
            <a
              href={contest.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-cp-border
                         text-xs font-medium text-cp-muted hover:text-cp-primary hover:border-cp-primary
                         transition-colors whitespace-nowrap"
            >
              Register
              <ExternalLink size={12} />
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}

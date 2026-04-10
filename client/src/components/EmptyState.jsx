import { Link2 } from 'lucide-react';

export default function EmptyState({ platform, message }) {
  return (
    <div className="flex flex-col items-center justify-center py-8 px-4 border-2 border-dashed border-cp-border rounded-xl">
      <div className="w-12 h-12 rounded-full bg-cp-primary/10 flex items-center justify-center mb-3">
        <Link2 size={24} className="text-cp-primary" />
      </div>
      <p className="text-sm text-cp-muted text-center mb-3">
        {message ||
          `Link your ${platform || ''} handle to visualize your data here.`}
      </p>
      <a
        href="/settings"
        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-cp-primary to-cp-secondary text-white text-xs font-medium hover:opacity-90 transition-opacity"
      >
        Connect Account
      </a>
    </div>
  );
}

import { AlertCircle, RefreshCw } from 'lucide-react';

export default function ErrorState({ message, onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center py-8 px-4">
      <div className="w-12 h-12 rounded-full bg-cp-danger/10 flex items-center justify-center mb-3">
        <AlertCircle size={24} className="text-cp-danger" />
      </div>
      <p className="text-sm text-cp-muted text-center mb-3">
        {message || 'Something went wrong'}
      </p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="flex items-center gap-2 px-4 py-2 rounded-lg border border-cp-border text-xs font-medium text-cp-muted hover:text-cp-primary hover:border-cp-primary transition-colors"
        >
          <RefreshCw size={14} />
          Retry
        </button>
      )}
    </div>
  );
}

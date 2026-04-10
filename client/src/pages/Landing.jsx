import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Code2, ArrowRight, Sparkles } from 'lucide-react';
import { useUser } from '../context/UserContext';

export default function Landing() {
  const navigate = useNavigate();
  const { updateHandle, completeOnboarding } = useUser();

  const [handles, setHandles] = useState({
    codeforces: '',
    leetcode: '',
    codechef: '',
  });

  const handleGenerate = () => {
    // Save any entered handles
    Object.entries(handles).forEach(([platform, handle]) => {
      if (handle.trim()) {
        updateHandle(platform, handle.trim());
      }
    });
    completeOnboarding();
    navigate('/dashboard');
  };

  const handleSkip = () => {
    // Load demo data (tourist profile)
    updateHandle('codeforces', 'tourist');
    completeOnboarding();
    navigate('/dashboard');
  };

  const hasAnyInput = Object.values(handles).some((h) => h.trim());

  return (
    <div className="min-h-screen bg-cp-bg flex flex-col">
      {/* Navbar */}
      <nav className="flex items-center justify-between px-6 md:px-12 py-5">
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-gradient-to-br from-cp-primary to-cp-secondary">
            <Code2 size={20} className="text-white" />
          </div>
          <span className="text-xl font-heading font-bold text-cp-text">
            trak<span className="text-cp-primary">CP</span>
          </span>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={handleSkip}
            className="text-sm text-cp-muted hover:text-cp-text transition-colors"
          >
            Skip → Demo
          </button>
          <Link
            to="/login"
            className="px-4 py-2 rounded-lg border border-cp-border text-sm text-cp-muted hover:text-cp-primary hover:border-cp-primary transition-colors"
          >
            Sign In
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <main className="flex-1 flex items-center justify-center px-6 pb-20">
        <div className="max-w-2xl w-full text-center">
          {/* Tagline */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cp-primary/10 border border-cp-primary/20 text-cp-primary text-xs font-medium mb-6">
            <Sparkles size={14} />
            Your competitive programming command center
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold text-cp-text leading-tight mb-4">
            Track Your{' '}
            <span className="bg-gradient-to-r from-cp-primary to-cp-secondary bg-clip-text text-transparent">
              CP Growth
            </span>{' '}
            Across Platforms
          </h1>

          <p className="text-cp-muted text-lg mb-10 max-w-lg mx-auto">
            Aggregate your Codeforces, LeetCode & CodeChef stats into one
            unified dashboard. See your ratings, streaks, and upcoming contests
            at a glance.
          </p>

          {/* Handle Inputs */}
          <div className="space-y-4 max-w-md mx-auto mb-8">
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-mono text-cp-muted w-20 text-left">
                CF
              </span>
              <input
                type="text"
                placeholder="Codeforces handle"
                value={handles.codeforces}
                onChange={(e) =>
                  setHandles((h) => ({ ...h, codeforces: e.target.value }))
                }
                className="w-full pl-16 pr-4 py-3.5 rounded-xl bg-cp-card border border-cp-border text-cp-text placeholder-cp-muted text-sm font-mono focus:outline-none focus:border-cp-primary focus:ring-1 focus:ring-cp-primary/50 transition-colors"
              />
            </div>

            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-mono text-cp-muted w-20 text-left">
                LC
              </span>
              <input
                type="text"
                placeholder="LeetCode username"
                value={handles.leetcode}
                onChange={(e) =>
                  setHandles((h) => ({ ...h, leetcode: e.target.value }))
                }
                className="w-full pl-16 pr-4 py-3.5 rounded-xl bg-cp-card border border-cp-border text-cp-text placeholder-cp-muted text-sm font-mono focus:outline-none focus:border-cp-primary focus:ring-1 focus:ring-cp-primary/50 transition-colors"
              />
            </div>

            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-mono text-cp-muted w-20 text-left">
                CC
              </span>
              <input
                type="text"
                placeholder="CodeChef username"
                value={handles.codechef}
                onChange={(e) =>
                  setHandles((h) => ({ ...h, codechef: e.target.value }))
                }
                className="w-full pl-16 pr-4 py-3.5 rounded-xl bg-cp-card border border-cp-border text-cp-text placeholder-cp-muted text-sm font-mono focus:outline-none focus:border-cp-primary focus:ring-1 focus:ring-cp-primary/50 transition-colors"
              />
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={handleGenerate}
              disabled={!hasAnyInput}
              className={`flex items-center gap-2 px-8 py-3.5 rounded-xl text-sm font-semibold transition-all ${
                hasAnyInput
                  ? 'bg-gradient-to-r from-cp-primary to-cp-secondary text-white shadow-glow-primary hover:opacity-90'
                  : 'bg-cp-card text-cp-muted border border-cp-border cursor-not-allowed'
              }`}
            >
              Generate Dashboard
              <ArrowRight size={18} />
            </button>

            <button
              onClick={handleSkip}
              className="text-sm text-cp-muted hover:text-cp-primary transition-colors underline underline-offset-4"
            >
              Skip — explore with demo data
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

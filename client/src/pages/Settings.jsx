import { Save } from 'lucide-react';
import { useState } from 'react';
import { useUser } from '../context/UserContext';

export default function Settings() {
  const { platforms, updateHandle, removeHandle } = useUser();

  const [handles, setHandles] = useState({
    codeforces: platforms.codeforces?.handle || '',
    leetcode: platforms.leetcode?.handle || '',
    codechef: platforms.codechef?.handle || '',
  });

  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    Object.entries(handles).forEach(([platform, handle]) => {
      if (handle.trim()) {
        updateHandle(platform, handle.trim());
      } else {
        removeHandle(platform);
      }
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-heading font-bold text-cp-text">
          Settings
        </h1>
        <p className="text-sm text-cp-muted mt-1">
          Manage your platform handles and preferences
        </p>
      </div>

      {/* Platform Handles */}
      <div className="bg-cp-card rounded-xl p-6 space-y-5">
        <h3 className="text-lg font-heading font-semibold text-cp-text">
          Platform Handles
        </h3>

        {[
          { key: 'codeforces', label: 'Codeforces', prefix: 'CF' },
          { key: 'leetcode', label: 'LeetCode', prefix: 'LC' },
          { key: 'codechef', label: 'CodeChef', prefix: 'CC' },
        ].map((p) => (
          <div key={p.key}>
            <label className="block text-sm text-cp-muted mb-1.5">
              {p.label}
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-mono text-cp-muted">
                {p.prefix}
              </span>
              <input
                type="text"
                placeholder={`Enter ${p.label} handle`}
                value={handles[p.key]}
                onChange={(e) =>
                  setHandles((h) => ({ ...h, [p.key]: e.target.value }))
                }
                className="w-full pl-14 pr-4 py-3 rounded-xl bg-cp-bg border border-cp-border text-cp-text placeholder-cp-muted text-sm font-mono focus:outline-none focus:border-cp-primary focus:ring-1 focus:ring-cp-primary/50 transition-colors"
              />
            </div>
          </div>
        ))}

        <button
          onClick={handleSave}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-cp-primary to-cp-secondary text-white text-sm font-semibold hover:opacity-90 transition-opacity"
        >
          <Save size={16} />
          {saved ? 'Saved!' : 'Save Changes'}
        </button>
      </div>

      {/* Preferences */}
      <div className="bg-cp-card rounded-xl p-6 space-y-5">
        <h3 className="text-lg font-heading font-semibold text-cp-text">
          Preferences
        </h3>
        <div>
          <label className="block text-sm text-cp-muted mb-1.5">Theme</label>
          <select className="w-full px-4 py-3 rounded-xl bg-cp-bg border border-cp-border text-cp-text text-sm focus:outline-none focus:border-cp-primary transition-colors">
            <option value="dark">Dark (Default)</option>
            <option value="light" disabled>
              Light (Coming Soon)
            </option>
          </select>
        </div>
        <div>
          <label className="block text-sm text-cp-muted mb-1.5">
            Default View
          </label>
          <select className="w-full px-4 py-3 rounded-xl bg-cp-bg border border-cp-border text-cp-text text-sm focus:outline-none focus:border-cp-primary transition-colors">
            <option value="dashboard">Dashboard</option>
            <option value="contests">Contests</option>
          </select>
        </div>
      </div>
    </div>
  );
}

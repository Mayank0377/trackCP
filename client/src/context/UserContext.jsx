import { createContext, useContext, useState, useEffect } from 'react';

const UserContext = createContext(null);

const DEFAULT_PLATFORMS = {
  codeforces: { handle: '', lastUpdated: null },
  leetcode: { handle: '', lastUpdated: null },
  codechef: { handle: '', lastUpdated: null },
};

const DEFAULT_PREFERENCES = {
  theme: 'dark',
  defaultView: 'dashboard',
};

export function UserProvider({ children }) {
  const [platforms, setPlatforms] = useState(() => {
    const saved = localStorage.getItem('trakcp_platforms');
    return saved ? JSON.parse(saved) : DEFAULT_PLATFORMS;
  });

  const [preferences, setPreferences] = useState(() => {
    const saved = localStorage.getItem('trakcp_preferences');
    return saved ? JSON.parse(saved) : DEFAULT_PREFERENCES;
  });

  const [isOnboarded, setIsOnboarded] = useState(() => {
    return localStorage.getItem('trakcp_onboarded') === 'true';
  });

  // Persist to localStorage whenever state changes
  useEffect(() => {
    localStorage.setItem('trakcp_platforms', JSON.stringify(platforms));
  }, [platforms]);

  useEffect(() => {
    localStorage.setItem('trakcp_preferences', JSON.stringify(preferences));
  }, [preferences]);

  const updateHandle = (platform, handle) => {
    setPlatforms((prev) => ({
      ...prev,
      [platform]: { handle, lastUpdated: new Date().toISOString() },
    }));
  };

  const removeHandle = (platform) => {
    setPlatforms((prev) => ({
      ...prev,
      [platform]: { handle: '', lastUpdated: null },
    }));
  };

  const completeOnboarding = () => {
    setIsOnboarded(true);
    localStorage.setItem('trakcp_onboarded', 'true');
  };

  const hasAnyHandle = Object.values(platforms).some((p) => p.handle);

  return (
    <UserContext.Provider
      value={{
        platforms,
        preferences,
        isOnboarded,
        hasAnyHandle,
        setPlatforms,
        setPreferences,
        updateHandle,
        removeHandle,
        completeOnboarding,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) throw new Error('useUser must be used within UserProvider');
  return context;
};

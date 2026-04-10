import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Layers,
  CalendarDays,
  Settings,
  LogOut,
  Code2,
  ChevronDown,
  X,
} from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const menuItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  {
    label: 'My Platforms',
    icon: Layers,
    children: [
      { to: '/analytics/codeforces', label: 'Codeforces' },
      { to: '/analytics/leetcode', label: 'LeetCode' },
      { to: '/analytics/codechef', label: 'CodeChef' },
    ],
  },
  { to: '/dashboard', label: 'Contests', icon: CalendarDays },
  { to: '/settings', label: 'Settings', icon: Settings },
];

export default function Sidebar({ isOpen, onToggle }) {
  const [platformsOpen, setPlatformsOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/50 lg:hidden"
          onClick={onToggle}
        />
      )}

      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-30
          w-[260px] shrink-0 bg-cp-card border-r border-cp-border
          flex flex-col transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-cp-border">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-gradient-to-br from-cp-primary to-cp-secondary">
              <Code2 size={20} className="text-white" />
            </div>
            <span className="text-xl font-heading font-bold text-cp-text">
              trak<span className="text-cp-primary">CP</span>
            </span>
          </div>
          <button onClick={onToggle} className="lg:hidden text-cp-muted hover:text-cp-text">
            <X size={20} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            // Dropdown item
            if (item.children) {
              return (
                <div key={item.label}>
                  <button
                    onClick={() => setPlatformsOpen(!platformsOpen)}
                    className="flex items-center justify-between w-full px-3 py-2.5 rounded-lg text-cp-muted hover:text-cp-text hover:bg-cp-bg transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <item.icon size={20} />
                      <span className="text-sm font-medium">{item.label}</span>
                    </div>
                    <ChevronDown
                      size={16}
                      className={`transition-transform ${platformsOpen ? 'rotate-180' : ''}`}
                    />
                  </button>
                  {platformsOpen && (
                    <div className="ml-8 mt-1 space-y-1">
                      {item.children.map((child) => (
                        <NavLink
                          key={child.to}
                          to={child.to}
                          className={({ isActive }) =>
                            `block px-3 py-2 rounded-lg text-sm transition-colors ${
                              isActive
                                ? 'text-cp-primary bg-cp-primary/10'
                                : 'text-cp-muted hover:text-cp-text hover:bg-cp-bg'
                            }`
                          }
                        >
                          {child.label}
                        </NavLink>
                      ))}
                    </div>
                  )}
                </div>
              );
            }

            // Regular link
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'text-cp-primary bg-cp-primary/10'
                      : 'text-cp-muted hover:text-cp-text hover:bg-cp-bg'
                  }`
                }
              >
                <item.icon size={20} />
                {item.label}
              </NavLink>
            );
          })}
        </nav>

        {/* User Profile Footer */}
        <div className="px-4 py-4 border-t border-cp-border">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-cp-primary to-cp-secondary flex items-center justify-center text-sm font-bold text-white">
              {user?.username?.[0]?.toUpperCase() || 'G'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-cp-text truncate">
                {user?.username || 'Guest User'}
              </p>
              <p className="text-xs text-cp-muted truncate">
                {user?.email || 'Not signed in'}
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="text-cp-muted hover:text-cp-danger transition-colors"
              title="Logout"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}

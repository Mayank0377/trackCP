import { Search, Bell, PlusCircle, Menu } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Header({ onMenuToggle }) {
  const [hasNotifications] = useState(true);
  const navigate = useNavigate();

  return (
    <header className="flex items-center justify-between px-4 md:px-6 py-3 md:py-4 bg-cp-card border-b border-cp-border">
      {/* Left: Hamburger + Search */}
      <div className="flex items-center gap-3 md:gap-4 flex-1">
        <button
          onClick={onMenuToggle}
          className="lg:hidden text-cp-muted hover:text-cp-text transition-colors"
        >
          <Menu size={22} />
        </button>

        <div className="relative max-w-md flex-1 hidden sm:block">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-cp-muted"
          />
          <input
            type="text"
            placeholder="Search problems, tags, or users..."
            className="w-full pl-10 pr-4 py-2.5 rounded-full bg-cp-bg border border-cp-border
                       text-sm text-cp-text placeholder-cp-muted
                       focus:outline-none focus:border-cp-primary focus:ring-1 focus:ring-cp-primary/50
                       transition-colors"
          />
        </div>

        {/* Mobile search icon */}
        <button className="sm:hidden text-cp-muted hover:text-cp-text transition-colors">
          <Search size={20} />
        </button>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2 md:gap-3 ml-4">
        {/* Notification Bell */}
        <button className="relative p-2 rounded-lg text-cp-muted hover:text-cp-text hover:bg-cp-bg transition-colors">
          <Bell size={20} />
          {hasNotifications && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-cp-danger rounded-full" />
          )}
        </button>

        {/* Add Profile */}
        <button
          onClick={() => navigate('/settings')}
          className="flex items-center gap-2 px-3 md:px-4 py-2 rounded-lg bg-gradient-to-r from-cp-primary to-cp-secondary text-white text-sm font-medium hover:opacity-90 transition-opacity"
        >
          <PlusCircle size={16} />
          <span className="hidden sm:inline">Add Profile</span>
        </button>
      </div>
    </header>
  );
}

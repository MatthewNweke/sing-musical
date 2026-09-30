import { Home, Library, Mic, Upload, Radio, User } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { useSessionStore } from '@/state/sessionStore';

const NAV_ITEMS = [
  { to: '/', label: 'Home', icon: Home, end: true },
  { to: '/record', label: 'Record', icon: Mic, end: false },
  { to: '/library', label: 'Library', icon: Library, end: false },
  { to: '/upload', label: 'Upload', icon: Upload, end: false },
  { to: '/live', label: 'Go Live', icon: Radio, end: false },
];

export function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const user = useSessionStore((s) => s.user);

  return (
    <div className="flex h-full flex-col px-4 py-6">
      <div className="mb-8 flex items-center gap-2 px-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-gold-400 text-ink-950">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M12 2l2.2 6.8H21l-5.6 4.1 2.1 6.9L12 15.7 6.5 19.8l2.1-6.9L3 8.8h6.8z" />
          </svg>
        </span>
        <span className="text-[15px] font-semibold">Sing Musically</span>
      </div>

      <nav className="flex flex-1 flex-col gap-1">
        {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={onNavigate}
            className={({ isActive }) =>
              `focus-ring flex items-center gap-3 rounded-xl px-3 py-2.5 text-[14px] font-medium transition ${
                isActive ? 'bg-mint-500/15 text-mint-300' : 'text-white/55 hover:bg-white/[0.05] hover:text-white/85'
              }`
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>

      <NavLink
        to="/profile"
        onClick={onNavigate}
        className={({ isActive }) =>
          `focus-ring flex items-center gap-3 rounded-xl px-3 py-2.5 text-[14px] font-medium transition ${
            isActive ? 'bg-white/[0.08] text-white' : 'text-white/55 hover:bg-white/[0.05] hover:text-white/85'
          }`
        }
      >
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-mint-500 to-gold-400 text-[11px] font-bold text-ink-950">
          {user?.displayName.slice(0, 1).toUpperCase() ?? <User size={12} />}
        </span>
        {user?.displayName ?? 'Profile'}
      </NavLink>
    </div>
  );
}

export function Sidebar() {
  return (
    <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-white/[0.06] bg-ink-950/60 md:flex">
      <SidebarContent />
    </aside>
  );
}

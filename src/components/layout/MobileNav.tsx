import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Menu, X, Home, Library, Mic, Compass, User } from 'lucide-react';
import { SidebarContent } from './Sidebar';

const BOTTOM_NAV = [
  { to: '/', label: 'Home', icon: Home, end: true },
  { to: '/library', label: 'Library', icon: Library, end: false },
  { to: '/record', label: 'Record', icon: Mic, end: false },
  { to: '/explore', label: 'Explore', icon: Compass, end: false },
  { to: '/profile', label: 'Profile', icon: User, end: false },
];

export function MobileNav() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Top bar */}
      <div className="flex items-center border-b border-white/[0.06] bg-ink-950/60 px-4 py-3 md:hidden">
        <button
          aria-label="Open navigation"
          onClick={() => setOpen(true)}
          className="focus-ring flex h-9 w-9 items-center justify-center rounded-full text-white/70 hover:bg-white/[0.06]"
        >
          <Menu size={20} />
        </button>
        <span className="ml-2 text-[15px] font-semibold">Sing Musically</span>
      </div>

      {/* Slide-in drawer */}
      {open && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div className="w-72 border-r border-white/[0.06] bg-ink-950">
            <div className="flex justify-end px-4 pt-4">
              <button
                aria-label="Close navigation"
                onClick={() => setOpen(false)}
                className="focus-ring flex h-9 w-9 items-center justify-center rounded-full text-white/70 hover:bg-white/[0.06]"
              >
                <X size={20} />
              </button>
            </div>
            <SidebarContent onNavigate={() => setOpen(false)} />
          </div>
          <button
            aria-label="Close navigation overlay"
            className="flex-1 bg-black/50"
            onClick={() => setOpen(false)}
          />
        </div>
      )}

      {/* Bottom tab bar */}
      <nav
        className="fixed bottom-0 inset-x-0 z-40 flex border-t border-white/[0.06] bg-ink-950/90 pb-safe-bottom backdrop-blur-sm md:hidden"
        aria-label="Bottom navigation"
      >
        {BOTTOM_NAV.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex flex-1 flex-col items-center gap-1 py-2.5 text-[10px] font-medium transition ${isActive ? 'text-mint-400' : 'text-white/40'
              } ${to === '/record' ? 'relative' : ''}`
            }
          >
            {({ isActive }) =>
              to === '/record' ? (
                <>
                  <span className={`flex h-10 w-10 items-center justify-center rounded-full shadow-glow transition ${isActive ? 'bg-mint-500' : 'bg-mint-500/80'}`}>
                    <Mic size={20} className="text-ink-950" />
                  </span>
                  <span className={isActive ? 'text-mint-400' : 'text-white/40'}>{label}</span>
                </>
              ) : (
                <>
                  <Icon size={20} />
                  <span>{label}</span>
                </>
              )
            }
          </NavLink>
        ))}
      </nav>
    </>
  );
}

import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { SidebarContent } from './Sidebar';

export function MobileNav() {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex items-center border-b border-white/[0.06] bg-ink-950/60 px-4 py-3 md:hidden">
      <button
        aria-label="Open navigation"
        onClick={() => setOpen(true)}
        className="focus-ring flex h-9 w-9 items-center justify-center rounded-full text-white/70 hover:bg-white/[0.06]"
      >
        <Menu size={20} />
      </button>
      <span className="ml-2 text-[15px] font-semibold">Sing Musically</span>

      {open && (
        <div className="fixed inset-0 z-50 flex">
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
    </div>
  );
}

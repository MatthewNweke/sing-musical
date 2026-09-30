import { Sidebar } from './Sidebar';
import { MobileNav } from './MobileNav';

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-ink-900">
      <Sidebar />
      <MobileNav />
      {/* pb-20 gives breathing room above the mobile bottom nav */}
      <main className="min-h-screen pb-20 md:pb-0 md:pl-64">{children}</main>
    </div>
  );
}

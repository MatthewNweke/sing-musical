import { Sidebar } from './Sidebar';
import { MobileNav } from './MobileNav';

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-ink-900">
      <Sidebar />
      <MobileNav />
      <main className="min-h-screen md:pl-64">{children}</main>
    </div>
  );
}

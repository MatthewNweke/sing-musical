import { useEffect } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { AppShell } from '@/components/layout/AppShell';
import { HomeScreen } from '@/screens/HomeScreen';
import { RecordScreen } from '@/screens/RecordScreen';
import { MixScreen } from '@/screens/MixScreen';
import { UploadScreen } from '@/screens/UploadScreen';
import { GoLiveScreen } from '@/screens/GoLiveScreen';
import { LibraryScreen } from '@/screens/LibraryScreen';
import { ProfileScreen } from '@/screens/ProfileScreen';
import { ExploreScreen } from '@/screens/ExploreScreen';
import { SettingsScreen } from '@/screens/SettingsScreen';
import { LoginScreen } from '@/screens/LoginScreen';
import { SignupScreen } from '@/screens/SignupScreen';
import { AuthConfirmScreen } from '@/screens/AuthConfirmScreen';
import { useSessionStore } from '@/state/sessionStore';

function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useSessionStore();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/10 border-t-mint-400" />
          <span className="text-[13px] text-white/30">Loading…</span>
        </div>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export default function App() {
  const hydrate = useSessionStore((s) => s.hydrate);

  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  return (
    <Routes>
      <Route path="/login" element={<LoginScreen />} />
      <Route path="/signup" element={<SignupScreen />} />
      <Route path="/auth/confirm" element={<AuthConfirmScreen />} />

      <Route
        path="/*"
        element={
          <RequireAuth>
            <AppShell>
              <Routes>
                <Route path="/" element={<HomeScreen />} />
                <Route path="/library" element={<LibraryScreen />} />
                <Route path="/explore" element={<ExploreScreen />} />
                <Route path="/profile" element={<ProfileScreen />} />
                <Route path="/settings" element={<SettingsScreen />} />
                <Route path="/record" element={<RecordScreen />} />
                <Route path="/mix/:songId" element={<MixScreen />} />
                <Route path="/upload" element={<UploadScreen />} />
                <Route path="/live" element={<GoLiveScreen />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </AppShell>
          </RequireAuth>
        }
      />
    </Routes>
  );
}

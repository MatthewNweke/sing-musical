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
import { LoginScreen } from '@/screens/LoginScreen';
import { SignupScreen } from '@/screens/SignupScreen';
import { useSessionStore } from '@/state/sessionStore';

function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useSessionStore();
  if (isLoading) return <div className="flex min-h-screen items-center justify-center text-white/30">Loading…</div>;
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

      <Route
        path="/*"
        element={
          <RequireAuth>
            <AppShell>
              <Routes>
                <Route path="/" element={<HomeScreen />} />
                <Route path="/library" element={<LibraryScreen />} />
                <Route path="/profile" element={<ProfileScreen />} />
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

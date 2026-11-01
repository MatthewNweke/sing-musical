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
import { GenrePickerScreen } from '@/screens/GenrePickerScreen';
import { SuggestionScreen } from '@/screens/SuggestionScreen';
import { InstrumentEditorScreen } from '@/screens/InstrumentEditorScreen';
import { LiveModeScreen } from '@/screens/LiveModeScreen';
import { SubscriptionScreen } from '@/screens/SubscriptionScreen';
import { ExportScreen } from '@/screens/ExportScreen';
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
      {/* Public auth routes */}
      <Route path="/login" element={<LoginScreen />} />
      <Route path="/signup" element={<SignupScreen />} />
      <Route path="/auth/confirm" element={<AuthConfirmScreen />} />

      {/* Protected app routes */}
      <Route
        path="/*"
        element={
          <RequireAuth>
            <AppShell>
              <Routes>
                <Route path="/" element={<HomeScreen />} />

                {/* Library & social */}
                <Route path="/library" element={<LibraryScreen />} />
                <Route path="/explore" element={<ExploreScreen />} />

                {/* Recording flow */}
                <Route path="/record" element={<RecordScreen />} />
                <Route path="/genre-picker" element={<GenrePickerScreen />} />
                <Route path="/suggestion" element={<SuggestionScreen />} />
                <Route path="/instrument-editor" element={<InstrumentEditorScreen />} />

                {/* Mix & export */}
                <Route path="/mix/:songId" element={<MixScreen />} />
                <Route path="/export/:songId" element={<ExportScreen />} />

                {/* Upload */}
                <Route path="/upload" element={<UploadScreen />} />

                {/* Live */}
                <Route path="/live" element={<GoLiveScreen />} />
                <Route path="/live/mode" element={<LiveModeScreen />} />

                {/* Account */}
                <Route path="/profile" element={<ProfileScreen />} />
                <Route path="/settings" element={<SettingsScreen />} />
                <Route path="/subscription" element={<SubscriptionScreen />} />

                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </AppShell>
          </RequireAuth>
        }
      />
    </Routes>
  );
}

import { useNavigate } from 'react-router-dom';
import { Settings, Music2, Users } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { useSessionStore } from '@/state/sessionStore';
import { isUsingRealBackend } from '@/services';

export function ProfileScreen() {
  const navigate = useNavigate();
  const { user } = useSessionStore();

  if (!user) return null;

  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-10 md:px-10">
      <header className="mb-8 flex flex-col items-center text-center">
        <div className="relative mb-3">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-mint-500 to-gold-400 text-[24px] font-bold text-ink-950">
            {user.displayName.slice(0, 1).toUpperCase()}
          </div>
          <button
            onClick={() => navigate('/settings')}
            aria-label="Open settings"
            className="focus-ring absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full border border-white/[0.1] bg-ink-800 text-white/60 hover:text-white/90"
          >
            <Settings size={13} />
          </button>
        </div>
        <h1 className="text-[18px] font-bold">{user.displayName}</h1>
        <p className="text-[13px] text-white/40">{user.handle}</p>
      </header>

      <div className="mb-6 grid grid-cols-2 gap-3">
        <Card className="flex flex-col items-center gap-1 py-4">
          <Users size={16} className="text-mint-400" />
          <span className="text-[16px] font-bold">{user.followerCount}</span>
          <span className="text-[11px] text-white/40">Followers</span>
        </Card>
        <Card className="flex flex-col items-center gap-1 py-4">
          <Music2 size={16} className="text-gold-400" />
          <span className="text-[16px] font-bold">{user.followingCount}</span>
          <span className="text-[11px] text-white/40">Following</span>
        </Card>
      </div>

      {user.bio && (
        <Card className="mb-6 p-4">
          <p className="text-[14px] text-white/70">{user.bio}</p>
        </Card>
      )}

      <Card className="mb-6 flex items-center justify-between p-4">
        <span className="text-[13px] text-white/50">Backend</span>
        <span className={`text-[13px] font-semibold ${isUsingRealBackend ? 'text-mint-400' : 'text-gold-400'}`}>
          {isUsingRealBackend ? 'Supabase (live)' : 'Mock data'}
        </span>
      </Card>

      <button
        onClick={() => navigate('/settings')}
        className="focus-ring flex w-full items-center justify-center gap-2 rounded-card border border-white/[0.08] py-3.5 text-[14px] font-semibold text-white/70 transition hover:bg-white/[0.04]"
      >
        <Settings size={16} /> Edit profile & settings
      </button>
    </div>
  );
}

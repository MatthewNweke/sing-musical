import { useEffect, useState } from 'react';
import { Radio, Users } from 'lucide-react';
import { TopBar } from '@/components/ui/TopBar';
import { Card } from '@/components/ui/Card';
import { Pill } from '@/components/ui/Pill';
import { dataService } from '@/services';
import { useSessionStore } from '@/state/sessionStore';
import type { LiveSession } from '@/lib/types';

export function GoLiveScreen() {
  const user = useSessionStore((s) => s.user);
  const [sessions, setSessions] = useState<LiveSession[]>([]);
  const [mySession, setMySession] = useState<LiveSession | null>(null);
  const [isStarting, setIsStarting] = useState(false);

  useEffect(() => {
    void dataService.getLiveSessions().then(setSessions);
  }, []);

  const goLive = async () => {
    if (!user) return;
    setIsStarting(true);
    const session = await dataService.startLiveSession(user.id, `${user.displayName}'s session`);
    setMySession(session);
    setSessions((prev) => [session, ...prev]);
    setIsStarting(false);
  };

  const endLive = async () => {
    if (!mySession) return;
    await dataService.endLiveSession(mySession.id);
    setSessions((prev) => prev.filter((s) => s.id !== mySession.id));
    setMySession(null);
  };

  return (
    <div className="mx-auto w-full max-w-2xl px-6 py-4 md:px-10">
      <TopBar title="Go live" showBack />

      <Card className="mb-6 flex flex-col items-center gap-3 p-6 text-center">
        <span className={`flex h-14 w-14 items-center justify-center rounded-full ${mySession ? 'bg-red-500' : 'bg-mint-500'}`}>
          <Radio className={mySession ? 'text-white' : 'text-ink-950'} size={24} />
        </span>
        <p className="text-[16px] font-semibold text-white">
          {mySession ? "You're live" : 'Your band, on stage'}
        </p>
        <p className="text-[13px] text-white/40">
          {mySession
            ? `${mySession.listenerCount} listening right now`
            : 'Broadcast a take in real time and let people drop in.'}
        </p>
        <button
          onClick={mySession ? endLive : goLive}
          disabled={isStarting}
          className={`focus-ring mt-2 w-full rounded-card py-3 text-[14px] font-semibold transition active:scale-[0.98] disabled:opacity-50 ${
            mySession ? 'bg-white/10 text-white' : 'bg-mint-500 text-ink-950'
          }`}
        >
          {isStarting ? 'Starting…' : mySession ? 'End session' : 'Go live now'}
        </button>
      </Card>

      <p className="mb-3 text-[13px] font-semibold uppercase tracking-wide text-white/35">Live now</p>
      <div className="space-y-3">
        {sessions.filter((s) => s.id !== mySession?.id).map((session) => (
          <Card key={session.id} className="flex items-center justify-between p-4">
            <div>
              <p className="text-[14px] font-semibold text-white">{session.title}</p>
              <p className="flex items-center gap-1 text-[12px] text-white/40">
                <Users size={12} /> {session.listenerCount} listening
              </p>
            </div>
            <Pill tone="mint">Live</Pill>
          </Card>
        ))}
        {sessions.length === 0 && <p className="text-center text-[13px] text-white/30">No one's live right now.</p>}
      </div>

      <p className="mt-6 text-center text-[11px] text-white/25">
        Real-time audio streaming needs a WebRTC/media-server layer (e.g. LiveKit or Agora) — this view wires the
        session lifecycle so that layer can be dropped in without UI changes.
      </p>
    </div>
  );
}

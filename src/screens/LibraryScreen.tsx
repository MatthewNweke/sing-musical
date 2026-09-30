import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Music2, Plus } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Pill } from '@/components/ui/Pill';
import { Waveform } from '@/components/ui/Waveform';
import { dataService } from '@/services';
import { useSessionStore } from '@/state/sessionStore';
import type { Song } from '@/lib/types';

export function LibraryScreen() {
  const navigate = useNavigate();
  const user = useSessionStore((s) => s.user);
  const [songs, setSongs] = useState<Song[] | null>(null);

  useEffect(() => {
    if (!user) return;
    void dataService.getSongs(user.id).then(setSongs);
  }, [user]);

  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-8 md:px-10">
      <header className="mb-8 flex items-center justify-between">
        <h1 className="text-[20px] font-bold">Your library</h1>
        <button
          onClick={() => navigate('/record')}
          aria-label="New recording"
          className="focus-ring flex h-9 w-9 items-center justify-center rounded-full bg-mint-500 text-ink-950 transition active:scale-95"
        >
          <Plus size={18} />
        </button>
      </header>

      {songs === null && <p className="text-center text-white/30">Loading your songs…</p>}

      {songs?.length === 0 && (
        <Card className="flex flex-col items-center gap-3 px-6 py-12 text-center">
          <Music2 className="text-white/25" size={28} />
          <p className="text-[15px] font-semibold text-white">Nothing here yet</p>
          <p className="text-[13px] text-white/40">Record your first take and it'll show up here.</p>
        </Card>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {songs?.map((song) => (
          <button
            key={song.id}
            onClick={() => navigate(`/mix/${song.id}`)}
            className="focus-ring w-full text-left"
          >
            <Card className="p-4">
              <div className="mb-2 flex items-center justify-between">
                <p className="text-[15px] font-semibold text-white">{song.title}</p>
                <Pill tone={song.isPublic ? 'mint' : 'neutral'}>{song.isPublic ? 'Public' : 'Private'}</Pill>
              </div>
              <Waveform samples={song.masterWaveform.slice(0, 24)} colorClassName="bg-mint-400/70" heightClassName="h-8" barWidth={2} gap={2} />
              <div className="mt-2 flex items-center justify-between text-[11px] text-white/40">
                <span>{song.key} · {song.bpm} BPM</span>
                <span>{song.tracks.length} track{song.tracks.length === 1 ? '' : 's'}</span>
              </div>
            </Card>
          </button>
        ))}
      </div>
    </div>
  );
}

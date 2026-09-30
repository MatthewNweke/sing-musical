import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Music2, Plus, Trash2, Pencil, Check, X } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Pill } from '@/components/ui/Pill';
import { Waveform } from '@/components/ui/Waveform';
import { dataService } from '@/services';
import { useSessionStore } from '@/state/sessionStore';
import { useToast } from '@/components/ui/toastContext';
import type { Song } from '@/lib/types';

function SongCard({ song, onDelete, onRename, onClick }: {
  song: Song;
  onDelete: (id: string) => void;
  onRename: (id: string, title: string) => void;
  onClick: () => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(song.title);

  const handleRename = (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (title.trim()) {
      onRename(song.id, title.trim());
      setIsEditing(false);
    }
  };

  const handleCancelEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setTitle(song.title);
    setIsEditing(false);
  };

  return (
    <Card className="p-4 transition hover:border-white/[0.12]">
      <div className="mb-2 flex items-start justify-between gap-2">
        {isEditing ? (
          <form onSubmit={handleRename} className="flex flex-1 items-center gap-1" onClick={(e) => e.stopPropagation()}>
            <input
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="focus-ring flex-1 rounded-lg border border-white/[0.1] bg-white/[0.05] px-2 py-1 text-[14px] text-white outline-none"
            />
            <button type="submit" className="text-mint-400 hover:text-mint-300" aria-label="Save title">
              <Check size={14} />
            </button>
            <button type="button" onClick={handleCancelEdit} className="text-white/40 hover:text-white/70" aria-label="Cancel">
              <X size={14} />
            </button>
          </form>
        ) : (
          <button onClick={onClick} className="flex-1 text-left">
            <p className="truncate text-[15px] font-semibold text-white">{song.title}</p>
          </button>
        )}
        <div className="flex shrink-0 items-center gap-1">
          <Pill tone={song.isPublic ? 'mint' : 'neutral'}>{song.isPublic ? 'Public' : 'Private'}</Pill>
          <button
            onClick={(e) => { e.stopPropagation(); setIsEditing(true); }}
            className="ml-1 text-white/30 hover:text-white/70"
            aria-label="Rename song"
          >
            <Pencil size={13} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(song.id); }}
            className="text-white/30 hover:text-red-400"
            aria-label="Delete song"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>
      <button onClick={onClick} className="w-full text-left">
        <Waveform samples={song.masterWaveform.slice(0, 24)} colorClassName="bg-mint-400/70" heightClassName="h-8" barWidth={2} gap={2} />
        <div className="mt-2 flex items-center justify-between text-[11px] text-white/40">
          <span>{song.key} · {song.bpm} BPM</span>
          <span>{song.tracks.length} track{song.tracks.length === 1 ? '' : 's'}</span>
        </div>
      </button>
    </Card>
  );
}

export function LibraryScreen() {
  const navigate = useNavigate();
  const user = useSessionStore((s) => s.user);
  const [songs, setSongs] = useState<Song[] | null>(null);
  const { toast } = useToast();

  const load = () => {
    if (!user) return;
    void dataService.getSongs(user.id).then(setSongs);
  };

  useEffect(() => { load(); }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this song? This cannot be undone.')) return;
    try {
      await dataService.deleteSong(id);
      setSongs((prev) => prev?.filter((s) => s.id !== id) ?? null);
      toast('Song deleted.', 'success');
    } catch {
      toast('Could not delete. Try again.', 'error');
    }
  };

  const handleRename = async (id: string, title: string) => {
    try {
      await dataService.renameSong(id, title);
      setSongs((prev) => prev?.map((s) => s.id === id ? { ...s, title } : s) ?? null);
      toast('Renamed!', 'success');
    } catch {
      toast('Could not rename. Try again.', 'error');
    }
  };

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
          <button
            onClick={() => navigate('/record')}
            className="focus-ring mt-2 rounded-card bg-mint-500 px-5 py-2.5 text-[14px] font-semibold text-ink-950 transition active:scale-[0.98]"
          >
            Start recording
          </button>
        </Card>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {songs?.map((song) => (
          <SongCard
            key={song.id}
            song={song}
            onDelete={handleDelete}
            onRename={handleRename}
            onClick={() => navigate(`/mix/${song.id}`)}
          />
        ))}
      </div>
    </div>
  );
}

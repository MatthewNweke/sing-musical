import { useNavigate, useSearchParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Mic, Play, Pause, Square, RotateCcw, MicOff, Sparkles } from 'lucide-react';
import { TopBar } from '@/components/ui/TopBar';
import { Pill } from '@/components/ui/Pill';
import { Waveform } from '@/components/ui/Waveform';
import { LevelMeter } from '@/components/ui/LevelMeter';
import { useRecorder } from '@/hooks/useRecorder';
import { useAudioPlayer } from '@/hooks/useAudioPlayer';
import { dataService } from '@/services';
import { useSessionStore } from '@/state/sessionStore';
import { useToast } from '@/components/ui/toastContext';
import { GENRE_MAP } from '@/lib/genres';
import type { GenreId } from '@/lib/types';

function formatTime(ms: number) {
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  return `${String(m).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
}

export function RecordScreen() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const genreId = params.get('genre') as GenreId | null;
  const genre = genreId ? GENRE_MAP.get(genreId) : null;

  const { isRecording, elapsedMs, inputLevel, waveform, audioBlob, start, stop, reset, permissionDenied } = useRecorder();
  const player = useAudioPlayer();
  const [isSaving, setIsSaving] = useState(false);
  const [title, setTitle] = useState('New Vocal');
  const user = useSessionStore((s) => s.user);
  const { toast } = useToast();

  useEffect(() => {
    if (audioBlob) player.load(audioBlob);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [audioBlob]);

  const handleToggleRecord = async () => {
    if (isRecording) stop();
    else await start();
  };

  const handleReset = () => {
    reset();
    player.pause();
  };

  const handleFinish = async () => {
    if (!user || elapsedMs === 0 || !audioBlob) return;
    setIsSaving(true);
    try {
      const song = await dataService.saveRecording(audioBlob, title.trim() || 'New Vocal', user.id);
      toast('Take saved!', 'success');
      if (genreId) {
        // Go to suggestion screen with the new song
        navigate(`/suggestion?genre=${genreId}&songId=${song.id}`);
      } else {
        navigate(`/mix/${song.id}`);
      }
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Could not save. Try again.', 'error');
      setIsSaving(false);
    }
  };

  const hasTake = elapsedMs > 0 && !isRecording;

  return (
    <div className="mx-auto w-full max-w-2xl px-6 py-4 md:px-10">
      <TopBar
        title="New Vocal"
        showBack
        right={
          <button
            onClick={() => navigate(`/genre-picker?from=record`)}
            className="focus-ring flex items-center gap-1.5 rounded-xl border border-white/[0.08] px-3 py-1.5 text-[12px] font-medium text-white/60 transition hover:bg-white/[0.05]"
          >
            {genre ? <>{genre.emoji} {genre.label}</> : <><Sparkles size={12} /> Pick genre</>}
          </button>
        }
      />

      <div className="rounded-card border border-white/[0.06] bg-white/[0.03] p-6 md:p-8">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="focus-ring mb-5 w-full rounded-xl border border-white/[0.06] bg-white/[0.03] px-3 py-2 text-[15px] font-semibold text-white outline-none placeholder:text-white/25"
          placeholder="Name this take…"
          aria-label="Take title"
        />

        <div className="mb-6 flex items-center justify-between">
          {permissionDenied ? (
            <Pill tone="neutral"><MicOff size={12} /> Mic blocked</Pill>
          ) : (
            <Pill tone={isRecording ? 'mint' : 'neutral'}>
              {isRecording ? 'Recording…' : hasTake ? 'Take recorded' : 'Ready'}
            </Pill>
          )}
          {genre && (
            <span className="text-xs text-white/40">{genre.emoji} {genre.label} · {genre.defaultBpm} BPM</span>
          )}
        </div>

        <div className="mb-6 text-center text-[40px] font-bold tabular-nums tracking-tight">
          {hasTake && player.duration > 0 ? formatTime(player.currentTime * 1000) : formatTime(elapsedMs)}
        </div>

        <div className="mb-6">
          <Waveform samples={waveform} colorClassName="bg-gold-400" heightClassName="h-20" barWidth={3} gap={3} />
        </div>

        <LevelMeter level={inputLevel} />

        {permissionDenied && (
          <p className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-center text-[13px] text-red-300">
            Mic access was denied. Allow microphone access in your browser settings and reload.
          </p>
        )}

        <div className="mt-8 flex items-center justify-center gap-8">
          <button
            aria-label={player.isPlaying ? 'Pause' : 'Play back recording'}
            disabled={!hasTake || !audioBlob}
            onClick={player.toggle}
            className="focus-ring flex h-11 w-11 items-center justify-center rounded-full text-white/60 transition hover:bg-white/[0.06] disabled:opacity-30"
          >
            {player.isPlaying ? <Pause size={18} /> : <Play size={18} />}
          </button>

          <button
            aria-label={isRecording ? 'Stop recording' : 'Start recording'}
            onClick={handleToggleRecord}
            disabled={permissionDenied}
            className={`focus-ring flex h-16 w-16 items-center justify-center rounded-full shadow-glow transition active:scale-95 disabled:opacity-40 ${isRecording ? 'bg-red-500' : 'bg-mint-500'
              }`}
          >
            {isRecording
              ? <Square size={22} className="text-white" fill="currentColor" />
              : <Mic size={26} className="text-ink-950" />}
          </button>

          <button
            aria-label="Discard take"
            disabled={elapsedMs === 0 || isRecording}
            onClick={handleReset}
            className="focus-ring flex h-11 w-11 items-center justify-center rounded-full text-white/60 transition hover:bg-white/[0.06] disabled:opacity-30"
          >
            <RotateCcw size={18} />
          </button>
        </div>

        <p className="mt-6 text-center text-[13px] text-white/35">
          {isRecording
            ? "Tap stop when you're happy with the take"
            : hasTake
              ? 'Play it back, or save to continue'
              : 'Tap the green button and sing naturally'}
        </p>
      </div>

      {hasTake && audioBlob && (
        <button
          onClick={handleFinish}
          disabled={isSaving}
          className="focus-ring mt-4 w-full rounded-card bg-mint-500 py-3.5 text-[15px] font-semibold text-ink-950 transition active:scale-[0.98] disabled:opacity-60"
        >
          {isSaving
            ? 'Uploading & saving…'
            : genreId
              ? `Save & get ${genre?.label ?? ''} arrangement →`
              : 'Save & go to Mix →'}
        </button>
      )}
    </div>
  );
}

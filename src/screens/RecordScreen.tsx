import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Mic, Play, Pause, Square, RotateCcw, MicOff } from 'lucide-react';
import { TopBar } from '@/components/ui/TopBar';
import { Pill } from '@/components/ui/Pill';
import { Waveform } from '@/components/ui/Waveform';
import { LevelMeter } from '@/components/ui/LevelMeter';
import { useRecorder } from '@/hooks/useRecorder';
import { useAudioPlayer } from '@/hooks/useAudioPlayer';
import { dataService } from '@/services';
import { useSessionStore } from '@/state/sessionStore';
import { useToast } from '@/components/ui/toastContext';

function formatTime(ms: number) {
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  return `${String(m).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
}

export function RecordScreen() {
  const navigate = useNavigate();
  const { isRecording, elapsedMs, inputLevel, waveform, audioBlob, start, stop, reset, permissionDenied } = useRecorder();
  const player = useAudioPlayer();
  const [isSaving, setIsSaving] = useState(false);
  const [title, setTitle] = useState('New Vocal');
  const user = useSessionStore((s) => s.user);
  const { toast } = useToast();

  // Load recorded blob into player when available
  useEffect(() => {
    if (audioBlob) player.load(audioBlob);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [audioBlob]);

  const handleToggleRecord = async () => {
    if (isRecording) {
      stop();
    } else {
      await start();
    }
  };

  const handleReset = () => {
    reset();
    player.pause();
  };

  const handleFinish = async () => {
    if (!user || elapsedMs === 0) return;
    setIsSaving(true);
    try {
      const song = await dataService.createSong({
        title: title.trim() || 'New Vocal',
        key: 'A minor',
        bpm: 84,
        ownerId: user.id,
      });
      toast('Take saved!', 'success');
      navigate(`/mix/${song.id}`);
    } catch {
      toast('Could not save. Try again.', 'error');
      setIsSaving(false);
    }
  };

  const hasTake = elapsedMs > 0 && !isRecording;

  return (
    <div className="mx-auto w-full max-w-2xl px-6 py-4 md:px-10">
      <TopBar title="New Vocal" showBack />

      <div className="rounded-card border border-white/[0.06] bg-white/[0.03] p-6 md:p-8">
        {/* Title input */}
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="focus-ring mb-5 w-full rounded-xl border border-white/[0.06] bg-white/[0.03] px-3 py-2 text-[15px] font-semibold text-white outline-none placeholder:text-white/25"
          placeholder="Name this take…"
          aria-label="Take title"
        />

        <div className="mb-6 flex items-center justify-between">
          {permissionDenied ? (
            <Pill tone="neutral">
              <MicOff size={12} /> Mic blocked
            </Pill>
          ) : (
            <Pill tone={isRecording ? 'mint' : 'neutral'}>
              {isRecording ? 'Recording…' : hasTake ? 'Take recorded' : 'Ready'}
            </Pill>
          )}
          <span className="text-xs text-white/40">A minor · 84 BPM</span>
        </div>

        <div className="mb-6 text-center text-[40px] font-bold tabular-nums tracking-tight">
          {hasTake && player.duration > 0
            ? formatTime(player.currentTime * 1000)
            : formatTime(elapsedMs)}
        </div>

        <div className="mb-6">
          <Waveform samples={waveform} colorClassName="bg-gold-400" heightClassName="h-20" barWidth={3} gap={3} />
        </div>

        <LevelMeter level={inputLevel} />

        {permissionDenied && (
          <p className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-center text-[13px] text-red-300">
            Microphone access was denied. Please allow mic access in your browser settings and try again.
          </p>
        )}

        <div className="mt-8 flex items-center justify-center gap-8">
          {/* Play/Pause playback */}
          <button
            aria-label={player.isPlaying ? 'Pause' : 'Play back recording'}
            disabled={!hasTake || !audioBlob}
            onClick={player.toggle}
            className="focus-ring flex h-11 w-11 items-center justify-center rounded-full text-white/60 transition hover:bg-white/[0.06] disabled:opacity-30"
          >
            {player.isPlaying ? <Pause size={18} /> : <Play size={18} />}
          </button>

          {/* Record / Stop */}
          <button
            aria-label={isRecording ? 'Stop recording' : 'Start recording'}
            onClick={handleToggleRecord}
            disabled={permissionDenied}
            className={`focus-ring flex h-16 w-16 items-center justify-center rounded-full shadow-glow transition active:scale-95 disabled:opacity-40 ${isRecording ? 'bg-red-500' : 'bg-mint-500'
              }`}
          >
            {isRecording ? (
              <Square size={22} className="text-white" fill="currentColor" />
            ) : (
              <Mic size={26} className="text-ink-950" />
            )}
          </button>

          {/* Reset */}
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
            ? 'Tap stop when you\'re happy with the take'
            : hasTake
              ? 'Play it back, or save it to continue mixing'
              : 'Tap the green button and sing naturally'}
        </p>
      </div>

      {hasTake && (
        <button
          onClick={handleFinish}
          disabled={isSaving}
          className="focus-ring mt-4 w-full rounded-card bg-mint-500 py-3.5 text-[15px] font-semibold text-ink-950 transition active:scale-[0.98] disabled:opacity-60"
        >
          {isSaving ? 'Saving…' : 'Save & go to Mix →'}
        </button>
      )}
    </div>
  );
}

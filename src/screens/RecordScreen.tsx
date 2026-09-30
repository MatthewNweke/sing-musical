import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Mic, MoreHorizontal, Play, Square } from 'lucide-react';
import { TopBar } from '@/components/ui/TopBar';
import { Pill } from '@/components/ui/Pill';
import { Waveform } from '@/components/ui/Waveform';
import { LevelMeter } from '@/components/ui/LevelMeter';
import { useRecorder } from '@/hooks/useRecorder';
import { dataService } from '@/services';
import { useSessionStore } from '@/state/sessionStore';

function formatTime(ms: number) {
  const totalSeconds = Math.floor(ms / 1000);
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export function RecordScreen() {
  const navigate = useNavigate();
  const { isRecording, elapsedMs, inputLevel, waveform, start, stop } = useRecorder();
  const [isSaving, setIsSaving] = useState(false);
  const user = useSessionStore((s) => s.user);

  const handleToggleRecord = () => {
    if (isRecording) stop();
    else start();
  };

  const handleFinish = async () => {
    if (!user || elapsedMs === 0) return;
    setIsSaving(true);
    const song = await dataService.createSong({ title: 'New Vocal', key: 'A minor', bpm: 84, ownerId: user.id });
    setIsSaving(false);
    navigate(`/mix/${song.id}`);
  };

  return (
    <div className="mx-auto w-full max-w-2xl px-6 py-4 md:px-10">
      <TopBar title="New Vocal" showBack />

      <div className="rounded-card border border-white/[0.06] bg-white/[0.03] p-8">
        <div className="mb-6 flex items-center justify-between">
          <Pill tone={isRecording ? 'mint' : 'neutral'}>{isRecording ? 'Recording…' : 'Ready when you are'}</Pill>
          <span className="text-xs text-white/40">A minor · 84 BPM</span>
        </div>

        <div className="mb-6 text-center text-[40px] font-bold tabular-nums tracking-tight">
          {formatTime(elapsedMs)}
        </div>

        <div className="mb-6">
          <Waveform samples={waveform} colorClassName="bg-gold-400" heightClassName="h-20" barWidth={3} gap={3} />
        </div>

        <LevelMeter level={inputLevel} />

        <div className="mt-8 flex items-center justify-center gap-8">
          <button
            aria-label="Play back"
            disabled={isRecording || elapsedMs === 0}
            className="focus-ring flex h-11 w-11 items-center justify-center rounded-full text-white/60 transition hover:bg-white/[0.06] disabled:opacity-30"
          >
            <Play size={18} />
          </button>

          <button
            aria-label={isRecording ? 'Stop recording' : 'Start recording'}
            onClick={handleToggleRecord}
            className={`focus-ring flex h-16 w-16 items-center justify-center rounded-full shadow-glow transition active:scale-95 ${
              isRecording ? 'bg-red-500' : 'bg-mint-500'
            }`}
          >
            {isRecording ? <Square size={22} className="text-white" fill="currentColor" /> : <Mic size={26} className="text-ink-950" />}
          </button>

          <button
            aria-label="More options"
            className="focus-ring flex h-11 w-11 items-center justify-center rounded-full text-white/60 transition hover:bg-white/[0.06]"
          >
            <MoreHorizontal size={18} />
          </button>
        </div>

        <p className="mt-6 text-center text-[13px] text-white/35">
          {isRecording ? 'Tap stop when you\u2019re happy with the take' : 'Tap the green button and sing naturally'}
        </p>
      </div>

      {elapsedMs > 0 && !isRecording && (
        <button
          onClick={handleFinish}
          disabled={isSaving}
          className="focus-ring mt-4 w-full rounded-card bg-mint-500 py-3.5 text-[15px] font-semibold text-ink-950 transition active:scale-[0.98] disabled:opacity-60"
        >
          {isSaving ? 'Saving\u2026' : 'Use this take \u2192 Mix'}
        </button>
      )}
    </div>
  );
}

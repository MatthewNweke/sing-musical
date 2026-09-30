import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MoreHorizontal, Play, Pause, Trash2, Globe, Lock } from 'lucide-react';
import { TopBar } from '@/components/ui/TopBar';
import { Pill } from '@/components/ui/Pill';
import { Waveform } from '@/components/ui/Waveform';
import { MixerSlider } from '@/components/ui/MixerSlider';
import { Card } from '@/components/ui/Card';
import { useMixerStore } from '@/state/mixerStore';
import { dataService } from '@/services';
import { useToast } from '@/components/ui/toastContext';
import type { MixTrack } from '@/lib/types';

const MIX_QUALITY_COPY: Record<string, { label: string; headline: string }> = {
  balanced: { label: 'Mix sounding balanced', headline: 'Everything in its right place.' },
  needs_work: { label: 'Needs a little work', headline: 'A few levels are fighting each other.' },
  clipping: { label: 'Watch your levels', headline: 'Something in here is peaking.' },
};

const TRACK_COLOR_HEX: Record<MixTrack['color'], string> = {
  mint: '#5fe3ac',
  gold: '#e8c563',
  harmonyHigh: '#e28b7a',
  harmonyLow: '#8b8cf0',
};

const TRACK_WAVEFORM_CLASS: Record<MixTrack['color'], string> = {
  mint: 'bg-mint-400',
  gold: 'bg-gold-400',
  harmonyHigh: 'bg-harmonyHigh',
  harmonyLow: 'bg-harmonyLow',
};

function TrackStrip({ track }: { track: MixTrack }) {
  const { setVolume, setPan, toggleMute, toggleSolo } = useMixerStore();
  const color = TRACK_COLOR_HEX[track.color];

  return (
    <Card className="p-4">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <p className="text-[14px] font-semibold text-white">{track.label}</p>
          <p className="text-[12px] text-white/40">{track.sublabel}</p>
        </div>
        <div className="flex gap-1.5">
          <button
            onClick={() => toggleMute(track.id)}
            className={`focus-ring h-7 w-7 rounded-lg text-[11px] font-bold transition ${track.muted ? 'bg-white text-ink-950' : 'bg-white/[0.06] text-white/50'
              }`}
            aria-pressed={track.muted}
            aria-label={`Mute ${track.label}`}
          >
            M
          </button>
          <button
            onClick={() => toggleSolo(track.id)}
            className={`focus-ring h-7 w-7 rounded-lg text-[11px] font-bold transition ${track.soloed ? 'bg-mint-400 text-ink-950' : 'bg-white/[0.06] text-white/50'
              }`}
            aria-pressed={track.soloed}
            aria-label={`Solo ${track.label}`}
          >
            S
          </button>
        </div>
      </div>

      <div className="mb-3">
        <Waveform
          samples={track.waveform}
          colorClassName={TRACK_WAVEFORM_CLASS[track.color]}
          heightClassName="h-10"
          barWidth={2.5}
          gap={2}
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <MixerSlider label="Vol" value={track.volume} min={0} max={100} accentColor={color} onChange={(v) => setVolume(track.id, v)} />
          <span className="w-6 text-right text-[11px] tabular-nums text-white/40">{track.volume}</span>
        </div>
        <div className="flex items-center gap-3">
          <MixerSlider label="L" value={track.pan} min={-50} max={50} accentColor={color} onChange={(v) => setPan(track.id, v)} />
          <span className="w-6 text-right text-[11px] text-white/40">R</span>
        </div>
      </div>
    </Card>
  );
}

export function MixScreen() {
  const { songId } = useParams<{ songId: string }>();
  const navigate = useNavigate();
  const { song, isLoading, loadSong } = useMixerStore();
  const { toast } = useToast();
  const [isPlaying, setIsPlaying] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isTogglingPublic, setIsTogglingPublic] = useState(false);

  useEffect(() => {
    if (songId) void loadSong(songId);
  }, [songId, loadSong]);

  const handlePlayPause = () => {
    // Visual-only toggle — real audio playback requires stored audio blobs
    setIsPlaying((p) => !p);
    toast('Audio playback requires recorded audio files.', 'info');
  };

  const handleDelete = async () => {
    if (!song) return;
    if (!confirm(`Delete "${song.title}"? This cannot be undone.`)) return;
    setIsDeleting(true);
    try {
      await dataService.deleteSong(song.id);
      toast('Song deleted.', 'success');
      navigate('/library');
    } catch {
      toast('Could not delete. Try again.', 'error');
      setIsDeleting(false);
    }
  };

  const handleTogglePublic = async () => {
    if (!song) return;
    setIsTogglingPublic(true);
    setShowMenu(false);
    try {
      await dataService.updateSongVisibility(song.id, !song.isPublic);
      await loadSong(song.id);
      toast(song.isPublic ? 'Song set to private.' : 'Song is now public!', 'success');
    } catch {
      toast('Could not update visibility.', 'error');
    } finally {
      setIsTogglingPublic(false);
    }
  };

  if (isLoading || !song) {
    return (
      <div className="mx-auto w-full max-w-6xl px-6 md:px-10">
        <TopBar title="The Mix" showBack />
        <div className="animate-pulse rounded-card border border-white/[0.06] bg-white/[0.03] p-6 text-center text-white/30">
          Loading the mix…
        </div>
      </div>
    );
  }

  const quality = MIX_QUALITY_COPY[song.mixQuality] ?? MIX_QUALITY_COPY.needs_work;
  const minutes = Math.floor(song.durationSeconds / 60);
  const seconds = song.durationSeconds % 60;

  return (
    <div className="mx-auto w-full max-w-6xl px-6 pb-10 md:px-10">
      <TopBar title={song.title} showBack />

      <div className="grid gap-6 lg:grid-cols-[380px_1fr] lg:items-start">
        <Card className="p-6 lg:sticky lg:top-8">
          <div className="mb-3 flex items-center justify-between">
            <Pill tone="mint">{quality.label}</Pill>
            <div className="flex items-center gap-2">
              <button
                aria-label={isPlaying ? 'Pause mix' : 'Play mix'}
                onClick={handlePlayPause}
                className="focus-ring flex h-9 w-9 items-center justify-center rounded-full bg-white/[0.08] text-white transition hover:bg-white/[0.14]"
              >
                {isPlaying ? <Pause size={16} /> : <Play size={16} />}
              </button>
              <div className="relative">
                <button
                  aria-label="More options"
                  onClick={() => setShowMenu((v) => !v)}
                  className="focus-ring flex h-9 w-9 items-center justify-center rounded-full bg-white/[0.08] text-white transition hover:bg-white/[0.14]"
                >
                  <MoreHorizontal size={16} />
                </button>
                {showMenu && (
                  <div className="absolute right-0 top-10 z-10 w-48 overflow-hidden rounded-2xl border border-white/[0.08] bg-ink-800 shadow-xl">
                    <button
                      onClick={handleTogglePublic}
                      disabled={isTogglingPublic}
                      className="flex w-full items-center gap-2.5 px-4 py-3 text-[13px] text-white/80 transition hover:bg-white/[0.06] disabled:opacity-50"
                    >
                      {song.isPublic ? <Lock size={14} /> : <Globe size={14} />}
                      {song.isPublic ? 'Make private' : 'Make public'}
                    </button>
                    <button
                      onClick={handleDelete}
                      disabled={isDeleting}
                      className="flex w-full items-center gap-2.5 px-4 py-3 text-[13px] text-red-400 transition hover:bg-white/[0.06] disabled:opacity-50"
                    >
                      <Trash2 size={14} />
                      Delete song
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
          <h2 className="mb-4 text-[22px] font-bold leading-snug">{quality.headline}</h2>
          <Waveform samples={song.masterWaveform} colorClassName="bg-mint-400" heightClassName="h-14" barWidth={2.5} gap={2} />
          <div className="mt-2 flex items-center justify-between text-[11px] text-white/40">
            <span>{String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}</span>
            <span>MASTER {song.masterLevelDb.toFixed(1)} dB</span>
          </div>
          <div className="mt-3 flex items-center justify-between">
            <Pill tone={song.isPublic ? 'mint' : 'neutral'}>
              {song.isPublic ? <><Globe size={10} /> Public</> : <><Lock size={10} /> Private</>}
            </Pill>
            {song.plays > 0 && (
              <span className="text-[11px] text-white/35">{song.plays} plays</span>
            )}
          </div>
        </Card>

        <div>
          <div className="mb-3 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-white/35">
                {song.tracks.length} TRACK{song.tracks.length === 1 ? '' : 'S'}
              </p>
              <p className="text-[16px] font-semibold text-white">Shape the balance</p>
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            {song.tracks.map((track) => (
              <TrackStrip key={track.id} track={track} />
            ))}
          </div>
        </div>
      </div>

      {/* Dismiss menu on outside click */}
      {showMenu && (
        <div className="fixed inset-0 z-[5]" onClick={() => setShowMenu(false)} aria-hidden="true" />
      )}
    </div>
  );
}

import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Download, Play, Pause, Share2, Loader2 } from 'lucide-react';
import { TopBar } from '@/components/ui/TopBar';
import { Card } from '@/components/ui/Card';
import { Waveform } from '@/components/ui/Waveform';
import { Pill } from '@/components/ui/Pill';
import { useAudioPlayer } from '@/hooks/useAudioPlayer';
import { dataService } from '@/services';
import { useToast } from '@/components/ui/toastContext';
import type { Song } from '@/lib/types';

function makeWaveform(n: number): number[] {
    return Array.from({ length: n }, (_, i) => {
        const t = i / n;
        return Math.min(1, 0.3 + 0.4 * Math.abs(Math.sin(t * 12)) + 0.2 * Math.abs(Math.sin(t * 30)));
    });
}

export function ExportScreen() {
    const { songId } = useParams<{ songId: string }>();
    const navigate = useNavigate();
    const player = useAudioPlayer();
    const { toast } = useToast();
    const [song, setSong] = useState<Song | null>(null);
    const [isLoadingAudio, setIsLoadingAudio] = useState(false);
    const [format, setFormat] = useState<'mp3' | 'wav'>('mp3');

    useEffect(() => {
        if (!songId) return;
        void dataService.getSong(songId).then((s) => {
            setSong(s);
            if (!s) return;
            const track = s.tracks.find((t) => t.storagePath);
            if (!track?.storagePath) return;
            setIsLoadingAudio(true);
            dataService
                .getAudioUrl(track.storagePath)
                .then((url) => player.load(url))
                .catch(() => { })
                .finally(() => setIsLoadingAudio(false));
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [songId]);

    const handleDownload = async () => {
        const track = song?.tracks.find((t) => t.storagePath);
        if (!track?.storagePath) {
            toast('No audio file to download.', 'info');
            return;
        }
        try {
            const url = await dataService.getAudioUrl(track.storagePath);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${song?.title ?? 'recording'}.${format}`;
            a.target = '_blank';
            a.rel = 'noopener noreferrer';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            toast('Download started!', 'success');
        } catch {
            toast('Could not prepare download.', 'error');
        }
    };

    const handleShare = async () => {
        if (!song) return;
        if (navigator.share) {
            await navigator.share({ title: song.title, url: window.location.href });
        } else {
            await navigator.clipboard.writeText(window.location.href);
            toast('Link copied to clipboard!', 'success');
        }
    };

    const waveform = song?.masterWaveform.length ? song.masterWaveform : makeWaveform(48);

    return (
        <div className="mx-auto w-full max-w-2xl px-6 py-4 md:px-10">
            <TopBar title="Export" showBack />

            {!song ? (
                <div className="flex justify-center py-20">
                    <Loader2 size={24} className="animate-spin text-white/30" />
                </div>
            ) : (
                <>
                    <Card className="mb-6 p-6">
                        <p className="mb-1 text-[18px] font-bold text-white">{song.title}</p>
                        <p className="mb-4 text-[13px] text-white/40">
                            {song.key} · {song.bpm} BPM · {song.tracks.length} track{song.tracks.length !== 1 ? 's' : ''}
                        </p>

                        <Waveform samples={waveform} colorClassName="bg-mint-400" heightClassName="h-16" barWidth={2.5} gap={2} />

                        {player.duration > 0 && (
                            <div className="mt-3">
                                <input
                                    type="range"
                                    min={0}
                                    max={player.duration}
                                    step={0.1}
                                    value={player.currentTime}
                                    onChange={(e) => player.seek(Number(e.target.value))}
                                    className="w-full cursor-pointer"
                                    style={{ accentColor: '#5fe3ac' }}
                                    aria-label="Seek"
                                />
                                <div className="flex justify-between text-[11px] text-white/40">
                                    <span>{fmt(player.currentTime)}</span>
                                    <span>{fmt(player.duration)}</span>
                                </div>
                            </div>
                        )}

                        <div className="mt-4 flex justify-center">
                            <button
                                onClick={player.toggle}
                                disabled={isLoadingAudio || !song.tracks.some((t) => t.storagePath) || (!player.isReady && !player.isPlaying)}
                                className="focus-ring flex h-12 w-12 items-center justify-center rounded-full bg-mint-500 text-ink-950 shadow-glow transition active:scale-95 disabled:opacity-40"
                                aria-label={player.isPlaying ? 'Pause' : 'Play'}
                            >
                                {isLoadingAudio || (!player.isReady && song.tracks.some((t) => t.storagePath))
                                    ? <Loader2 size={18} className="animate-spin" />
                                    : player.isPlaying
                                        ? <Pause size={18} />
                                        : <Play size={18} />}
                            </button>
                        </div>
                    </Card>

                    {/* Format selector */}
                    <div className="mb-4">
                        <p className="mb-2 text-[13px] font-semibold text-white/50">Export format</p>
                        <div className="flex gap-2">
                            {(['mp3', 'wav'] as const).map((f) => (
                                <button
                                    key={f}
                                    onClick={() => setFormat(f)}
                                    className={`focus-ring flex-1 rounded-xl border py-2.5 text-[13px] font-semibold uppercase transition ${format === f
                                        ? 'border-mint-400 bg-mint-500/15 text-mint-300'
                                        : 'border-white/[0.08] text-white/50 hover:border-white/20'
                                        }`}
                                >
                                    {f}
                                </button>
                            ))}
                        </div>
                        {format === 'wav' && (
                            <p className="mt-1.5 text-[11px] text-white/35">
                                WAV is uncompressed — larger file, better quality.
                            </p>
                        )}
                    </div>

                    {/* Visibility */}
                    <div className="mb-6 flex items-center justify-between">
                        <span className="text-[13px] text-white/50">Visibility</span>
                        <Pill tone={song.isPublic ? 'mint' : 'neutral'}>
                            {song.isPublic ? 'Public' : 'Private'}
                        </Pill>
                    </div>

                    <div className="flex gap-3">
                        <button
                            onClick={handleShare}
                            className="focus-ring flex items-center gap-2 rounded-card border border-white/[0.1] px-5 py-3 text-[14px] font-semibold text-white/70 transition hover:bg-white/[0.04]"
                        >
                            <Share2 size={16} /> Share
                        </button>
                        <button
                            onClick={handleDownload}
                            className="focus-ring flex flex-1 items-center justify-center gap-2 rounded-card bg-mint-500 py-3 text-[15px] font-semibold text-ink-950 transition active:scale-[0.98]"
                        >
                            <Download size={16} /> Download {format.toUpperCase()}
                        </button>
                    </div>

                    <button
                        onClick={() => navigate(`/mix/${songId}`)}
                        className="mt-3 w-full text-center text-[13px] text-white/35 hover:text-white/60"
                    >
                        Back to Mix
                    </button>
                </>
            )}
        </div>
    );
}

function fmt(s: number): string {
    const m = Math.floor(s / 60);
    return `${String(m).padStart(2, '0')}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
}

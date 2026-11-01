import { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Mic, Square, Play, Music2, Loader2, ChevronRight } from 'lucide-react';
import { TopBar } from '@/components/ui/TopBar';
import { Card } from '@/components/ui/Card';
import { Pill } from '@/components/ui/Pill';
import { Waveform } from '@/components/ui/Waveform';
import { useMetronome } from '@/hooks/useMetronome';
import { useStepSequencer } from '@/hooks/useStepSequencer';
import { useRecorder } from '@/hooks/useRecorder';
import { GENRE_MAP, generateArrangement } from '@/lib/genres';
import type { GenreId, Arrangement } from '@/lib/types';

// ── Path A: Metronome/Genre-Lock ─────────────────────────────────────────────

function PathA({ genreId }: { genreId: GenreId }) {
    const genre = GENRE_MAP.get(genreId)!;
    const metronome = useMetronome();
    const sequencer = useStepSequencer();
    const [arrangement] = useState<Arrangement>(() =>
        generateArrangement(genreId, genre.defaultBpm, genre.defaultKey)
    );
    const [phase, setPhase] = useState<'idle' | 'countin' | 'playing'>('idle');

    const handleStart = () => {
        setPhase('countin');
        metronome.start(arrangement.bpm, () => {
            setPhase('playing');
            sequencer.start(arrangement.bpm, arrangement.instruments);
        });
    };

    const handleStop = () => {
        metronome.stop();
        sequencer.stop();
        setPhase('idle');
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-[16px] font-bold text-white">{genre.emoji} {genre.label}</p>
                    <p className="text-[13px] text-white/40">{arrangement.bpm} BPM · {arrangement.key}</p>
                </div>
                <Pill tone="mint">Path A — Locked tempo</Pill>
            </div>

            {/* Beat indicator */}
            <div className="flex justify-center gap-3 py-4">
                {[0, 1, 2, 3].map((b) => (
                    <div
                        key={b}
                        className={`h-5 w-5 rounded-full transition-all duration-75 ${phase === 'countin' && metronome.countIn > 0
                                ? metronome.beat === b ? 'bg-gold-400 scale-125' : 'bg-white/10'
                                : phase === 'playing' && metronome.beat === b
                                    ? 'bg-mint-400 scale-125'
                                    : 'bg-white/10'
                            }`}
                    />
                ))}
            </div>

            {phase === 'countin' && (
                <p className="text-center text-[20px] font-bold text-gold-400">
                    {metronome.countIn > 0 ? metronome.countIn : 'Go!'}
                </p>
            )}

            {/* Step playhead */}
            {phase === 'playing' && (
                <div className="flex gap-0.5">
                    {Array.from({ length: 16 }, (_, i) => (
                        <div
                            key={i}
                            className={`h-2 flex-1 rounded-sm transition ${sequencer.currentStep === i ? 'bg-mint-400' : 'bg-white/10'
                                }`}
                        />
                    ))}
                </div>
            )}

            {/* Instrument list */}
            <div className="space-y-1.5">
                {arrangement.instruments.map((inst) => (
                    <div key={inst.id} className="flex items-center gap-2 text-[12px] text-white/60">
                        <span>{inst.emoji}</span>
                        <span>{inst.name}</span>
                        <div className="ml-auto flex gap-0.5">
                            {inst.pattern.map((on, i) => (
                                <div
                                    key={i}
                                    className="h-1.5 w-1.5 rounded-sm"
                                    style={{ backgroundColor: on ? inst.color : 'rgba(255,255,255,0.08)' }}
                                />
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            <button
                onClick={phase === 'idle' ? handleStart : handleStop}
                className={`focus-ring w-full rounded-card py-3.5 text-[15px] font-semibold transition active:scale-[0.98] ${phase === 'idle' ? 'bg-mint-500 text-ink-950' : 'bg-red-500 text-white'
                    }`}
            >
                {phase === 'idle' ? 'Start with count-in' : 'Stop'}
            </button>
        </div>
    );
}

// ── Path B: Free-Sing / Listen-and-Suggest ───────────────────────────────────

function PathB() {
    const recorder = useRecorder();
    const [phase, setPhase] = useState<'idle' | 'listening' | 'analyzing' | 'done'>('idle');
    const [detectedBpm, setDetectedBpm] = useState<number | null>(null);
    const [detectedKey, setDetectedKey] = useState<string | null>(null);
    const [arrangement, setArrangement] = useState<Arrangement | null>(null);
    const sequencer = useStepSequencer();
    const listenTimer = useRef<number | null>(null);

    const KEYS = ['C major', 'D major', 'E minor', 'G major', 'A minor', 'F major', 'Bb major'];
    const GENRES_FOR_DETECT: GenreId[] = ['pop', 'rnb', 'afrobeats', 'gospel', 'hiphop'];

    const handleStartListening = async () => {
        setPhase('listening');
        await recorder.start();
        // Listen for 15 seconds then analyze
        listenTimer.current = window.setTimeout(async () => {
            recorder.stop();
            setPhase('analyzing');
            // Simulate tempo/key detection (1.5s)
            await new Promise((r) => setTimeout(r, 1500));
            const bpm = [80, 90, 96, 102, 108, 120][Math.floor(Math.random() * 6)];
            const key = KEYS[Math.floor(Math.random() * KEYS.length)];
            const genreId = GENRES_FOR_DETECT[Math.floor(Math.random() * GENRES_FOR_DETECT.length)];
            setDetectedBpm(bpm);
            setDetectedKey(key);
            setArrangement(generateArrangement(genreId, bpm, key));
            setPhase('done');
        }, 15000);
    };

    const handleStopEarly = () => {
        if (listenTimer.current) clearTimeout(listenTimer.current);
        recorder.stop();
        setPhase('analyzing');
        setTimeout(() => {
            const bpm = [80, 90, 96, 102, 120][Math.floor(Math.random() * 5)];
            const key = KEYS[Math.floor(Math.random() * KEYS.length)];
            setDetectedBpm(bpm);
            setDetectedKey(key);
            setArrangement(generateArrangement('pop', bpm, key));
            setPhase('done');
        }, 1200);
    };

    const handlePlaySuggestion = () => {
        if (!arrangement) return;
        if (sequencer.isPlaying) sequencer.stop();
        else sequencer.start(arrangement.bpm, arrangement.instruments);
    };

    const handleReset = () => {
        sequencer.stop();
        recorder.reset();
        setPhase('idle');
        setArrangement(null);
    };

    useEffect(() => () => {
        if (listenTimer.current) clearTimeout(listenTimer.current);
    }, []);

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <p className="text-[15px] font-semibold text-white">Free Sing</p>
                <Pill tone="gold">Path B — Listen & Suggest</Pill>
            </div>

            {phase === 'idle' && (
                <>
                    <p className="text-[13px] text-white/50">
                        Sing freely for up to 15 seconds. The app will listen, detect your tempo and key, then suggest an instrument arrangement.
                    </p>
                    <Waveform
                        samples={Array(40).fill(0.08)}
                        colorClassName="bg-white/20"
                        heightClassName="h-16"
                        barWidth={3}
                        gap={2}
                    />
                    <button
                        onClick={handleStartListening}
                        disabled={recorder.permissionDenied}
                        className="focus-ring w-full rounded-card bg-gold-400 py-3.5 text-[15px] font-semibold text-ink-950 transition active:scale-[0.98] disabled:opacity-40"
                    >
                        <Mic size={16} className="mr-2 inline" /> Start listening
                    </button>
                </>
            )}

            {phase === 'listening' && (
                <>
                    <Waveform
                        samples={recorder.waveform}
                        colorClassName="bg-gold-400"
                        heightClassName="h-16"
                        barWidth={3}
                        gap={2}
                    />
                    <p className="text-center text-[13px] text-white/50">Listening… sing naturally</p>
                    <button
                        onClick={handleStopEarly}
                        className="focus-ring w-full rounded-card bg-red-500 py-3 text-[14px] font-semibold text-white"
                    >
                        <Square size={14} className="mr-2 inline" fill="currentColor" /> Done singing
                    </button>
                </>
            )}

            {phase === 'analyzing' && (
                <div className="flex flex-col items-center gap-3 py-8">
                    <Loader2 size={28} className="animate-spin text-gold-400" />
                    <p className="text-[13px] text-white/50">Detecting tempo and key…</p>
                </div>
            )}

            {phase === 'done' && arrangement && (
                <>
                    <Card className="p-4">
                        <p className="mb-2 text-[13px] font-semibold text-white/60 uppercase tracking-wide">Detected</p>
                        <div className="flex gap-4">
                            <div className="text-center">
                                <p className="text-[22px] font-bold text-gold-400">{detectedBpm}</p>
                                <p className="text-[11px] text-white/40">BPM</p>
                            </div>
                            <div className="text-center">
                                <p className="text-[22px] font-bold text-mint-400">{detectedKey}</p>
                                <p className="text-[11px] text-white/40">Key</p>
                            </div>
                        </div>
                    </Card>

                    <div className="space-y-1.5">
                        {arrangement.instruments.map((inst) => (
                            <div key={inst.id} className="flex items-center gap-2 text-[12px] text-white/60">
                                <span>{inst.emoji}</span><span>{inst.name}</span>
                                <div className="ml-auto flex gap-0.5">
                                    {inst.pattern.map((on, i) => (
                                        <div key={i} className="h-1.5 w-1.5 rounded-sm"
                                            style={{ backgroundColor: on ? inst.color : 'rgba(255,255,255,0.08)' }} />
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="flex gap-3">
                        <button
                            onClick={handlePlaySuggestion}
                            className={`focus-ring flex-1 rounded-card py-3 text-[14px] font-semibold transition ${sequencer.isPlaying ? 'bg-red-500 text-white' : 'bg-mint-500 text-ink-950'
                                }`}
                        >
                            {sequencer.isPlaying ? <><Square size={14} className="mr-1 inline" fill="currentColor" />Stop</> : <><Play size={14} className="mr-1 inline" />Play suggestion</>}
                        </button>
                        <button
                            onClick={handleReset}
                            className="focus-ring rounded-card border border-white/[0.1] px-5 py-3 text-[14px] font-semibold text-white/60"
                        >
                            Reset
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}

// ── Main LiveModeScreen ───────────────────────────────────────────────────────

export function LiveModeScreen() {
    const navigate = useNavigate();
    const [params] = useSearchParams();
    const genreId = (params.get('genre') ?? 'pop') as GenreId;
    const [path, setPath] = useState<'A' | 'B' | null>(null);

    if (!path) {
        return (
            <div className="mx-auto w-full max-w-2xl px-6 py-4 md:px-10">
                <TopBar title="Live Mode" showBack />
                <p className="mb-6 text-[14px] text-white/50">How do you want to perform?</p>

                <div className="space-y-4">
                    <button
                        onClick={() => setPath('A')}
                        className="focus-ring group flex w-full items-center gap-4 rounded-card border border-white/[0.06] bg-mint-500/10 p-5 text-left transition hover:border-mint-500/30 active:scale-[0.98]"
                    >
                        <Music2 size={24} className="shrink-0 text-mint-400" />
                        <div className="flex-1">
                            <p className="text-[15px] font-bold text-white">Metronome / Genre-Lock</p>
                            <p className="text-[13px] text-white/50">Pick a genre, get a count-in, sing along to a locked tempo with instrument backing</p>
                        </div>
                        <ChevronRight size={18} className="text-white/30 transition group-hover:text-white/60" />
                    </button>

                    <button
                        onClick={() => setPath('B')}
                        className="focus-ring group flex w-full items-center gap-4 rounded-card border border-white/[0.06] bg-gold-400/10 p-5 text-left transition hover:border-gold-400/30 active:scale-[0.98]"
                    >
                        <Mic size={24} className="shrink-0 text-gold-400" />
                        <div className="flex-1">
                            <p className="text-[15px] font-bold text-white">Free Sing</p>
                            <p className="text-[13px] text-white/50">Sing freely — the app listens for ~15 seconds, detects your tempo and key, then suggests instruments</p>
                        </div>
                        <ChevronRight size={18} className="text-white/30 transition group-hover:text-white/60" />
                    </button>

                    <button
                        onClick={() => navigate('/genre-picker?from=live')}
                        className="w-full text-center text-[13px] text-white/35 hover:text-white/60"
                    >
                        Change genre ({GENRE_MAP.get(genreId)?.emoji} {GENRE_MAP.get(genreId)?.label})
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="mx-auto w-full max-w-2xl px-6 py-4 md:px-10">
            <TopBar title={path === 'A' ? 'Live — Metronome' : 'Live — Free Sing'} showBack onBack={() => setPath(null)} />
            {path === 'A' ? <PathA genreId={genreId} /> : <PathB />}
        </div>
    );
}

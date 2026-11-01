import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Play, Square, Volume2, VolumeX } from 'lucide-react';
import { TopBar } from '@/components/ui/TopBar';
import { Card } from '@/components/ui/Card';
import { useStepSequencer } from '@/hooks/useStepSequencer';
import type { Arrangement, InstrumentTrack, GenreId } from '@/lib/types';
import { GENRE_MAP } from '@/lib/genres';

const STEPS = 16;

export function InstrumentEditorScreen() {
    const navigate = useNavigate();
    const [params] = useSearchParams();
    const genreId = (params.get('genre') ?? 'pop') as GenreId;
    const songId = params.get('songId') ?? '';
    const arrParam = params.get('arr');

    const genre = GENRE_MAP.get(genreId);
    const [instruments, setInstruments] = useState<InstrumentTrack[]>([]);
    const [bpm, setBpm] = useState(120);
    const { isPlaying, currentStep, start, stop, updateInstruments } = useStepSequencer();

    useEffect(() => {
        if (arrParam) {
            try {
                const arr = JSON.parse(decodeURIComponent(arrParam)) as Arrangement;
                setInstruments(arr.instruments);
                setBpm(arr.bpm);
            } catch { /* ignore */ }
        }
    }, [arrParam]);

    useEffect(() => {
        if (isPlaying) updateInstruments(instruments);
    }, [instruments, isPlaying, updateInstruments]);

    const toggleStep = (instId: string, step: number) => {
        setInstruments((prev) =>
            prev.map((inst) =>
                inst.id === instId
                    ? { ...inst, pattern: inst.pattern.map((v, i) => (i === step ? !v : v)) }
                    : inst
            )
        );
    };

    const toggleMute = (instId: string) => {
        setInstruments((prev) =>
            prev.map((inst) => inst.id === instId ? { ...inst, muted: !inst.muted } : inst)
        );
    };

    const handlePlayStop = () => {
        if (isPlaying) stop();
        else start(bpm, instruments);
    };

    const handleDone = () => {
        stop();
        if (songId) navigate(`/mix/${songId}`);
        else navigate('/library');
    };

    return (
        <div className="mx-auto w-full max-w-3xl px-4 py-4 md:px-8">
            <TopBar title="Instrument Editor" showBack />

            {/* Transport */}
            <div className="mb-4 flex items-center gap-3">
                <button
                    onClick={handlePlayStop}
                    className={`focus-ring flex h-10 w-10 items-center justify-center rounded-full transition active:scale-95 ${isPlaying ? 'bg-red-500 text-white' : 'bg-mint-500 text-ink-950'
                        }`}
                    aria-label={isPlaying ? 'Stop' : 'Play pattern'}
                >
                    {isPlaying ? <Square size={16} fill="currentColor" /> : <Play size={16} />}
                </button>

                <div className="flex items-center gap-2">
                    <span className="text-[12px] text-white/40">BPM</span>
                    <input
                        type="number"
                        min={60}
                        max={200}
                        value={bpm}
                        onChange={(e) => setBpm(Number(e.target.value))}
                        className="w-16 rounded-lg border border-white/[0.08] bg-white/[0.03] px-2 py-1 text-[13px] text-white outline-none"
                    />
                </div>

                <div className="ml-auto flex items-center gap-1">
                    <span className="text-[12px] text-white/40">{genre?.emoji} {genre?.label}</span>
                </div>
            </div>

            {/* Step grid */}
            <div className="mb-4 space-y-2">
                {/* Step numbers */}
                <div className="flex items-center gap-1 pl-[108px]">
                    {Array.from({ length: STEPS }, (_, i) => (
                        <div
                            key={i}
                            className={`flex-1 text-center text-[9px] transition ${isPlaying && currentStep === i ? 'text-mint-400 font-bold' : 'text-white/20'
                                }`}
                        >
                            {i + 1}
                        </div>
                    ))}
                </div>

                {instruments.map((inst) => (
                    <Card key={inst.id} className={`p-2 transition ${inst.muted ? 'opacity-40' : ''}`}>
                        <div className="flex items-center gap-1">
                            {/* Label + mute */}
                            <div className="flex w-[100px] shrink-0 items-center gap-1.5 pr-2">
                                <span className="text-sm">{inst.emoji}</span>
                                <span className="flex-1 truncate text-[11px] font-medium text-white/80">{inst.name}</span>
                                <button
                                    onClick={() => toggleMute(inst.id)}
                                    className="text-white/30 hover:text-white/70"
                                    aria-label={inst.muted ? 'Unmute' : 'Mute'}
                                >
                                    {inst.muted ? <VolumeX size={12} /> : <Volume2 size={12} />}
                                </button>
                            </div>

                            {/* 16 step buttons */}
                            {inst.pattern.map((on, stepIdx) => (
                                <button
                                    key={stepIdx}
                                    onClick={() => toggleStep(inst.id, stepIdx)}
                                    className={`flex-1 rounded transition active:scale-95 ${stepIdx % 4 === 0 ? 'h-8' : 'h-6'
                                        } ${isPlaying && currentStep === stepIdx
                                            ? 'ring-1 ring-white/60'
                                            : ''
                                        }`}
                                    style={{
                                        backgroundColor: on
                                            ? inst.color
                                            : 'rgba(255,255,255,0.05)',
                                        opacity: on ? 1 : 0.6,
                                    }}
                                    aria-label={`Step ${stepIdx + 1} ${on ? 'on' : 'off'}`}
                                    aria-pressed={on}
                                />
                            ))}
                        </div>
                    </Card>
                ))}
            </div>

            <button
                onClick={handleDone}
                className="focus-ring w-full rounded-card bg-mint-500 py-3.5 text-[15px] font-semibold text-ink-950 transition active:scale-[0.98]"
            >
                Save arrangement & go to Mix →
            </button>
        </div>
    );
}

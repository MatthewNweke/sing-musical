import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Loader2, Sparkles, Music2 } from 'lucide-react';
import { TopBar } from '@/components/ui/TopBar';
import { Card } from '@/components/ui/Card';
import { Pill } from '@/components/ui/Pill';
import { GENRE_MAP, generateArrangement } from '@/lib/genres';
import type { Arrangement, GenreId } from '@/lib/types';

export function SuggestionScreen() {
    const navigate = useNavigate();
    const [params] = useSearchParams();
    const genreId = (params.get('genre') ?? 'pop') as GenreId;
    const songId = params.get('songId') ?? '';

    const [arrangement, setArrangement] = useState<Arrangement | null>(null);
    const [isGenerating, setIsGenerating] = useState(true);

    const genre = GENRE_MAP.get(genreId);

    useEffect(() => {
        // Simulate AI suggestion generation (1.5s)
        const t = setTimeout(() => {
            const arr = generateArrangement(
                genreId,
                genre?.defaultBpm ?? 120,
                genre?.defaultKey ?? 'C major',
            );
            setArrangement(arr);
            setIsGenerating(false);
        }, 1500);
        return () => clearTimeout(t);
    }, [genreId, genre]);

    const handleAccept = () => {
        if (!arrangement) return;
        navigate(`/instrument-editor?genre=${genreId}&songId=${songId}&arr=${encodeURIComponent(JSON.stringify(arrangement))}`);
    };

    const handleRegenerate = () => {
        setIsGenerating(true);
        setTimeout(() => {
            const arr = generateArrangement(genreId, genre?.defaultBpm ?? 120, genre?.defaultKey ?? 'C major');
            setArrangement(arr);
            setIsGenerating(false);
        }, 1000);
    };

    return (
        <div className="mx-auto w-full max-w-2xl px-6 py-4 md:px-10">
            <TopBar title="Suggested arrangement" showBack />

            {isGenerating ? (
                <div className="flex flex-col items-center gap-4 py-20">
                    <Loader2 size={32} className="animate-spin text-mint-400" />
                    <p className="text-[14px] text-white/50">Generating your {genre?.label} arrangement…</p>
                </div>
            ) : arrangement && (
                <>
                    <div className="mb-4 flex items-center gap-3">
                        <span className="text-2xl">{genre?.emoji}</span>
                        <div>
                            <p className="text-[16px] font-bold text-white">{genre?.label} arrangement</p>
                            <p className="text-[13px] text-white/40">{arrangement.bpm} BPM · {arrangement.key}</p>
                        </div>
                        <Pill tone="mint" className="ml-auto">
                            <Sparkles size={10} /> AI Generated
                        </Pill>
                    </div>

                    <div className="mb-6 space-y-2">
                        {arrangement.instruments.map((inst) => (
                            <Card key={inst.id} className="flex items-center gap-3 p-3">
                                <span className="text-xl">{inst.emoji}</span>
                                <div className="flex-1">
                                    <p className="text-[14px] font-semibold text-white">{inst.name}</p>
                                    <div className="mt-1 flex gap-0.5">
                                        {inst.pattern.map((on, i) => (
                                            <div
                                                key={i}
                                                className="h-2 flex-1 rounded-sm"
                                                style={{ backgroundColor: on ? inst.color : 'rgba(255,255,255,0.06)' }}
                                            />
                                        ))}
                                    </div>
                                </div>
                                <Music2 size={14} className="text-white/30" />
                            </Card>
                        ))}
                    </div>

                    <div className="flex gap-3">
                        <button
                            onClick={handleRegenerate}
                            className="focus-ring flex-1 rounded-card border border-white/[0.1] py-3 text-[14px] font-semibold text-white/70 transition hover:bg-white/[0.04]"
                        >
                            Try another
                        </button>
                        <button
                            onClick={handleAccept}
                            className="focus-ring flex-1 rounded-card bg-mint-500 py-3 text-[14px] font-semibold text-ink-950 transition active:scale-[0.98]"
                        >
                            Use this → Edit
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}

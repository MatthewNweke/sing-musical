import { useNavigate, useSearchParams } from 'react-router-dom';
import { TopBar } from '@/components/ui/TopBar';
import { GENRES } from '@/lib/genres';
import type { GenreId } from '@/lib/types';

export function GenrePickerScreen() {
    const navigate = useNavigate();
    const [params] = useSearchParams();
    const from = params.get('from') ?? 'record'; // 'record' | 'live'

    const handlePick = (genreId: GenreId) => {
        if (from === 'live') {
            navigate(`/live/mode?genre=${genreId}`);
        } else {
            navigate(`/record?genre=${genreId}`);
        }
    };

    return (
        <div className="mx-auto w-full max-w-2xl px-6 py-4 md:px-10">
            <TopBar title="Pick a genre" showBack />
            <p className="mb-6 text-[14px] text-white/50">
                Choose the sound that fits your vibe. We'll generate an instrument arrangement to match.
            </p>

            <div className="grid gap-3 sm:grid-cols-2">
                {GENRES.map((genre) => (
                    <button
                        key={genre.id}
                        onClick={() => handlePick(genre.id)}
                        className={`focus-ring flex items-center gap-4 rounded-card border border-white/[0.06] p-4 text-left transition hover:border-white/[0.14] hover:bg-white/[0.04] active:scale-[0.98] ${genre.color}`}
                    >
                        <span className="text-3xl">{genre.emoji}</span>
                        <div>
                            <p className="text-[15px] font-semibold text-white">{genre.label}</p>
                            <p className="text-[12px] text-white/50">{genre.description}</p>
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
}

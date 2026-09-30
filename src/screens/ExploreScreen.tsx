import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Music2 } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Pill } from '@/components/ui/Pill';
import { Waveform } from '@/components/ui/Waveform';
import { dataService } from '@/services';
import type { Song } from '@/lib/types';

export function ExploreScreen() {
    const navigate = useNavigate();
    const [songs, setSongs] = useState<Song[] | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        void dataService.getFeed('').then(setSongs);
    }, []);

    const filtered = songs?.filter((s) =>
        s.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="mx-auto w-full max-w-6xl px-6 py-8 md:px-10">
            <header className="mb-6">
                <h1 className="mb-1 text-[20px] font-bold">Explore</h1>
                <p className="text-[13px] text-white/40">Discover public songs from the community.</p>
            </header>

            <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search songs…"
                className="focus-ring mb-6 w-full rounded-2xl border border-white/[0.08] bg-white/[0.03] px-4 py-3 text-[14px] text-white outline-none placeholder:text-white/25"
                aria-label="Search songs"
            />

            {songs === null && (
                <p className="text-center text-white/30">Loading…</p>
            )}

            {filtered?.length === 0 && songs !== null && (
                <Card className="flex flex-col items-center gap-3 px-6 py-12 text-center">
                    <Music2 className="text-white/25" size={28} />
                    <p className="text-[15px] font-semibold text-white">Nothing to explore yet</p>
                    <p className="text-[13px] text-white/40">
                        {searchQuery ? 'No songs match that search.' : 'Be the first to share a song publicly.'}
                    </p>
                </Card>
            )}

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {filtered?.map((song) => (
                    <button
                        key={song.id}
                        onClick={() => navigate(`/mix/${song.id}`)}
                        className="focus-ring w-full text-left"
                    >
                        <Card className="p-4 transition hover:border-white/[0.12] hover:bg-white/[0.04]">
                            <div className="mb-1 flex items-start justify-between gap-2">
                                <p className="flex-1 truncate text-[15px] font-semibold text-white">{song.title}</p>
                                <Play size={14} className="mt-1 shrink-0 text-white/40" />
                            </div>
                            <p className="mb-3 text-[12px] text-white/40">{song.key} · {song.bpm} BPM</p>
                            <Waveform
                                samples={song.masterWaveform.slice(0, 24)}
                                colorClassName="bg-mint-400/60"
                                heightClassName="h-8"
                                barWidth={2}
                                gap={2}
                            />
                            <div className="mt-3 flex items-center justify-between">
                                <Pill tone="mint">Public</Pill>
                                {song.plays > 0 && (
                                    <span className="text-[11px] text-white/35">{song.plays} plays</span>
                                )}
                            </div>
                        </Card>
                    </button>
                ))}
            </div>
        </div>
    );
}

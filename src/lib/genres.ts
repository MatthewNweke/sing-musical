import type { Genre, GenreId, Arrangement, InstrumentTrack } from './types';

export const GENRES: Genre[] = [
    { id: 'pop', label: 'Pop', emoji: '🎤', defaultBpm: 120, defaultKey: 'C major', description: 'Catchy hooks, bright synths, punchy drums', color: 'bg-pink-500/20' },
    { id: 'rnb', label: 'R&B', emoji: '🎶', defaultBpm: 90, defaultKey: 'A minor', description: 'Smooth grooves, lush chords, soulful feel', color: 'bg-purple-500/20' },
    { id: 'afrobeats', label: 'Afrobeats', emoji: '🥁', defaultBpm: 102, defaultKey: 'D major', description: 'Infectious rhythm, talking drums, highlife energy', color: 'bg-gold-400/20' },
    { id: 'gospel', label: 'Gospel', emoji: '🙌', defaultBpm: 80, defaultKey: 'G major', description: 'Rich harmonies, organ, uplifting choir feel', color: 'bg-yellow-500/20' },
    { id: 'hiphop', label: 'Hip-Hop', emoji: '🎧', defaultBpm: 95, defaultKey: 'F minor', description: '808s, hi-hats, hard-hitting kick patterns', color: 'bg-red-500/20' },
    { id: 'jazz', label: 'Jazz', emoji: '🎷', defaultBpm: 140, defaultKey: 'Bb major', description: 'Walking bass, swing feel, improvised chords', color: 'bg-amber-500/20' },
    { id: 'classical', label: 'Classical', emoji: '🎻', defaultBpm: 72, defaultKey: 'D minor', description: 'Orchestral strings, piano, dynamic expression', color: 'bg-sky-500/20' },
    { id: 'rock', label: 'Rock', emoji: '🎸', defaultBpm: 130, defaultKey: 'E minor', description: 'Distorted guitar, driving bass, heavy kit', color: 'bg-orange-500/20' },
    { id: 'country', label: 'Country', emoji: '🤠', defaultBpm: 96, defaultKey: 'G major', description: 'Acoustic guitar, fiddle, twangy feel', color: 'bg-lime-500/20' },
    { id: 'electronic', label: 'Electronic', emoji: '🎛️', defaultBpm: 128, defaultKey: 'A minor', description: 'Synthesizers, four-on-the-floor, big drops', color: 'bg-cyan-500/20' },
];

export const GENRE_MAP = new Map<GenreId, Genre>(GENRES.map((g) => [g.id, g]));

// ── Arrangement generator ────────────────────────────────────────────────────
// Generates a deterministic but musically plausible 16-step pattern per genre.

type PatternDef = { name: string; emoji: string; color: string; steps: number[] };

const GENRE_PATTERNS: Record<GenreId, PatternDef[]> = {
    pop: [
        { name: 'Kick', emoji: '🥁', color: '#e8c563', steps: [0, 4, 8, 12] },
        { name: 'Snare', emoji: '🎯', color: '#5fe3ac', steps: [4, 12] },
        { name: 'Hi-Hat', emoji: '🔔', color: '#8b8cf0', steps: [0, 2, 4, 6, 8, 10, 12, 14] },
        { name: 'Synth', emoji: '🎹', color: '#e28b7a', steps: [0, 3, 6, 9, 12] },
    ],
    rnb: [
        { name: 'Kick', emoji: '🥁', color: '#e8c563', steps: [0, 6, 8, 14] },
        { name: 'Snare', emoji: '🎯', color: '#5fe3ac', steps: [4, 12] },
        { name: 'Hi-Hat', emoji: '🔔', color: '#8b8cf0', steps: [0, 2, 4, 6, 8, 10, 12, 14] },
        { name: 'Bass', emoji: '🎸', color: '#e28b7a', steps: [0, 3, 8, 11] },
        { name: 'Organ', emoji: '🎹', color: '#5fe3ac', steps: [0, 4, 8, 12] },
    ],
    afrobeats: [
        { name: 'Kick', emoji: '🥁', color: '#e8c563', steps: [0, 3, 6, 9, 12] },
        { name: 'Snare', emoji: '🎯', color: '#5fe3ac', steps: [4, 10, 14] },
        { name: 'Shaker', emoji: '🔔', color: '#8b8cf0', steps: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15] },
        { name: 'Bass', emoji: '🎸', color: '#e28b7a', steps: [0, 4, 8, 12] },
        { name: 'Talking Drum', emoji: '🪘', color: '#e8c563', steps: [2, 5, 10, 13] },
    ],
    gospel: [
        { name: 'Kick', emoji: '🥁', color: '#e8c563', steps: [0, 8] },
        { name: 'Snare', emoji: '🎯', color: '#5fe3ac', steps: [4, 12] },
        { name: 'Hi-Hat', emoji: '🔔', color: '#8b8cf0', steps: [0, 4, 8, 12] },
        { name: 'Organ', emoji: '🎹', color: '#e28b7a', steps: [0, 2, 4, 8, 10, 12] },
        { name: 'Choir Pad', emoji: '🎶', color: '#5fe3ac', steps: [0, 8] },
    ],
    hiphop: [
        { name: '808', emoji: '💣', color: '#e8c563', steps: [0, 6, 10] },
        { name: 'Snare', emoji: '🎯', color: '#5fe3ac', steps: [4, 12] },
        { name: 'Hi-Hat', emoji: '🔔', color: '#8b8cf0', steps: [0, 2, 4, 6, 8, 10, 12, 14] },
        { name: 'Open HH', emoji: '🎶', color: '#e28b7a', steps: [6, 14] },
    ],
    jazz: [
        { name: 'Kick', emoji: '🥁', color: '#e8c563', steps: [0, 8] },
        { name: 'Brush', emoji: '🎯', color: '#5fe3ac', steps: [4, 6, 12, 14] },
        { name: 'Ride', emoji: '🔔', color: '#8b8cf0', steps: [0, 2, 4, 6, 8, 10, 12, 14] },
        { name: 'Piano', emoji: '🎹', color: '#e28b7a', steps: [0, 3, 8, 11] },
        { name: 'Bass', emoji: '🎸', color: '#5fe3ac', steps: [0, 2, 4, 6, 8, 10, 12, 14] },
    ],
    classical: [
        { name: 'Strings', emoji: '🎻', color: '#e8c563', steps: [0, 4, 8, 12] },
        { name: 'Cello', emoji: '🎶', color: '#5fe3ac', steps: [0, 8] },
        { name: 'Piano', emoji: '🎹', color: '#8b8cf0', steps: [0, 2, 4, 6, 8, 10, 12, 14] },
        { name: 'Flute', emoji: '🪈', color: '#e28b7a', steps: [2, 6, 10, 14] },
    ],
    rock: [
        { name: 'Kick', emoji: '🥁', color: '#e8c563', steps: [0, 4, 8, 12] },
        { name: 'Snare', emoji: '🎯', color: '#5fe3ac', steps: [4, 12] },
        { name: 'Hi-Hat', emoji: '🔔', color: '#8b8cf0', steps: [0, 2, 4, 6, 8, 10, 12, 14] },
        { name: 'Guitar', emoji: '🎸', color: '#e28b7a', steps: [0, 4, 8, 12] },
        { name: 'Bass', emoji: '🎸', color: '#e8c563', steps: [0, 3, 8, 11] },
    ],
    country: [
        { name: 'Kick', emoji: '🥁', color: '#e8c563', steps: [0, 8] },
        { name: 'Snare', emoji: '🎯', color: '#5fe3ac', steps: [4, 12] },
        { name: 'Hi-Hat', emoji: '🔔', color: '#8b8cf0', steps: [0, 4, 8, 12] },
        { name: 'Acoustic', emoji: '🪕', color: '#e28b7a', steps: [0, 2, 4, 6, 8, 10, 12, 14] },
        { name: 'Fiddle', emoji: '🎻', color: '#5fe3ac', steps: [0, 4, 8, 12] },
    ],
    electronic: [
        { name: 'Kick', emoji: '🥁', color: '#e8c563', steps: [0, 4, 8, 12] },
        { name: 'Clap', emoji: '👏', color: '#5fe3ac', steps: [4, 12] },
        { name: 'Hi-Hat', emoji: '🔔', color: '#8b8cf0', steps: [0, 2, 4, 6, 8, 10, 12, 14] },
        { name: 'Synth', emoji: '🎛️', color: '#e28b7a', steps: [0, 3, 6, 9, 12] },
        { name: 'Pad', emoji: '🎹', color: '#5fe3ac', steps: [0, 8] },
    ],
};

export function generateArrangement(genreId: GenreId, bpm: number, key: string): Arrangement {
    const defs = GENRE_PATTERNS[genreId] ?? GENRE_PATTERNS.pop;
    const instruments: InstrumentTrack[] = defs.map((def, i) => {
        const pattern = Array<boolean>(16).fill(false);
        def.steps.forEach((s) => { pattern[s] = true; });
        return {
            id: `inst-${i}`,
            name: def.name,
            emoji: def.emoji,
            color: def.color,
            pattern,
            volume: 75,
            muted: false,
        };
    });

    return {
        id: `arr-${Date.now()}`,
        genre: genreId,
        bpm,
        key,
        instruments,
        suggestedAt: new Date().toISOString(),
    };
}

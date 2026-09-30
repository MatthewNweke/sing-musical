import type { Song, UserProfile, LiveSession } from '@/lib/types';

// Deterministic fake waveform generator so screens have believable-looking
// audio data without recording anything real yet.
function fakeWaveform(length: number, seed: number): number[] {
  const out: number[] = [];
  for (let i = 0; i < length; i++) {
    const t = i / length;
    const v =
      0.35 +
      0.3 * Math.abs(Math.sin(t * 14 + seed)) +
      0.2 * Math.abs(Math.sin(t * 37 + seed * 2)) +
      0.05 * Math.random();
    out.push(Math.min(1, v));
  }
  return out;
}

export const mockUser: UserProfile = {
  id: 'user-mattt',
  displayName: 'Mattt',
  handle: '@mattt',
  avatarUrl: null,
  bio: 'Building tracks between NOC shifts.',
  followerCount: 128,
  followingCount: 54,
  createdAt: '2025-11-02T10:00:00.000Z',
};

export const mockSongs: Song[] = [
  {
    id: 'song-1',
    title: 'Golden Hour',
    key: 'A minor',
    bpm: 84,
    durationSeconds: 43,
    createdAt: '2026-09-20T06:24:00.000Z',
    coverColor: 'mint',
    masterWaveform: fakeWaveform(48, 1),
    masterLevelDb: -2.4,
    mixQuality: 'balanced',
    ownerId: mockUser.id,
    isPublic: true,
    plays: 342,
    tracks: [
      {
        id: 'track-lead',
        role: 'lead_vocal',
        label: 'Lead vocal',
        sublabel: 'Your take',
        color: 'gold',
        volume: 82,
        pan: -6,
        muted: false,
        soloed: false,
        waveform: fakeWaveform(28, 2),
      },
      {
        id: 'track-high',
        role: 'high_harmony',
        label: 'High harmony',
        sublabel: 'Backup vocal',
        color: 'harmonyHigh',
        volume: 52,
        pan: -12,
        muted: false,
        soloed: false,
        waveform: fakeWaveform(28, 3),
      },
      {
        id: 'track-low',
        role: 'low_harmony',
        label: 'Low harmony',
        sublabel: 'Backup vocal',
        color: 'harmonyLow',
        volume: 47,
        pan: 18,
        muted: false,
        soloed: false,
        waveform: fakeWaveform(28, 4),
      },
    ],
  },
  {
    id: 'song-2',
    title: 'Rented Rooms',
    key: 'D major',
    bpm: 96,
    durationSeconds: 51,
    createdAt: '2026-09-14T18:02:00.000Z',
    coverColor: 'gold',
    masterWaveform: fakeWaveform(48, 5),
    masterLevelDb: -3.1,
    mixQuality: 'needs_work',
    ownerId: mockUser.id,
    isPublic: false,
    plays: 12,
    tracks: [
      {
        id: 'track-lead-2',
        role: 'lead_vocal',
        label: 'Lead vocal',
        sublabel: 'Your take',
        color: 'gold',
        volume: 90,
        pan: 0,
        muted: false,
        soloed: false,
        waveform: fakeWaveform(28, 6),
      },
    ],
  },
];

export const mockLiveSessions: LiveSession[] = [
  {
    id: 'live-1',
    hostId: 'user-amaka',
    title: "Amaka's late-night session",
    isLive: true,
    listenerCount: 214,
    startedAt: '2026-09-26T05:40:00.000Z',
  },
];

export { fakeWaveform };

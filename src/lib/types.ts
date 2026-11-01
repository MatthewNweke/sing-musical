export interface UserProfile {
  id: string;
  displayName: string;
  handle: string;
  avatarUrl: string | null;
  bio: string;
  followerCount: number;
  followingCount: number;
  createdAt: string;
}

export type TrackRole = 'lead_vocal' | 'high_harmony' | 'low_harmony' | 'instrumental' | 'upload';

export interface MixTrack {
  id: string;
  role: TrackRole;
  label: string;
  sublabel: string;
  color: 'mint' | 'harmonyHigh' | 'harmonyLow' | 'gold';
  volume: number;
  pan: number;
  muted: boolean;
  soloed: boolean;
  waveform: number[];
  storagePath?: string | null;
}

export interface Song {
  id: string;
  title: string;
  key: string;
  bpm: number;
  durationSeconds: number;
  createdAt: string;
  coverColor: string;
  masterWaveform: number[];
  masterLevelDb: number;
  mixQuality: 'balanced' | 'needs_work' | 'clipping';
  tracks: MixTrack[];
  ownerId: string;
  isPublic: boolean;
  plays: number;
  genre?: string | null;
  arrangement?: Arrangement | null;
}

export interface LiveSession {
  id: string;
  hostId: string;
  title: string;
  isLive: boolean;
  listenerCount: number;
  startedAt: string | null;
}

// ── Genre & Arrangement ──────────────────────────────────────────────────────

export type GenreId =
  | 'pop' | 'rnb' | 'afrobeats' | 'gospel' | 'hiphop'
  | 'jazz' | 'classical' | 'rock' | 'country' | 'electronic';

export interface Genre {
  id: GenreId;
  label: string;
  emoji: string;
  defaultBpm: number;
  defaultKey: string;
  description: string;
  color: string; // tailwind bg class
}

export interface InstrumentTrack {
  id: string;
  name: string;
  emoji: string;
  color: string;       // hex
  pattern: boolean[];  // 16 steps
  volume: number;      // 0-100
  muted: boolean;
}

export interface Arrangement {
  id: string;
  genre: GenreId;
  bpm: number;
  key: string;
  instruments: InstrumentTrack[];
  suggestedAt: string;
}

// ── Subscription ─────────────────────────────────────────────────────────────

export type PlanId = 'free' | 'creator' | 'pro';

export interface Plan {
  id: PlanId;
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  highlighted: boolean;
}

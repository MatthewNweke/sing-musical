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
  volume: number;   // 0-100
  pan: number;      // -50 (L) to 50 (R)
  muted: boolean;
  soloed: boolean;
  waveform: number[];
  storagePath?: string | null; // Supabase Storage path for real audio
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
}

export interface LiveSession {
  id: string;
  hostId: string;
  title: string;
  isLive: boolean;
  listenerCount: number;
  startedAt: string | null;
}

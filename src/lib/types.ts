// Central domain types. Both the mock service and the Supabase service
// implement DataService using these exact shapes, so screens never know
// or care which one is currently active.

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
  volume: number; // 0-100
  pan: number; // -50 (L) to 50 (R)
  muted: boolean;
  soloed: boolean;
  waveform: number[]; // normalized 0-1 amplitude samples for static rendering
}

export interface Song {
  id: string;
  title: string;
  key: string; // e.g. "A minor"
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

export interface AuthSession {
  userId: string;
  email: string;
}

// Shape returned by the recording pipeline. In mock mode this is generated
// by a timer + Math.sin noise; in real mode it will come from the Web Audio
// API's AnalyserNode reading the MediaStream — same shape either way.
export interface RecorderFrame {
  elapsedMs: number;
  inputLevel: number; // 0-1
  waveformSample: number; // 0-1, most recent amplitude
}

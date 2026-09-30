import type { Song, UserProfile, LiveSession, MixTrack } from '@/lib/types';

// This interface is the seam between the UI and wherever data actually comes
// from. Every screen imports `dataService` from `./index`, never the mock or
// Supabase implementation directly. That means turning on real Supabase
// (VITE_USE_SUPABASE=true in .env) requires touching zero screen code.
export interface DataService {
  // Auth
  getCurrentUser(): Promise<UserProfile | null>;
  signIn(email: string, password: string): Promise<UserProfile>;
  signUp(email: string, password: string, displayName: string): Promise<UserProfile>;
  signOut(): Promise<void>;
  updateProfile(userId: string, patch: Partial<Pick<UserProfile, 'displayName' | 'bio'>>): Promise<UserProfile>;

  // Library
  getSongs(ownerId: string): Promise<Song[]>;
  getSong(songId: string): Promise<Song | null>;
  createSong(partial: Pick<Song, 'title' | 'key' | 'bpm' | 'ownerId'>): Promise<Song>;
  updateTrack(songId: string, trackId: string, patch: Partial<MixTrack>): Promise<MixTrack>;
  deleteSong(songId: string): Promise<void>;
  updateSongVisibility(songId: string, isPublic: boolean): Promise<void>;
  renameSong(songId: string, title: string): Promise<void>;

  // Upload
  uploadAudioFile(file: File, songTitle: string, ownerId: string): Promise<Song>;

  // Live
  getLiveSessions(): Promise<LiveSession[]>;
  startLiveSession(hostId: string, title: string): Promise<LiveSession>;
  endLiveSession(sessionId: string): Promise<void>;

  // Social
  followUser(followerId: string, targetId: string): Promise<void>;
  getFeed(userId: string): Promise<Song[]>;
}

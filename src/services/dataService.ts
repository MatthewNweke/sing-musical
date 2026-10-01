import type { Song, UserProfile, LiveSession, MixTrack } from '@/lib/types';

export interface DataService {
  // Auth
  getCurrentUser(): Promise<UserProfile | null>;
  signIn(email: string, password: string): Promise<UserProfile>;
  // Returns null when Supabase requires email confirmation (user not yet active)
  signUp(email: string, password: string, displayName: string): Promise<UserProfile | null>;
  signOut(): Promise<void>;
  updateProfile(userId: string, patch: Partial<Pick<UserProfile, 'displayName' | 'bio'>>): Promise<UserProfile>;
  resendConfirmation(email: string): Promise<void>;

  // Library
  getSongs(ownerId: string): Promise<Song[]>;
  getSong(songId: string): Promise<Song | null>;
  createSong(partial: Pick<Song, 'title' | 'key' | 'bpm' | 'ownerId'>): Promise<Song>;
  updateTrack(songId: string, trackId: string, patch: Partial<MixTrack>): Promise<MixTrack>;
  deleteSong(songId: string): Promise<void>;
  updateSongVisibility(songId: string, isPublic: boolean): Promise<void>;
  renameSong(songId: string, title: string): Promise<void>;

  // Audio
  uploadAudioFile(file: File, songTitle: string, ownerId: string): Promise<Song>;
  saveRecording(audioBlob: Blob, title: string, ownerId: string): Promise<Song>;
  getAudioUrl(storagePath: string): Promise<string>;

  // Live
  getLiveSessions(): Promise<LiveSession[]>;
  startLiveSession(hostId: string, title: string): Promise<LiveSession>;
  endLiveSession(sessionId: string): Promise<void>;

  // Social
  followUser(followerId: string, targetId: string): Promise<void>;
  getFeed(userId: string): Promise<Song[]>;
}

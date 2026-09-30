import type { DataService } from './dataService';
import type { Song, UserProfile, LiveSession, MixTrack } from '@/lib/types';
import { mockUser, mockSongs, mockLiveSessions, fakeWaveform } from '@/data/mockData';

// In-memory copies so edits (slider drags, new songs) persist for the length
// of the session without needing a backend. Swapped out entirely once
// VITE_USE_SUPABASE=true — see services/index.ts.
let songs: Song[] = JSON.parse(JSON.stringify(mockSongs));
let liveSessions: LiveSession[] = JSON.parse(JSON.stringify(mockLiveSessions));
let currentUser: UserProfile | null = mockUser; // pretend already signed in for demo

const delay = (ms = 250) => new Promise((r) => setTimeout(r, ms));

export const mockDataService: DataService = {
  async getCurrentUser() {
    await delay(80);
    return currentUser;
  },

  async signIn(email) {
    await delay();
    currentUser = { ...mockUser, handle: `@${email.split('@')[0]}` };
    return currentUser;
  },

  async signUp(email, _password, displayName) {
    await delay();
    currentUser = {
      ...mockUser,
      id: `user-${Date.now()}`,
      displayName,
      handle: `@${email.split('@')[0]}`,
      followerCount: 0,
      followingCount: 0,
    };
    return currentUser;
  },

  async signOut() {
    await delay(100);
    currentUser = null;
  },

  async getSongs(ownerId) {
    await delay();
    return songs.filter((s) => s.ownerId === ownerId);
  },

  async getSong(songId) {
    await delay(120);
    return songs.find((s) => s.id === songId) ?? null;
  },

  async createSong({ title, key, bpm, ownerId }) {
    await delay(400);
    const song: Song = {
      id: `song-${Date.now()}`,
      title,
      key,
      bpm,
      durationSeconds: 0,
      createdAt: new Date().toISOString(),
      coverColor: 'mint',
      masterWaveform: fakeWaveform(48, Math.random() * 100),
      masterLevelDb: -6,
      mixQuality: 'needs_work',
      ownerId,
      isPublic: false,
      plays: 0,
      tracks: [
        {
          id: `track-${Date.now()}`,
          role: 'lead_vocal',
          label: 'Lead vocal',
          sublabel: 'Your take',
          color: 'gold',
          volume: 75,
          pan: 0,
          muted: false,
          soloed: false,
          waveform: fakeWaveform(28, Math.random() * 100),
        },
      ],
    };
    songs = [song, ...songs];
    return song;
  },

  async updateTrack(songId, trackId, patch) {
    await delay(60);
    const song = songs.find((s) => s.id === songId);
    if (!song) throw new Error('Song not found');
    const track = song.tracks.find((t) => t.id === trackId);
    if (!track) throw new Error('Track not found');
    Object.assign(track, patch satisfies Partial<MixTrack>);
    return track;
  },

  async deleteSong(songId) {
    await delay();
    songs = songs.filter((s) => s.id !== songId);
  },

  async uploadAudioFile(file, songTitle, ownerId) {
    await delay(900); // pretend to upload + analyze
    const song: Song = {
      id: `song-${Date.now()}`,
      title: songTitle || file.name.replace(/\.[^/.]+$/, ''),
      key: 'C major',
      bpm: 120,
      durationSeconds: 180,
      createdAt: new Date().toISOString(),
      coverColor: 'gold',
      masterWaveform: fakeWaveform(48, Math.random() * 100),
      masterLevelDb: -4,
      mixQuality: 'balanced',
      ownerId,
      isPublic: false,
      plays: 0,
      tracks: [
        {
          id: `track-upload-${Date.now()}`,
          role: 'upload',
          label: 'Uploaded track',
          sublabel: file.name,
          color: 'mint',
          volume: 80,
          pan: 0,
          muted: false,
          soloed: false,
          waveform: fakeWaveform(28, Math.random() * 100),
        },
      ],
    };
    songs = [song, ...songs];
    return song;
  },

  async getLiveSessions() {
    await delay();
    return liveSessions;
  },

  async startLiveSession(hostId, title) {
    await delay(500);
    const session: LiveSession = {
      id: `live-${Date.now()}`,
      hostId,
      title,
      isLive: true,
      listenerCount: 1,
      startedAt: new Date().toISOString(),
    };
    liveSessions = [session, ...liveSessions];
    return session;
  },

  async endLiveSession(sessionId) {
    await delay();
    liveSessions = liveSessions.filter((s) => s.id !== sessionId);
  },

  async followUser() {
    await delay(150);
  },

  async getFeed() {
    await delay();
    return songs.filter((s) => s.isPublic);
  },
};

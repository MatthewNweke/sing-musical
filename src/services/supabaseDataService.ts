import type { DataService } from './dataService';
import type { Song, UserProfile, LiveSession, MixTrack, TrackRole } from '@/lib/types';
import { supabase } from '@/lib/supabaseClient';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type DbRow = Record<string, any>;

// ── Mappers ───────────────────────────────────────────────────────────────────

function mapProfile(row: DbRow): UserProfile {
  return {
    id: row.id,
    displayName: row.display_name,
    handle: row.handle,
    avatarUrl: row.avatar_url ?? null,
    bio: row.bio ?? '',
    followerCount: row.follower_count ?? 0,
    followingCount: row.following_count ?? 0,
    createdAt: row.created_at,
  };
}

function mapTrack(row: DbRow): MixTrack {
  return {
    id: row.id,
    role: row.role as TrackRole,
    label: row.label,
    sublabel: row.sublabel ?? '',
    color: row.color ?? 'mint',
    volume: row.volume ?? 75,
    pan: row.pan ?? 0,
    muted: row.muted ?? false,
    soloed: row.soloed ?? false,
    waveform: row.waveform ?? [],
    storagePath: row.storage_path ?? null,
  };
}

function mapSong(row: DbRow): Song {
  return {
    id: row.id,
    title: row.title,
    key: row.key ?? 'C major',
    bpm: row.bpm ?? 120,
    durationSeconds: row.duration_seconds ?? 0,
    createdAt: row.created_at,
    coverColor: row.cover_color ?? 'mint',
    masterWaveform: row.master_waveform ?? [],
    masterLevelDb: Number(row.master_level_db ?? -6),
    mixQuality: row.mix_quality ?? 'needs_work',
    ownerId: row.owner_id,
    isPublic: row.is_public ?? false,
    plays: row.plays ?? 0,
    tracks: (row.tracks ?? []).map(mapTrack),
  };
}

const SONG_SELECT = '*, tracks(*)';

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Poll for the profile row that the DB trigger creates on signup (max 5 tries). */
async function waitForProfile(userId: string): Promise<UserProfile> {
  for (let i = 0; i < 5; i++) {
    const { data } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle();
    if (data) return mapProfile(data);
    await new Promise((r) => setTimeout(r, 700));
  }
  throw new Error('Profile creation timed out. Please try signing up again.');
}

/** Extract a 48-bar waveform from an audio File using Web Audio API. */
async function extractWaveform(file: File, bars = 48): Promise<number[]> {
  try {
    const buf = await file.arrayBuffer();
    const ctx = new OfflineAudioContext(1, 44100, 44100);
    const decoded = await ctx.decodeAudioData(buf);
    const raw = decoded.getChannelData(0);
    const step = Math.floor(raw.length / bars);
    return Array.from({ length: bars }, (_, i) => {
      let sum = 0;
      for (let j = 0; j < step; j++) sum += Math.abs(raw[i * step + j]);
      return Math.min(1, (sum / step) * 4);
    });
  } catch {
    return [];
  }
}

// ── Service implementation ────────────────────────────────────────────────────

export const supabaseDataService: DataService = {

  // Auth ──────────────────────────────────────────────────────────────────────

  async getCurrentUser() {
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) return null;
    const { data, error } = await supabase.from('profiles').select('*').eq('id', auth.user.id).maybeSingle();
    if (error) throw new Error(error.message);
    return data ? mapProfile(data) : null;
  },

  async signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw new Error(error.message);
    const { data: profile, error: pe } = await supabase.from('profiles').select('*').eq('id', data.user.id).single();
    if (pe) throw new Error(pe.message);
    return mapProfile(profile);
  },

  async signUp(email, password, displayName) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { display_name: displayName } },
    });
    if (error) throw new Error(error.message);
    if (!data.user) throw new Error('Sign up failed — please try again.');

    // Supabase requires email confirmation when identities array is empty
    // or session is null. Return null to signal "check your email".
    const needsConfirmation = !data.session || data.user.identities?.length === 0;
    if (needsConfirmation) return null;

    return waitForProfile(data.user.id);
  },

  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw new Error(error.message);
  },

  async resendConfirmation(email) {
    const { error } = await supabase.auth.resend({ type: 'signup', email });
    if (error) throw new Error(error.message);
  },

  async updateProfile(userId, patch) {
    const dbPatch: Record<string, unknown> = {};
    if (patch.displayName !== undefined) dbPatch.display_name = patch.displayName;
    if (patch.bio !== undefined) dbPatch.bio = patch.bio;
    const { data, error } = await supabase.from('profiles').update(dbPatch).eq('id', userId).select().single();
    if (error) throw new Error(error.message);
    return mapProfile(data);
  },

  // Library ───────────────────────────────────────────────────────────────────

  async getSongs(ownerId) {
    const { data, error } = await supabase
      .from('songs').select(SONG_SELECT).eq('owner_id', ownerId).order('created_at', { ascending: false });
    if (error) throw new Error(error.message);
    return data.map(mapSong);
  },

  async getSong(songId) {
    const { data, error } = await supabase.from('songs').select(SONG_SELECT).eq('id', songId).maybeSingle();
    if (error) throw new Error(error.message);
    return data ? mapSong(data) : null;
  },

  async createSong({ title, key, bpm, ownerId }) {
    const { data, error } = await supabase
      .from('songs').insert({ title, key, bpm, owner_id: ownerId }).select(SONG_SELECT).single();
    if (error) throw new Error(error.message);
    return mapSong(data);
  },

  async updateTrack(_songId, trackId, patch) {
    const dbPatch: Record<string, unknown> = {};
    if (patch.volume !== undefined) dbPatch.volume = patch.volume;
    if (patch.pan !== undefined) dbPatch.pan = patch.pan;
    if (patch.muted !== undefined) dbPatch.muted = patch.muted;
    if (patch.soloed !== undefined) dbPatch.soloed = patch.soloed;
    const { data, error } = await supabase.from('tracks').update(dbPatch).eq('id', trackId).select().single();
    if (error) throw new Error(error.message);
    return mapTrack(data);
  },

  async deleteSong(songId) {
    const { error } = await supabase.from('songs').delete().eq('id', songId);
    if (error) throw new Error(error.message);
  },

  async updateSongVisibility(songId, isPublic) {
    const { error } = await supabase.from('songs').update({ is_public: isPublic }).eq('id', songId);
    if (error) throw new Error(error.message);
  },

  async renameSong(songId, title) {
    const { error } = await supabase.from('songs').update({ title }).eq('id', songId);
    if (error) throw new Error(error.message);
  },

  // Audio ─────────────────────────────────────────────────────────────────────

  async getAudioUrl(storagePath: string): Promise<string> {
    const { data, error } = await supabase.storage.from('audio').createSignedUrl(storagePath, 3600);
    if (error || !data?.signedUrl) throw new Error(error?.message ?? 'Could not get audio URL');
    return data.signedUrl;
  },

  async saveRecording(audioBlob, title, ownerId) {
    const ext = audioBlob.type.includes('ogg') ? 'ogg' : 'webm';
    const storagePath = `${ownerId}/${Date.now()}.${ext}`;

    const { error: upErr } = await supabase.storage
      .from('audio').upload(storagePath, audioBlob, { contentType: audioBlob.type, upsert: false });
    if (upErr) throw new Error(upErr.message);

    const { data: songRow, error: songErr } = await supabase
      .from('songs')
      .insert({ title, owner_id: ownerId, cover_color: 'mint', mix_quality: 'needs_work' })
      .select(SONG_SELECT).single();
    if (songErr) throw new Error(songErr.message);

    const { error: trackErr } = await supabase.from('tracks').insert({
      song_id: songRow.id,
      role: 'lead_vocal',
      label: 'Lead vocal',
      sublabel: 'Your take',
      color: 'gold',
      volume: 75,
      pan: 0,
      storage_path: storagePath,
    });
    if (trackErr) throw new Error(trackErr.message);

    // Re-fetch so tracks array is populated
    const { data: full, error: fetchErr } = await supabase
      .from('songs').select(SONG_SELECT).eq('id', songRow.id).single();
    if (fetchErr) throw new Error(fetchErr.message);
    return mapSong(full);
  },

  async uploadAudioFile(file, songTitle, ownerId) {
    const ext = file.name.split('.').pop() ?? 'audio';
    const storagePath = `${ownerId}/${Date.now()}.${ext}`;

    const { error: upErr } = await supabase.storage
      .from('audio').upload(storagePath, file, { contentType: file.type, upsert: false });
    if (upErr) throw new Error(upErr.message);

    const waveform = await extractWaveform(file);

    const { data: songRow, error: songErr } = await supabase
      .from('songs')
      .insert({
        title: songTitle || file.name.replace(/\.[^/.]+$/, ''),
        owner_id: ownerId,
        cover_color: 'gold',
        master_waveform: waveform,
      })
      .select(SONG_SELECT).single();
    if (songErr) throw new Error(songErr.message);

    await supabase.from('tracks').insert({
      song_id: songRow.id,
      role: 'upload',
      label: 'Uploaded track',
      sublabel: file.name,
      color: 'mint',
      waveform,
      storage_path: storagePath,
    });

    const { data: full, error: fetchErr } = await supabase
      .from('songs').select(SONG_SELECT).eq('id', songRow.id).single();
    if (fetchErr) throw new Error(fetchErr.message);
    return mapSong(full);
  },

  // Live ──────────────────────────────────────────────────────────────────────

  async getLiveSessions() {
    const { data, error } = await supabase
      .from('live_sessions').select('*').eq('is_live', true).order('started_at', { ascending: false });
    if (error) throw new Error(error.message);
    return data.map((row: DbRow) => ({
      id: row.id,
      hostId: row.host_id,
      title: row.title,
      isLive: row.is_live,
      listenerCount: row.listener_count ?? 0,
      startedAt: row.started_at,
    })) as LiveSession[];
  },

  async startLiveSession(hostId, title) {
    const { data, error } = await supabase
      .from('live_sessions').insert({ host_id: hostId, title, is_live: true }).select().single();
    if (error) throw new Error(error.message);
    return {
      id: data.id,
      hostId: data.host_id,
      title: data.title,
      isLive: data.is_live,
      listenerCount: data.listener_count ?? 0,
      startedAt: data.started_at,
    };
  },

  async endLiveSession(sessionId) {
    const { error } = await supabase
      .from('live_sessions')
      .update({ is_live: false, ended_at: new Date().toISOString() })
      .eq('id', sessionId);
    if (error) throw new Error(error.message);
  },

  // Social ────────────────────────────────────────────────────────────────────

  async followUser(followerId, targetId) {
    const { error } = await supabase.from('follows').insert({ follower_id: followerId, followee_id: targetId });
    if (error && !error.message.includes('duplicate')) throw new Error(error.message);
  },

  async getFeed(_userId) {
    const { data, error } = await supabase
      .from('songs').select(SONG_SELECT).eq('is_public', true).order('created_at', { ascending: false }).limit(50);
    if (error) throw new Error(error.message);
    return data.map(mapSong);
  },
};
